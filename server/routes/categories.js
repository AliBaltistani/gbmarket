const express = require('express');

module.exports = function (db, requireAdmin) {
    const router = express.Router();

    // GET /api/categories (public, with product count)
    router.get('/', (req, res, next) => {
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
    router.post('/', requireAdmin, (req, res, next) => {
        try {
            const { name, slug, image_url } = req.body;
            if (!name || !slug) return res.status(400).json({ error: 'Name and slug are required' });
            const stmt = db.prepare('INSERT INTO categories (name, slug, image_url) VALUES (?, ?, ?)');
            const info = stmt.run(name, slug, image_url || null);
            res.status(201).json({ id: info.lastInsertRowid, name, slug, image_url: image_url || null });
        } catch (error) {
            if (error.message.includes('UNIQUE constraint')) {
                return res.status(409).json({ error: 'A category with this slug already exists' });
            }
            next(error);
        }
    });

    // POST /api/categories/bulk-import (admin)
    router.post('/bulk-import', requireAdmin, (req, res, next) => {
        try {
            const { categories } = req.body;
            if (!Array.isArray(categories) || categories.length === 0) {
                return res.status(400).json({ error: 'categories array is required' });
            }

            const stmt = db.prepare('INSERT OR IGNORE INTO categories (name, slug, image_url) VALUES (?, ?, ?)');
            const results = { imported: 0, skipped: 0, errors: [] };

            const importAll = db.transaction(() => {
                for (const cat of categories) {
                    const name = (cat.name || '').trim();
                    if (!name) { results.errors.push(`Row skipped: name is required`); continue; }
                    const slug = (cat.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')).trim();
                    try {
                        const info = stmt.run(name, slug, cat.image_url || null);
                        if (info.changes > 0) results.imported++;
                        else results.skipped++;
                    } catch (e) {
                        results.errors.push(`"${name}": ${e.message}`);
                    }
                }
            });

            importAll();
            res.json({ message: `Import complete`, ...results });
        } catch (error) { next(error); }
    });

    // PUT /api/categories/:id (admin)
    router.put('/:id', requireAdmin, (req, res, next) => {
        try {
            const { id } = req.params;
            const { name, slug, image_url } = req.body;
            if (!name || !slug) return res.status(400).json({ error: 'Name and slug are required' });
            const stmt = db.prepare('UPDATE categories SET name = ?, slug = ?, image_url = ? WHERE id = ?');
            const info = stmt.run(name, slug, image_url || null, id);
            if (info.changes === 0) return res.status(404).json({ error: 'Category not found' });
            res.json({ id: Number(id), name, slug, image_url: image_url || null });
        } catch (error) {
            if (error.message.includes('UNIQUE constraint')) {
                return res.status(409).json({ error: 'A category with this slug already exists' });
            }
            next(error);
        }
    });

    // DELETE /api/categories/:id (admin)
    router.delete('/:id', requireAdmin, (req, res, next) => {
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

    return router;
};
