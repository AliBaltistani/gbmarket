require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const xss = require('xss');
const db = require('./db/db');
const requireAdmin = require('./middleware/requireAdmin');

// ==========================================
// C1: XSS SANITIZATION HELPER
// ==========================================
const sanitizeValue = (val) => {
    if (typeof val === 'string') return xss(val);
    if (Array.isArray(val)) return val.map(sanitizeValue);
    if (val && typeof val === 'object') {
        const cleaned = {};
        for (const [k, v] of Object.entries(val)) {
            cleaned[k] = sanitizeValue(v);
        }
        return cleaned;
    }
    return val;
};

// ==========================================
// STARTUP VALIDATION
// ==========================================
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('replace_this')) {
    console.error('FATAL: JWT_SECRET environment variable is not set or is still the default placeholder. Please set a secure value in your .env file.');
    process.exit(1);
}

const app = express();

// ==========================================
// S4: SECURITY HEADERS (Helmet)
// ==========================================
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow image loading cross-origin
    contentSecurityPolicy: false // Disable CSP for now (SPA serves its own)
}));

// ==========================================
// S5: STRICT CORS CONFIGURATION
// ==========================================
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map(origin => origin.trim());

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

// ==========================================
// S8: JSON BODY SIZE LIMIT
// ==========================================
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// C1: Sanitize all incoming request body strings
app.use((req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeValue(req.body);
    }
    next();
});

// ==========================================
// STATIC FILE SERVING
// ==========================================
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
app.use('/uploads', express.static(uploadDir));

