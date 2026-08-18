require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { getUploadMiddleware, isCloudinaryConfigured } = require('./config/cloudinary');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const xss = require('xss');
const morgan = require('morgan');
const db = require('./db/db');
const requireAdmin = require('./middleware/requireAdmin');
const { safeErrorMessage } = require('./helpers');

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

if (isCloudinaryConfigured()) {
    console.log('✅ Using Cloudinary for image storage');
} else {
    console.log('⚠️ Using local disk storage (dev fallback) — set CLOUDINARY_* env vars in .env for production');
}

const app = express();

// ==========================================
// S0: TRUST PROXY (REQUIRED FOR RATE LIMITING BEHIND REVERSE PROXIES)
// ==========================================
// Enable trusting the immediate proxy so `express-rate-limit` identifies client IPs
// correctly (avoids blocking all users as one IP when deployed on Render, Vercel, etc.)
app.set('trust proxy', 1);

// ==========================================
// S4: SECURITY HEADERS (Helmet)
// ==========================================
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false
}));

// F10: Structured HTTP request logging
app.use(morgan(':date[iso] :method :url :status :res[content-length] - :response-time ms'));

// ==========================================
// S5: STRICT CORS CONFIGURATION
// ==========================================
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map(origin => origin.trim());

app.use(cors({
    origin: function (origin, callback) {
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
const upload = getUploadMiddleware('general');

// ==========================================
// S3: RATE LIMITING
// ==========================================
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Too many login attempts. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false
});

const generalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 120,
    message: { error: 'Too many requests. Please slow down.' },
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/api/', generalLimiter);

// ==========================================
// HEALTH CHECK
// ==========================================
app.get('/api/health', (req, res) => {
    try {
        db.prepare('SELECT 1').get();
        const storeName = db.prepare('SELECT value FROM settings WHERE key = ?').get('store_name')?.value || 'Store';
        res.json({ status: `${storeName} API is running`, database: 'connected' });
    } catch (error) {
        res.status(503).json({ status: 'API is running', database: 'disconnected' });
    }
});

// ==========================================
// C2: MOUNT ROUTE MODULES
// ==========================================
app.use('/api/auth', require('./routes/auth')(db, requireAdmin, authLimiter));
app.use('/api/upload', require('./routes/upload')(db, requireAdmin, upload));
app.use('/api/settings', require('./routes/settings')(db, requireAdmin));
app.use('/api/categories', require('./routes/categories')(db, requireAdmin));
app.use('/api/products', require('./routes/products')(db, requireAdmin));
app.use('/api/orders', require('./routes/orders')(db, requireAdmin));
app.use('/api/contact', require('./routes/contact')(db));
app.use('/api/homepage', require('./routes/homepage')(db, requireAdmin));
app.use('/api/payments', require('./routes/payments')(db, requireAdmin, upload));
app.use('/api/chatbot', require('./routes/chatbot')(db));
app.use('/api/reviews', require('./routes/reviews')(db, requireAdmin));
app.use('/sitemap.xml', require('./routes/sitemap')(db));
app.use('/robots.txt', require('./routes/robots')(db));

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
    console.error(`[${new Date().toISOString()}] ERROR ${req.method} ${req.originalUrl}:`, err.message);

    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ error: 'File is too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
    }

    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ error: 'Origin not allowed' });
    }

    if (err.message.includes('Only JPEG') || err.message.includes('Only images')) {
        return res.status(400).json({ error: err.message });
    }

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