const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = function (db, requireAdmin, authLimiter) {
    const router = express.Router();

    // POST /api/auth/login — S3: Rate limited
    router.post('/login', authLimiter, (req, res, next) => {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).json({ error: 'Username and password are required' });
            }
            const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);
            if (!user || !bcrypt.compareSync(password, user.password_hash)) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }
            const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
            res.json({ token, username: user.username });
        } catch (error) {
            next(error);
        }
    });

    // GET /api/auth/me
    router.get('/me', requireAdmin, (req, res) => {
        res.json({ username: req.admin.username });
    });

    // PUT /api/auth/change-password (F4: Admin password change)
    router.put('/change-password', requireAdmin, (req, res, next) => {
        try {
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                return res.status(400).json({ error: 'Current password and new password are required' });
            }
            if (newPassword.length < 8) {
                return res.status(400).json({ error: 'New password must be at least 8 characters long' });
            }
            const user = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(req.admin.id);
            if (!user || !bcrypt.compareSync(currentPassword, user.password_hash)) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }
            const newHash = bcrypt.hashSync(newPassword, 12);
            db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').run(newHash, req.admin.id);
            res.json({ message: 'Password changed successfully' });
        } catch (error) {
            next(error);
        }
    });

    return router;
};