// ==========================================
// S6 & S7: SECURE MULTER CONFIG
// ==========================================
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    // S7: UUID-based filenames to prevent path traversal and collisions
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const safeExt = ALLOWED_EXTENSIONS.includes(ext) ? ext : '.png';
        cb(null, `${uuidv4()}${safeExt}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        // S6: Validate MIME type against whitelist (not just startsWith)
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'));
        }
    }
});

// ==========================================
// S3: RATE LIMITING
// ==========================================
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per window
    message: { error: 'Too many login attempts. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false
});

const generalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 120, // 120 requests per minute
    message: { error: 'Too many requests. Please slow down.' },
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/api/', generalLimiter);

// ==========================================
// HELPER FUNCTIONS
// ==========================================
const parseJSON = (str) => {
    try { return JSON.parse(str); } catch (e) { return null; }
};

// S9: Safe error message — never expose internal details to client
const safeErrorMessage = (error, fallback = 'An unexpected error occurred') => {
    // Only expose known, safe error messages
    if (error.message && (
        error.message.includes('UNIQUE constraint') ||
        error.message.includes('Insufficient stock') ||
        error.message.includes('not found') ||
        error.message.includes('required')
    )) {
        return error.message;
    }
    return fallback;
};

// ==========================================
// HEALTH CHECK
// ==========================================
app.get('/api/health', (req, res) => {
    try {
        // Verify DB is accessible
        db.prepare('SELECT 1').get();
        res.json({ status: 'GBMarket API is running', database: 'connected' });
    } catch (error) {
        res.status(503).json({ status: 'GBMarket API is running', database: 'disconnected' });
    }
});

// ==========================================
// AUTH & UPLOAD ENDPOINTS
// ==========================================

// POST /api/auth/login — S3: Rate limited
app.post('/api/auth/login', authLimiter, (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);

        if (!user || !bcrypt.compareSync(password, user.password_hash)) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, username: user.username });
    } catch (error) {
        next(error);
    }
});

// GET /api/auth/me
app.get('/api/auth/me', requireAdmin, (req, res) => {
    res.json({ username: req.admin.username });
});

// PUT /api/auth/change-password (F4: Admin password change)
app.put('/api/auth/change-password', requireAdmin, (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'New password must be at least 8 characters long' });
        }

        const user = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(req.admin.id);
        if (!user || !bcrypt.compareSync(currentPassword, user.password_hash)) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        const newHash = bcrypt.hashSync(newPassword, 12);
        db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').run(newHash, req.admin.id);

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        next(error);
    }
});

// POST /api/upload
app.post('/api/upload', requireAdmin, upload.single('image'), (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No image provided' });
        const imageUrl = `/uploads/${req.file.filename}`;
        res.status(201).json({ url: imageUrl });
    } catch (error) {
        next(error);
    }
});

// ==========================================
// SETTINGS ENDPOINTS
// ==========================================

// GET /api/settings (public)
app.get('/api/settings', (req, res, next) => {
    try {
        const settingsRows = db.prepare('SELECT * FROM settings').all();
        const settingsObj = {};
        for (let row of settingsRows) {
            settingsObj[row.key] = row.value;
        }
        res.json(settingsObj);
    } catch (error) {
        next(error);
    }
});

// PUT /api/settings (admin)
app.put('/api/settings', requireAdmin, (req, res, next) => {
    try {
        const payload = req.body;
        const updateSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');

        const trx = db.transaction(() => {
            for (const [key, value] of Object.entries(payload)) {
                updateSetting.run(key, typeof value === 'string' ? value : String(value));
            }
        });
        trx();

        const settingsRows = db.prepare('SELECT * FROM settings').all();
        const settingsObj = {};
        for (let row of settingsRows) {
            settingsObj[row.key] = row.value;
        }
        res.json(settingsObj);
    } catch (error) {
        next(error);
    }
});

// ==========================================
// CATEGORIES ENDPOINTS
// ==========================================

// GET /api/categories (public, with product count)
app.get('/api/categories', (req, res, next) => {
    try {
        const categories = db.prepare(`
            SELECT c.*, COUNT(p.id) as productCount
            FROM categories c
            LEFT JOIN products p ON p.category_id = c.id
            GROUP BY c.id
            ORDER BY c.name ASC
        `).all();
        res.json(categories);
    } catch (error) {
        next(error);
    }
});

// POST /api/categories (admin)
app.post('/api/categories', requireAdmin, (req, res, next) => {
    try {
        const { name, slug } = req.body;
        if (!name || !slug) return res.status(400).json({ error: 'Name and slug are required' });

        const stmt = db.prepare('INSERT INTO categories (name, slug) VALUES (?, ?)');
        const info = stmt.run(name, slug);
        res.status(201).json({ id: info.lastInsertRowid, name, slug });
    } catch (error) {
        if (error.message.includes('UNIQUE constraint')) {
            return res.status(409).json({ error: 'A category with this slug already exists' });
        }
        next(error);
    }
});

// PUT /api/categories/:id (admin)
app.put('/api/categories/:id', requireAdmin, (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, slug } = req.body;
        if (!name || !slug) return res.status(400).json({ error: 'Name and slug are required' });

        const stmt = db.prepare('UPDATE categories SET name = ?, slug = ? WHERE id = ?');
        const info = stmt.run(name, slug, id);
        if (info.changes === 0) return res.status(404).json({ error: 'Category not found' });
        res.json({ id: Number(id), name, slug });
    } catch (error) {
        if (error.message.includes('UNIQUE constraint')) {
            return res.status(409).json({ error: 'A category with this slug already exists' });
        }
        next(error);
    }
});

// DELETE /api/categories/:id (admin)
app.delete('/api/categories/:id', requireAdmin, (req, res, next) => {
    try {
        const { id } = req.params;
        const stmt = db.prepare('DELETE FROM categories WHERE id = ?');
        const info = stmt.run(id);
        if (info.changes === 0) return res.status(404).json({ error: 'Category not found' });
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        next(error);
    }
});


// ==========================================
// PRODUCTS ENDPOINTS
// ==========================================

// GET /api/products (public)
app.get('/api/products', (req, res, next) => {
    try {
        const { category, search, featured } = req.query;

        let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE 1=1
    `;
        const params = [];

        if (category) {
            query += ' AND c.slug = ?';
            params.push(category);
        }

        if (search) {
            query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        if (featured === 'true') {
            query += ' AND p.is_featured = 1';
        }

        query += ' ORDER BY p.id DESC';

        const products = db.prepare(query).all(...params).map(p => ({
            ...p,
            weight_options: parseJSON(p.weight_options)
        }));

        res.json(products);
    } catch (error) {
        next(error);
    }
});

// GET /api/products/:slug (public)
app.get('/api/products/:slug', (req, res, next) => {
    try {
        const { slug } = req.params;
        const product = db.prepare(`
      SELECT p.*, c.name as category_name, c.slug as category_slug 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.slug = ?
    `).get(slug);

        if (!product) return res.status(404).json({ error: 'Product not found' });

        product.weight_options = parseJSON(product.weight_options);
        res.json(product);
    } catch (error) {
        next(error);
    }
});

