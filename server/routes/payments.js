const express = require('express');

module.exports = function (db, requireAdmin, upload) {
    const router = express.Router();

    // POST /api/payments/receipt-upload (public — customers upload payment screenshots)
    router.post('/receipt-upload', upload.single('image'), (req, res, next) => {
        try {
            if (!req.file) return res.status(400).json({ error: 'No image provided' });
            const imageUrl = `/uploads/${req.file.filename}`;
            res.status(201).json({ url: imageUrl });
        } catch (error) {
            next(error);
        }
    });

    // GET /api/payments/methods (public — available payment methods for checkout)
    router.get('/methods', (req, res, next) => {
        try {
            // COD is always available
            const methods = [
                { id: 'COD', label: 'Cash on Delivery', description: 'Pay when your order arrives', color: null }
            ];
            // Derive additional methods from active payment accounts
            const activeAccounts = db.prepare('SELECT DISTINCT method, title FROM payment_accounts WHERE is_active = 1').all();
            const METHOD_META = {
                'easypaisa': { label: 'Easypaisa', description: 'Send via Easypaisa & upload receipt', color: '#4CAF50' },
                'jazzcash': { label: 'JazzCash', description: 'Send via JazzCash & upload receipt', color: '#E4002B' },
                'bank_transfer': { label: 'Bank Transfer', description: 'Transfer to our bank account', color: '#1565C0' },
            };
            const seen = new Set();
            for (const acc of activeAccounts) {
                if (!seen.has(acc.method)) {
                    seen.add(acc.method);
                    const meta = METHOD_META[acc.method] || { label: acc.title || acc.method, description: 'Upload payment receipt', color: '#666' };
                    methods.push({ id: acc.method, label: meta.label, description: meta.description, color: meta.color });
                }
            }
            res.json(methods);
        } catch (error) {
            next(error);
        }
    });

    // GET /api/payments/accounts (public — for checkout display)
    router.get('/accounts', (req, res, next) => {
        try {
            const accounts = db.prepare('SELECT id, method, title, account_number, account_name, instructions FROM payment_accounts WHERE is_active = 1').all();
            res.json(accounts);
        } catch (error) {
            next(error);
        }
    });

    // GET /api/payments/accounts/admin (admin — all accounts)
    router.get('/accounts/admin', requireAdmin, (req, res, next) => {
        try {
            const accounts = db.prepare('SELECT * FROM payment_accounts ORDER BY created_at DESC').all();
            res.json(accounts);
        } catch (error) {
            next(error);
        }
    });

    // POST /api/payments/accounts (admin — add new account)
    router.post('/accounts', requireAdmin, (req, res, next) => {
        try {
            const { method, title, account_number, account_name, instructions } = req.body;
            if (!method || !title || !account_number || !account_name) {
                return res.status(400).json({ error: 'Method, title, account number, and account name are required' });
            }
            const stmt = db.prepare('INSERT INTO payment_accounts (method, title, account_number, account_name, instructions) VALUES (?, ?, ?, ?, ?)');
            const info = stmt.run(method, title, account_number, account_name, instructions || '');
            res.status(201).json({ id: info.lastInsertRowid, message: 'Payment account added' });
        } catch (error) {
            next(error);
        }
    });

    // PUT /api/payments/accounts/:id (admin — update account)
    router.put('/accounts/:id', requireAdmin, (req, res, next) => {
        try {
            const { id } = req.params;
            const { method, title, account_number, account_name, instructions, is_active } = req.body;
            const stmt = db.prepare('UPDATE payment_accounts SET method = ?, title = ?, account_number = ?, account_name = ?, instructions = ?, is_active = ? WHERE id = ?');
            const info = stmt.run(method, title, account_number, account_name, instructions || '', is_active !== undefined ? is_active : 1, id);
            if (info.changes === 0) return res.status(404).json({ error: 'Payment account not found' });
            res.json({ message: 'Payment account updated' });
        } catch (error) {
            next(error);
        }
    });

    // DELETE /api/payments/accounts/:id (admin — remove account)
    router.delete('/accounts/:id', requireAdmin, (req, res, next) => {
        try {
            const { id } = req.params;
            const info = db.prepare('DELETE FROM payment_accounts WHERE id = ?').run(id);
            if (info.changes === 0) return res.status(404).json({ error: 'Payment account not found' });
            res.json({ message: 'Payment account removed' });
        } catch (error) {
            next(error);
        }
    });

    return router;
};


