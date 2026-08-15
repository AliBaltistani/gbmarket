const express = require('express');

module.exports = function (db) {
    const router = express.Router();

    router.get('/', (req, res, next) => {
        try {
            const pages = [
                { url: 'https://gbmarket.pk/', changefreq: 'daily', priority: 1.0 },
                { url: 'https://gbmarket.pk/shop', changefreq: 'daily', priority: 0.9 },
                { url: 'https://gbmarket.pk/about', changefreq: 'monthly', priority: 0.6 },
                { url: 'https://gbmarket.pk/contact', changefreq: 'monthly', priority: 0.6 },
                { url: 'https://gbmarket.pk/track-order', changefreq: 'monthly', priority: 0.6 },
                { url: 'https://gbmarket.pk/privacy', changefreq: 'yearly', priority: 0.5 }
            ];

            const products = db.prepare('SELECT slug, created_at FROM products WHERE (is_deleted IS NULL OR is_deleted = 0)').all();

            for (const p of products) {
                // If created_at is present, use a default fallback
                const date = p.created_at ? new Date(p.created_at) : new Date();
                pages.push({
                    url: `https://gbmarket.pk/product/${p.slug}`,
                    changefreq: 'weekly',
                    priority: 0.8,
                    lastmod: date.toISOString().split('T')[0]
                });
            }

            let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
            xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

            for (const page of pages) {
                xml += '  <url>\n';
                xml += `    <loc>${page.url}</loc>\n`;
                if (page.lastmod) {
                    xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
                }
                xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
                xml += `    <priority>${page.priority.toFixed(1)}</priority>\n`;
                xml += '  </url>\n';
            }
            xml += '</urlset>';

            res.header('Content-Type', 'application/xml');
            res.send(xml);
        } catch (error) {
            next(error);
        }
    });

    return router;
};