// POST /api/products (admin)
app.post('/api/products', requireAdmin, (req, res, next) => {
    try {
        const {
            name, slug, description, category_id, image_url, base_price, stock, weight_options, is_featured, rating, review_count
        } = req.body;

        // Validate required fields
        if (!name || !slug) return res.status(400).json({ error: 'Product name and slug are required' });
        if (base_price === undefined || base_price === null || Number(base_price) < 0) {
            return res.status(400).json({ error: 'A valid base price is required' });
        }

        const stmt = db.prepare(`
      INSERT INTO products (
        name, slug, description, category_id, image_url, base_price, stock, weight_options, is_featured, rating, review_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        const info = stmt.run(
            name, slug, description, category_id || null, image_url, Number(base_price),
            stock || 0,
            typeof weight_options === 'string' ? weight_options : JSON.stringify(weight_options),
            is_featured || 0,
            rating ? Number(rating) : 4.8,
            review_count ? Number(review_count) : 0
        );

        res.status(201).json({ id: info.lastInsertRowid, message: 'Product created successfully' });
    } catch (error) {
        if (error.message.includes('UNIQUE constraint')) {
            return res.status(409).json({ error: 'A product with this slug already exists. Please use a different name.' });
        }
        next(error);
    }
});

// PUT /api/products/:id (admin)
app.put('/api/products/:id', requireAdmin, (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            name, slug, description, category_id, image_url, base_price, stock, weight_options, is_featured, rating, review_count
        } = req.body;

        const stmt = db.prepare(`
      UPDATE products SET 
        name = ?, slug = ?, description = ?, category_id = ?, image_url = ?, 
        base_price = ?, stock = ?, weight_options = ?, is_featured = ?,
        rating = ?, review_count = ?
      WHERE id = ?
    `);

        const info = stmt.run(
            name, slug, description, category_id, image_url, base_price,
            stock,
            typeof weight_options === 'string' ? weight_options : JSON.stringify(weight_options),
            is_featured,
            rating !== undefined ? Number(rating) : 4.8,
            review_count !== undefined ? Number(review_count) : 0,
            id
        );

        if (info.changes === 0) return res.status(404).json({ error: 'Product not found' });
        res.json({ message: 'Product updated successfully' });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/products/:id (admin)
app.delete('/api/products/:id', requireAdmin, (req, res, next) => {
    try {
        const { id } = req.params;
        const stmt = db.prepare('DELETE FROM products WHERE id = ?');
        const info = stmt.run(id);

        if (info.changes === 0) return res.status(404).json({ error: 'Product not found' });
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        next(error);
    }
});

// ==========================================
// ORDERS ENDPOINTS
// ==========================================

// GET /api/orders (admin — optimized: single query for items)
app.get('/api/orders', requireAdmin, (req, res, next) => {
    try {
        const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
        const allItems = db.prepare('SELECT * FROM order_items').all();

        // Group items by order_id in a single pass
        const itemsByOrderId = {};
        for (const item of allItems) {
            if (!itemsByOrderId[item.order_id]) itemsByOrderId[item.order_id] = [];
            itemsByOrderId[item.order_id].push(item);
        }

        const ordersWithItems = orders.map(order => ({
            ...order,
            items: itemsByOrderId[order.id] || []
        }));

        res.json(ordersWithItems);
    } catch (error) {
        next(error);
    }
});

// POST /api/orders (public — B1: server-side price lookup, B2: server-side shipping, B5: atomic stock)
app.post('/api/orders', (req, res, next) => {
    try {
        const { customer_name, customer_email, phone, address, payment_method, items } = req.body;

        if (!customer_name || !phone || !address) {
            return res.status(400).json({ error: 'Customer name, phone, and address are required' });
        }
        if (!items || !items.length) {
            return res.status(400).json({ error: 'Order must contain at least one item' });
        }

        const processOrder = db.transaction((orderData, itemsData) => {
            const getProduct = db.prepare('SELECT id, name, stock, base_price, weight_options FROM products WHERE id = ?');
            // B5: Atomic stock decrement — uses WHERE stock >= ? to prevent negative stock
            const decrementStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?');

            // B1: Server-side price lookup — NEVER trust client-provided prices
            let serverSubtotal = 0;
            const validatedItems = [];

            for (const item of itemsData) {
                const product = getProduct.get(item.product_id);
                if (!product) {
                    throw new Error(`Product with ID ${item.product_id} not found`);
                }

                // Look up the correct price from DB weight_options
                let serverPrice = product.base_price;
                const weightOptions = parseJSON(product.weight_options);
                if (weightOptions && item.weight_option) {
                    const matchedOption = weightOptions.find(opt => opt.label === item.weight_option);
                    if (matchedOption) {
                        serverPrice = matchedOption.price;
                    }
                }

                const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));

                // B5: Validate and decrement stock atomically
                const stockResult = decrementStock.run(quantity, product.id, quantity);
                if (stockResult.changes === 0) {
                    // Get fresh stock count for error message
                    const freshProduct = getProduct.get(item.product_id);
                    throw new Error(`Insufficient stock for "${product.name}". Available: ${freshProduct ? freshProduct.stock : 0}, Requested: ${quantity}`);
                }

                serverSubtotal += serverPrice * quantity;
                validatedItems.push({
                    product_id: product.id,
                    product_name: product.name,
                    weight_option: item.weight_option || 'Standard',
                    quantity: quantity,
                    price: serverPrice
                });
            }

            // B2: Calculate shipping fee server-side using DB settings
            const thresholdRow = db.prepare("SELECT value FROM settings WHERE key = 'free_shipping_threshold'").get();
            const freeShippingThreshold = thresholdRow ? Number(thresholdRow.value) : 5000;
            const shippingFee = serverSubtotal >= freeShippingThreshold ? 0 : 350;
            const grandTotal = serverSubtotal + shippingFee;

            // B8: Store subtotal, shipping, and grand total separately
            const insertOrder = db.prepare(`
                INSERT INTO orders (customer_name, customer_email, phone, address, subtotal, shipping_fee, total, payment_method)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);
            const orderInfo = insertOrder.run(
                orderData.customer_name, orderData.customer_email || null, orderData.phone, orderData.address,
                serverSubtotal, shippingFee, grandTotal,
                orderData.payment_method || 'COD'
            );
            const orderId = orderInfo.lastInsertRowid;

            // Insert validated order items with server-verified prices
            const insertItem = db.prepare(`
                INSERT INTO order_items (order_id, product_id, product_name, weight_option, quantity, price)
                VALUES (?, ?, ?, ?, ?, ?)
            `);

            for (const item of validatedItems) {
                insertItem.run(orderId, item.product_id, item.product_name, item.weight_option, item.quantity, item.price);
            }

            return orderId;
        });

        const newOrderId = processOrder({ customer_name, customer_email, phone, address, payment_method }, items);
        res.status(201).json({ id: newOrderId, message: 'Order created successfully' });
    } catch (error) {
        // Surface stock/product-not-found errors to client
        if (error.message.includes('Insufficient stock') || error.message.includes('not found')) {
            return res.status(400).json({ error: error.message });
        }
        next(error);
    }
});

