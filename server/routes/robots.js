const express = require('express');

module.exports = function (db) {
    const router = express.Router();

    router.get('/', (req, res, next) => {
        try {
            const settingsRows = db.prepare('SELECT value FROM settings WHERE key = ?').get('site_url');
            const siteUrl = (settingsRows && settingsRows.value) ? settingsRows.value : '';

            let content = 'User-agent: *\n';
            content += 'Allow: /\n';
            content += 'Disallow: /admin\n';
            content += 'Disallow: /admin/\n';

            if (siteUrl) {
                const baseUrl = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;
                content += `\nSitemap: ${baseUrl}/sitemap.xml\n`;
            }

            res.header('Content-Type', 'text/plain');
            res.send(content);
        } catch (error) {
            next(error);
        }
    });

    return router;
};
