const express = require('express');
const { parseJSON } = require('../helpers');

module.exports = function (db, requireAdmin) {
    const router = express.Router();

    // GET /api/products (public — F1: supports pagination, B7: excludes soft-deleted)
    router.get('/', (req, res, next) => {
        try {
            const { category, search, featured, page, limit } = req.query;

            let query = `
              SELECT p.*, c.name as category_name, c.slug as category_slug 
              FROM products p 
              LEFT JOIN categories c ON p.category_id = c.id 
              WHERE (p.is_deleted IS NULL OR p.is_deleted = 0)
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

            // F1: Count total before pagination
            const countQuery = query.replace(/SELECT p\.\*, c\.name as category_name, c\.slug as category_slug/, 'SELECT COUNT(*) as total');
            const { total } = db.prepare(countQuery).get(...params);

            query += ' ORDER BY p.id DESC';

            // F1: Apply pagination if requested
            const pageNum = Math.max(1, parseInt(page) || 1);
            const pageSize = Math.min(100, Math.max(1, parseInt(limit) || 50));
            if (page) {
                query += ' LIMIT ? OFFSET ?';
                params.push(pageSize, (pageNum - 1) * pageSize);
            }

            const products = db.prepare(query).all(...params).map(p => ({
                ...p,
                weight_options: parseJSON(p.weight_options),
                gallery_images: parseJSON(p.gallery_images) || []
            }));

            res.json({
                products,
                pagination: {
                    total,
                    page: pageNum,
                    limit: pageSize,
                    totalPages: Math.ceil(total / pageSize)
                }
            });
        } catch (error) {
            next(error);
        }
    });

    // GET /api/products/:slug (public)
    router.get('/:slug', (req, res, next) => {
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
            product.gallery_images = parseJSON(product.gallery_images) || [];
            res.json(product);
        } catch (error) {
            next(error);
        }
    });

    // POST /api/products (admin)
    router.post('/', requireAdmin, (req, res, next) => {
        try {
            const {
                name, slug, description, short_description, category_id, image_url, gallery_images,
                base_price, stock, weight_options, is_featured, rating, review_count,
                origin, shelf_life, storage_instructions, discount_percent, is_new
            } = req.body;

            if (!name || !slug) return res.status(400).json({ error: 'Product name and slug are required' });
            if (base_price === undefined || base_price === null || Number(base_price) < 0) {
                return res.status(400).json({ error: 'A valid base price is required' });
            }

            const stmt = db.prepare(`
              INSERT INTO products (
                name, slug, description, short_description, category_id, image_url, gallery_images,
                base_price, stock, weight_options, is_featured, rating, review_count,
                origin, shelf_life, storage_instructions, discount_percent, is_new
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            const info = stmt.run(
                name, slug, description || null, short_description || null,
                category_id || null, image_url || null,
                Array.isArray(gallery_images) ? JSON.stringify(gallery_images) : (gallery_images || null),
                Number(base_price), stock || 0,
                typeof weight_options === 'string' ? weight_options : JSON.stringify(weight_options || []),
                is_featured ? 1 : 0,
                rating ? Number(rating) : 4.8,
                review_count ? Number(review_count) : 0,
                origin || null, shelf_life || null, storage_instructions || null,
                discount_percent ? Number(discount_percent) : 0,
                is_new ? 1 : 0
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
    router.put('/:id', requireAdmin, (req, res, next) => {
        try {
            const { id } = req.params;
            const {
                name, slug, description, short_description, category_id, image_url, gallery_images,
                base_price, stock, weight_options, is_featured, rating, review_count,
                origin, shelf_life, storage_instructions, discount_percent, is_new
            } = req.body;

            const stmt = db.prepare(`
              UPDATE products SET
                name = ?, slug = ?, description = ?, short_description = ?,
                category_id = ?, image_url = ?, gallery_images = ?,
                base_price = ?, stock = ?, weight_options = ?, is_featured = ?,
                rating = ?, review_count = ?,
                origin = ?, shelf_life = ?, storage_instructions = ?,
                discount_percent = ?, is_new = ?
              WHERE id = ?
            `);

            const info = stmt.run(
                name, slug, description || null, short_description || null,
                category_id || null, image_url || null,
                Array.isArray(gallery_images) ? JSON.stringify(gallery_images) : (gallery_images || null),
                Number(base_price), Number(stock) || 0,
                typeof weight_options === 'string' ? weight_options : JSON.stringify(weight_options || []),
                is_featured ? 1 : 0,
                rating !== undefined ? Number(rating) : 4.8,
                review_count !== undefined ? Number(review_count) : 0,
                origin || null, shelf_life || null, storage_instructions || null,
                discount_percent ? Number(discount_percent) : 0,
                is_new ? 1 : 0,
                id
            );

            if (info.changes === 0) return res.status(404).json({ error: 'Product not found' });
            res.json({ message: 'Product updated successfully' });
        } catch (error) {
            next(error);
        }
    });

    // DELETE /api/products/:id (admin — B7: soft-delete)
    router.delete('/:id', requireAdmin, (req, res, next) => {
        try {
            const { id } = req.params;
            const stmt = db.prepare('UPDATE products SET is_deleted = 1 WHERE id = ?');
            const info = stmt.run(id);
            if (info.changes === 0) return res.status(404).json({ error: 'Product not found' });
            res.json({ message: 'Product archived successfully' });
        } catch (error) {
            next(error);
        }
    });

    // B6: GET /api/products/:id/stock (public — cart stock validation)
    router.get('/:id/stock', (req, res, next) => {
        try {
            const product = db.prepare('SELECT id, name, stock FROM products WHERE id = ?').get(req.params.id);
            if (!product) return res.status(404).json({ error: 'Product not found' });
            res.json({ id: product.id, name: product.name, stock: product.stock });
        } catch (error) {
            next(error);
        }
    });

    return router;
};