// PATCH /api/orders/:id/status (admin — B4: enforces status transitions)
app.patch('/api/orders/:id/status', requireAdmin, (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }

        const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        // B4: Enforce valid status transitions
        const validTransitions = {
            'Pending': ['Processing', 'Cancelled'],
            'Processing': ['Shipped', 'Cancelled'],
            'Shipped': ['Delivered', 'Cancelled'],
            'Delivered': [], // Terminal state
            'Cancelled': []  // Terminal state
        };

        const allowed = validTransitions[order.status] || [];
        if (!allowed.includes(status)) {
            return res.status(400).json({
                error: `Cannot transition from "${order.status}" to "${status}". Allowed: ${allowed.length ? allowed.join(', ') : 'none (terminal state)'}`
            });
        }

        // If cancelling, restore stock
        if (status === 'Cancelled' && order.status !== 'Cancelled') {
            const restoreStock = db.transaction(() => {
                const orderItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);
                const incrementStock = db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?');
                for (const item of orderItems) {
                    incrementStock.run(item.quantity, item.product_id);
                }
                db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
            });
            restoreStock();
        } else {
            db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
        }

        res.json({ message: 'Order status updated successfully' });
    } catch (error) {
        next(error);
    }
});

// ==========================================
// C7: API 404 CATCH-ALL
// ==========================================
app.use('/api', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// ==========================================
// S9 & C10: GLOBAL ERROR HANDLER
// ==========================================
app.use((err, req, res, next) => {
    // Log full error server-side for debugging
    console.error(`[${new Date().toISOString()}] ERROR ${req.method} ${req.originalUrl}:`, err.message);

    // Handle Multer-specific errors
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ error: 'File is too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
    }

    // Handle CORS errors
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ error: 'Origin not allowed' });
    }

    // Handle known validation/business errors
    if (err.message.includes('Only JPEG') || err.message.includes('Only images')) {
        return res.status(400).json({ error: err.message });
    }

    // S9: Generic error — never expose internal details
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        error: statusCode === 500 ? 'Internal server error' : safeErrorMessage(err)
    });
});

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));