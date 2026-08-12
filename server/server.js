require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const db = require('./db/db');
const requireAdmin = require('./middleware/requireAdmin');

// Fail fast if JWT_SECRET is not configured
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'replace_this_with_a_long_random_string') {
    console.error('FATAL: JWT_SECRET environment variable is not set or is still the default placeholder. Please set a secure value in your .env file.');
    process.exit(1);
}

const app = express();
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

// Set up /uploads directory and static serving
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
app.use('/uploads', express.static(uploadDir));

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only images are allowed'));
    }
});

// Helper function to build dynamic queries
const parseJSON = (str) => {
    try { return JSON.parse(str); } catch (e) { return null; }
};

app.get('/api/health', (req, res) => {
    res.json({ status: 'GBMarket API is running' });
});

// ==========================================
// AUTH & UPLOAD ENDPOINTS
// ==========================================

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
    try {
        const { username, password } = req.body;
        const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);

        if (!user || !bcrypt.compareSync(password, user.password_hash)) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, username: user.username });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/auth/me
app.get('/api/auth/me', requireAdmin, (req, res) => {
    res.json({ username: req.admin.username });
});

// POST /api/upload
app.post('/api/upload', requireAdmin, upload.single('image'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No image provided' });
        // Return relative URL so it works in any environment
        const imageUrl = `/uploads/${req.file.filename}`;
        res.status(201).json({ url: imageUrl });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ==========================================
// SETTINGS ENDPOINTS
// ==========================================

// GET /api/settings
app.get('/api/settings', (req, res) => {
    try {
        const settingsRows = db.prepare('SELECT * FROM settings').all();
        const settingsObj = {};
        for (let row of settingsRows) {
            settingsObj[row.key] = row.value;
        }
        res.json(settingsObj);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/settings
app.put('/api/settings', requireAdmin, (req, res) => {
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
        res.status(400).json({ error: error.message });
    }
});

// ==========================================
// CATEGORIES ENDPOINTS
// ==========================================

// GET /api/categories (with product count)
app.get('/api/categories', (req, res) => {
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
        res.status(500).json({ error: error.message });
    }
});

// POST /api/categories
app.post('/api/categories', requireAdmin, (req, res) => {
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
        res.status(400).json({ error: error.message });
    }
});

// PUT /api/categories/:id
app.put('/api/categories/:id', requireAdmin, (req, res) => {
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
        res.status(400).json({ error: error.message });
    }
});

// DELETE /api/categories/:id
app.delete('/api/categories/:id', requireAdmin, (req, res) => {
    try {
        const { id } = req.params;
        // With ON DELETE SET NULL, products under this category will become uncategorized
        const stmt = db.prepare('DELETE FROM categories WHERE id = ?');
        const info = stmt.run(id);
        if (info.changes === 0) return res.status(404).json({ error: 'Category not found' });
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// ==========================================
// PRODUCTS ENDPOINTS
// ==========================================

// GET /api/products
app.get('/api/products', (req, res) => {
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
        res.status(500).json({ error: error.message });
    }
});

// GET /api/products/:slug
app.get('/api/products/:slug', (req, res) => {
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
        res.status(500).json({ error: error.message });
    }
});

// POST /api/products
app.post('/api/products', requireAdmin, (req, res) => {
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
            review_count ? Number(review_count) : 25
        );

        res.status(201).json({ id: info.lastInsertRowid, message: 'Product created successfully' });
    } catch (error) {
        if (error.message.includes('UNIQUE constraint')) {
            return res.status(409).json({ error: 'A product with this slug already exists. Please use a different name.' });
        }
        res.status(400).json({ error: error.message });
    }
});

// PUT /api/products/:id
app.put('/api/products/:id', requireAdmin, (req, res) => {
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
            review_count !== undefined ? Number(review_count) : 25,
            id
        );

        if (info.changes === 0) return res.status(404).json({ error: 'Product not found' });
        res.json({ message: 'Product updated successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE /api/products/:id
app.delete('/api/products/:id', requireAdmin, (req, res) => {
    try {
        const { id } = req.params;
        const stmt = db.prepare('DELETE FROM products WHERE id = ?');
        const info = stmt.run(id);

        if (info.changes === 0) return res.status(404).json({ error: 'Product not found' });
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// ORDERS ENDPOINTS
// ==========================================

// GET /api/orders (optimized: single query for items)
app.get('/api/orders', requireAdmin, (req, res) => {
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
        res.status(500).json({ error: error.message });
    }
});

// POST /api/orders (with stock validation & server-side total)
app.post('/api/orders', (req, res) => {
    try {
        const { customer_name, phone, address, payment_method, items } = req.body;

        if (!customer_name || !phone || !address) {
            return res.status(400).json({ error: 'Customer name, phone, and address are required' });
        }
        if (!items || !items.length) {
            return res.status(400).json({ error: 'Order must contain at least one item' });
        }

        const processOrder = db.transaction((orderData, itemsData) => {
            const getProduct = db.prepare('SELECT id, stock, base_price FROM products WHERE id = ?');

            // 1. Validate stock for all items first
            for (const item of itemsData) {
                const product = getProduct.get(item.product_id);
                if (!product) {
                    throw new Error(`Product with ID ${item.product_id} not found`);
                }
                if (product.stock < item.quantity) {
                    throw new Error(`Insufficient stock for "${item.product_name}". Available: ${product.stock}, Requested: ${item.quantity}`);
                }
            }

            // 2. Calculate order total server-side (don't trust client)
            let serverTotal = 0;
            for (const item of itemsData) {
                serverTotal += Number(item.price) * Number(item.quantity);
            }

            // 3. Insert Order with server-calculated total
            const insertOrder = db.prepare(`
                INSERT INTO orders (customer_name, phone, address, total, payment_method)
                VALUES (?, ?, ?, ?, ?)
            `);
            const orderInfo = insertOrder.run(
                orderData.customer_name, orderData.phone, orderData.address, serverTotal, orderData.payment_method || 'COD'
            );
            const orderId = orderInfo.lastInsertRowid;

            // 4. Insert Order Items & Decrement Stock
            const insertItem = db.prepare(`
                INSERT INTO order_items (order_id, product_id, product_name, weight_option, quantity, price)
                VALUES (?, ?, ?, ?, ?, ?)
            `);
            const decrementStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

            for (const item of itemsData) {
                insertItem.run(orderId, item.product_id, item.product_name, item.weight_option, item.quantity, item.price);
                decrementStock.run(item.quantity, item.product_id);
            }

            return orderId;
        });

        const newOrderId = processOrder({ customer_name, phone, address, payment_method }, items);
        res.status(201).json({ id: newOrderId, message: 'Order created successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PATCH /api/orders/:id/status (supports Cancelled with stock restoration)
app.patch('/api/orders/:id/status', requireAdmin, (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }

        const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

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
        res.status(400).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));