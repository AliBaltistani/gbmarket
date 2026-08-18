const express = require('express');

module.exports = function (db, requireAdmin, upload) {
    const router = express.Router();

    // POST /api/upload
    router.post('/', requireAdmin, upload.single('image'), (req, res, next) => {
        try {
            if (!req.file) return res.status(400).json({ error: 'No image provided' });
            const imageUrl = `/uploads/${req.file.filename}`;
            res.status(201).json({ url: imageUrl });
        } catch (error) {
            next(error);
        }
    });

    return router;
};
