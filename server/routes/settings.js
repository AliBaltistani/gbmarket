const express = require('express');

module.exports = function (db, requireAdmin) {
    const router = express.Router();

    // GET /api/settings (public)
    router.get('/', (req, res, next) => {
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
    router.put('/', requireAdmin, (req, res, next) => {
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

    return router;
};
