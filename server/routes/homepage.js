const express = require('express');

module.exports = function (db, requireAdmin) {
    const router = express.Router();

    // GET /api/homepage (public) — visible sections ordered by sort_order
    router.get('/', (req, res, next) => {
        try {
            const sections = db.prepare(
                'SELECT * FROM homepage_sections WHERE is_visible = 1 ORDER BY sort_order ASC'
            ).all();
            const parsed = sections.map(s => ({
                ...s,
                config: JSON.parse(s.config || '{}')
            }));
            res.json(parsed);
        } catch (error) {
            next(error);
        }
    });

    // GET /api/homepage/admin (admin) — ALL sections including hidden
    router.get('/admin', requireAdmin, (req, res, next) => {
        try {
            const sections = db.prepare(
                'SELECT * FROM homepage_sections ORDER BY sort_order ASC'
            ).all();
            const parsed = sections.map(s => ({
                ...s,
                config: JSON.parse(s.config || '{}')
            }));
            res.json(parsed);
        } catch (error) {
            next(error);
        }
    });

    // POST /api/homepage (admin) — create a new section
    router.post('/', requireAdmin, (req, res, next) => {
        try {
            const { section_type, title, config } = req.body;
            if (!section_type) {
                return res.status(400).json({ error: 'section_type is required' });
            }

            const validTypes = ['hero_banner', 'product_carousel', 'product_grid', 'category_showcase', 'banner_image', 'promo_cards', 'reviews'];
            if (!validTypes.includes(section_type)) {
                return res.status(400).json({ error: `Invalid section_type. Must be one of: ${validTypes.join(', ')}` });
            }

            // Get the max sort_order to append at the end
            const maxRow = db.prepare('SELECT MAX(sort_order) as maxOrder FROM homepage_sections').get();
            const nextOrder = (maxRow.maxOrder ?? -1) + 1;

            const configStr = typeof config === 'string' ? config : JSON.stringify(config || {});

            const result = db.prepare(
                'INSERT INTO homepage_sections (section_type, title, config, sort_order) VALUES (?, ?, ?, ?)'
            ).run(section_type, title || '', configStr, nextOrder);

            const newSection = db.prepare('SELECT * FROM homepage_sections WHERE id = ?').get(result.lastInsertRowid);
            res.status(201).json({
                ...newSection,
                config: JSON.parse(newSection.config || '{}')
            });
        } catch (error) {
            next(error);
        }
    });

    // PUT /api/homepage/reorder (admin) — bulk update sort_order
    // Body: { order: [id1, id2, id3, ...] }
    router.put('/reorder', requireAdmin, (req, res, next) => {
        try {
            const { order } = req.body;
            if (!Array.isArray(order)) {
                return res.status(400).json({ error: 'order must be an array of section IDs' });
            }

            const updateOrder = db.prepare('UPDATE homepage_sections SET sort_order = ? WHERE id = ?');
            const trx = db.transaction(() => {
                order.forEach((id, index) => {
                    updateOrder.run(index, id);
                });
            });
            trx();

            const sections = db.prepare('SELECT * FROM homepage_sections ORDER BY sort_order ASC').all();
            const parsed = sections.map(s => ({
                ...s,
                config: JSON.parse(s.config || '{}')
            }));
            res.json(parsed);
        } catch (error) {
            next(error);
        }
    });

    // PUT /api/homepage/:id (admin) — update a section
    router.put('/:id', requireAdmin, (req, res, next) => {
        try {
            const { id } = req.params;
            const existing = db.prepare('SELECT * FROM homepage_sections WHERE id = ?').get(id);
            if (!existing) {
                return res.status(404).json({ error: 'Section not found' });
            }

            const { title, config, is_visible } = req.body;

            const updates = [];
            const values = [];

            if (title !== undefined) {
                updates.push('title = ?');
                values.push(title);
            }
            if (config !== undefined) {
                const configStr = typeof config === 'string' ? config : JSON.stringify(config);
                updates.push('config = ?');
                values.push(configStr);
            }
            if (is_visible !== undefined) {
                updates.push('is_visible = ?');
                values.push(is_visible ? 1 : 0);
            }

            if (updates.length === 0) {
                return res.status(400).json({ error: 'No fields to update' });
            }

            values.push(id);
            db.prepare(`UPDATE homepage_sections SET ${updates.join(', ')} WHERE id = ?`).run(...values);

            const updated = db.prepare('SELECT * FROM homepage_sections WHERE id = ?').get(id);
            res.json({
                ...updated,
                config: JSON.parse(updated.config || '{}')
            });
        } catch (error) {
            next(error);
        }
    });

    // DELETE /api/homepage/:id (admin) — delete a section
    router.delete('/:id', requireAdmin, (req, res, next) => {
        try {
            const { id } = req.params;
            const existing = db.prepare('SELECT * FROM homepage_sections WHERE id = ?').get(id);
            if (!existing) {
                return res.status(404).json({ error: 'Section not found' });
            }

            db.prepare('DELETE FROM homepage_sections WHERE id = ?').run(id);

            // Re-normalize sort_order after deletion
            const remaining = db.prepare('SELECT id FROM homepage_sections ORDER BY sort_order ASC').all();
            const updateOrder = db.prepare('UPDATE homepage_sections SET sort_order = ? WHERE id = ?');
            const trx = db.transaction(() => {
                remaining.forEach((row, index) => {
                    updateOrder.run(index, row.id);
                });
            });
            trx();

            res.json({ message: 'Section deleted successfully' });
        } catch (error) {
            next(error);
        }
    });

    return router;
};
