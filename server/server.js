require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db/db'); // Load database connection

const app = express();
app.use(cors());
app.use(express.json());

// Helper function to build dynamic queries
const parseJSON = (str) => {
    try { return JSON.parse(str); } catch (e) { return null; }
};

app.get('/api/health', (req, res) => {
    res.json({ status: 'GBMarket API is running' });
});

// ==========================================
// CATEGORIES ENDPOINTS
// ==========================================

// GET /api/categories
app.get('/api/categories', (req, res) => {
    try {
        const categories = db.prepare('SELECT * FROM categories').all();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/categories
app.post('/api/categories', (req, res) => {
    try {
        const { name, slug } = req.body;
        if (!name || !slug) return res.status(400).json({ error: 'Name and slug are required' });

        const stmt = db.prepare('INSERT INTO categories (name, slug) VALUES (?, ?)');
        const info = stmt.run(name, slug);
        res.status(201).json({ id: info.lastInsertRowid, name, slug });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE /api/categories/:id
app.delete('/api/categories/:id', (req, res) => {
    try {
        const { id } = req.params;
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
        const { category, search } = req.query;

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
app.post('/api/products', (req, res) => {
    try {
        const {
            name, slug, description, category_id, image_url, base_price, stock, weight_options, is_featured
        } = req.body;

        const stmt = db.prepare(`
      INSERT INTO products (
        name, slug, description, category_id, image_url, base_price, stock, weight_options, is_featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        const info = stmt.run(
            name, slug, description, category_id, image_url, base_price,
            stock || 0,
            typeof weight_options === 'string' ? weight_options : JSON.stringify(weight_options),
            is_featured || 0
        );

        res.status(201).json({ id: info.lastInsertRowid, message: 'Product created successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT /api/products/:id
app.put('/api/products/:id', (req, res) => {
    try {
        const { id } = req.params;
        const {
            name, slug, description, category_id, image_url, base_price, stock, weight_options, is_featured
        } = req.body;

        const stmt = db.prepare(`
      UPDATE products SET 
        name = ?, slug = ?, description = ?, category_id = ?, image_url = ?, 
        base_price = ?, stock = ?, weight_options = ?, is_featured = ?
      WHERE id = ?
    `);

        const info = stmt.run(
            name, slug, description, category_id, image_url, base_price,
            stock,
            typeof weight_options === 'string' ? weight_options : JSON.stringify(weight_options),
            is_featured,
            id
        );

        if (info.changes === 0) return res.status(404).json({ error: 'Product not found' });
        res.json({ message: 'Product updated successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE /api/products/:id
app.delete('/api/products/:id', (req, res) => {
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));