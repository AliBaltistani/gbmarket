const express = require('express');
const { parseJSON } = require('../helpers');
const { getWhatsAppLink } = require('../services/whatsappService');

module.exports = function (db, requireAdmin) {
    const router = express.Router();

    // GET /api/orders/track (public — order tracking by ID + phone)
    router.get('/track', (req, res, next) => {
        try {
            const { order_id, phone } = req.query;

            if (!order_id || !phone) {
                return res.status(400).json({ error: 'Order ID and phone number are required' });
            }

            const order = db.prepare('SELECT id, customer_name, phone, status, total, subtotal, shipping_fee, payment_method, payment_status, created_at FROM orders WHERE id = ?').get(order_id);
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }

            // Verify phone matches (strip non-digits for comparison)
            const cleanInputPhone = phone.replace(/\D/g, '').slice(-10);
            const cleanOrderPhone = order.phone.replace(/\D/g, '').slice(-10);
            if (cleanInputPhone !== cleanOrderPhone) {
                return res.status(404).json({ error: 'Order not found' });
            }

            const items = db.prepare('SELECT product_name, weight_option, quantity, price FROM order_items WHERE order_id = ?').all(order_id);

            // Don't expose full phone in response
            res.json({
                id: order.id,
                customer_name: order.customer_name,
                status: order.status,
                total: order.total,
                subtotal: order.subtotal,
                shipping_fee: order.shipping_fee,
                payment_method: order.payment_method,
                payment_status: order.payment_status,
                created_at: order.created_at,
                items
            });
        } catch (error) {
            next(error);
        }
    });

    // GET /api/orders (admin — F2: search/filter support)
    router.get('/', requireAdmin, (req, res, next) => {
        try {
            const { status, search, from, to } = req.query;

            let query = 'SELECT * FROM orders WHERE 1=1';
            const params = [];

            if (status && status !== 'All') {
                query += ' AND status = ?';
                params.push(status);
            }
            if (search) {
                query += ' AND (customer_name LIKE ? OR phone LIKE ? OR CAST(id AS TEXT) LIKE ?)';
                params.push(`%${search}%`, `%${search}%`, `%${search}%`);
            }
            if (from) {
                query += ' AND created_at >= ?';
                params.push(from);
            }
            if (to) {
                query += ' AND created_at <= ?';
                params.push(to + ' 23:59:59');
            }

            query += ' ORDER BY created_at DESC';

            const orders = db.prepare(query).all(...params);
            const allItems = db.prepare('SELECT * FROM order_items').all();

            const itemsByOrderId = {};
            for (const item of allItems) {
                if (!itemsByOrderId[item.order_id]) itemsByOrderId[item.order_id] = [];
                itemsByOrderId[item.order_id].push(item);
            }

            const ordersWithItems = orders.map(order => ({
                ...order,
                items: itemsByOrderId[order.id] || []
            }));

            res.json(ordersWithItems);
        } catch (error) {
            next(error);
        }
    });

    // POST /api/orders (public — B1: server-side price lookup, B2: server-side shipping, B5: atomic stock)
    router.post('/', (req, res, next) => {
        try {
            const { customer_name, customer_email, phone, address, payment_method, items } = req.body;

            if (!customer_name || !phone || !address) {
                return res.status(400).json({ error: 'Customer name, phone, and address are required' });
            }
            if (!items || !items.length) {
                return res.status(400).json({ error: 'Order must contain at least one item' });
            }

            const processOrder = db.transaction((orderData, itemsData) => {
                const getProduct = db.prepare('SELECT id, name, stock, base_price, weight_options FROM products WHERE id = ?');
                const decrementStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?');

                let serverSubtotal = 0;
                const validatedItems = [];

                for (const item of itemsData) {
                    const product = getProduct.get(item.product_id);
                    if (!product) {
                        throw new Error(`Product with ID ${item.product_id} not found`);
                    }

                    let serverPrice = product.base_price;
                    const weightOptions = parseJSON(product.weight_options);
                    if (weightOptions && item.weight_option) {
                        const matchedOption = weightOptions.find(opt => opt.label === item.weight_option);
                        if (matchedOption) {
                            serverPrice = matchedOption.price;
                        }
                    }

                    const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));

                    const stockResult = decrementStock.run(quantity, product.id, quantity);
                    if (stockResult.changes === 0) {
                        const freshProduct = getProduct.get(item.product_id);
                        throw new Error(`Insufficient stock for "${product.name}". Available: ${freshProduct ? freshProduct.stock : 0}, Requested: ${quantity}`);
                    }

                    serverSubtotal += serverPrice * quantity;
                    validatedItems.push({
                        product_id: product.id,
                        product_name: product.name,
                        weight_option: item.weight_option || 'Standard',
                        quantity: quantity,
                        price: serverPrice
                    });
                }

                const thresholdRow = db.prepare("SELECT value FROM settings WHERE key = 'free_shipping_threshold'").get();
                const shippingFeeRow = db.prepare("SELECT value FROM settings WHERE key = 'default_shipping_fee'").get();
                const freeShippingThreshold = thresholdRow ? Number(thresholdRow.value) : 5000;
                const defaultShippingFee = shippingFeeRow ? Number(shippingFeeRow.value) : 350;
                const shippingFee = serverSubtotal >= freeShippingThreshold ? 0 : defaultShippingFee;
                const grandTotal = serverSubtotal + shippingFee;

                const paymentMethod = orderData.payment_method || 'COD';
                const paymentStatus = paymentMethod === 'COD' ? 'Unpaid' : (orderData.payment_proof ? 'Pending Verification' : 'Unpaid');

                const insertOrder = db.prepare(`
                    INSERT INTO orders (customer_name, customer_email, phone, address, subtotal, shipping_fee, total, payment_method, payment_proof, payment_status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);
                const orderInfo = insertOrder.run(
                    orderData.customer_name, orderData.customer_email || null, orderData.phone, orderData.address,
                    serverSubtotal, shippingFee, grandTotal,
                    paymentMethod, orderData.payment_proof || null, paymentStatus
                );
                const orderId = orderInfo.lastInsertRowid;

                const insertItem = db.prepare(`
                    INSERT INTO order_items (order_id, product_id, product_name, weight_option, quantity, price)
                    VALUES (?, ?, ?, ?, ?, ?)
                `);

                for (const item of validatedItems) {
                    insertItem.run(orderId, item.product_id, item.product_name, item.weight_option, item.quantity, item.price);
                }

                return { orderId, grandTotal, validatedItems, customerEmail: orderData.customer_email, customerName: orderData.customer_name };
            });

            const { payment_proof } = req.body;
            const result = processOrder({ customer_name, customer_email, phone, address, payment_method, payment_proof }, items);

            // F3: Send email notification (fire-and-forget)
            try {
                const { sendOrderConfirmation, sendAdminNotification } = require('../services/emailService');
                const orderSummary = { id: result.orderId, customer_name, customer_email, phone, address, total: result.grandTotal };
                if (customer_email) sendOrderConfirmation(orderSummary, result.validatedItems);
                sendAdminNotification(orderSummary, result.validatedItems);
            } catch (emailErr) {
                // Email is optional — don't fail the order
                console.log('[Email] Skipped:', emailErr.message);
            }

            res.status(201).json({ id: result.orderId, message: 'Order created successfully' });
        } catch (error) {
            if (error.message.includes('Insufficient stock') || error.message.includes('not found')) {
                return res.status(400).json({ error: error.message });
            }
            next(error);
        }
    });

    // PATCH /api/orders/:id/status (admin — B4: enforces status transitions)
    router.patch('/:id/status', requireAdmin, (req, res, next) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
            }

            const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
            if (!order) return res.status(404).json({ error: 'Order not found' });

            const validTransitions = {
                'Pending': ['Processing', 'Cancelled'],
                'Processing': ['Shipped', 'Cancelled'],
                'Shipped': ['Delivered', 'Cancelled'],
                'Delivered': [],
                'Cancelled': []
            };

            const allowed = validTransitions[order.status] || [];
            if (!allowed.includes(status)) {
                return res.status(400).json({
                    error: `Cannot transition from "${order.status}" to "${status}". Allowed: ${allowed.length ? allowed.join(', ') : 'none (terminal state)'}`
                });
            }

            if (status === 'Cancelled' && order.status !== 'Cancelled') {
                const restoreStock = db.transaction(() => {
                    const orderItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);
                    const incrementStock = db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?');
                    for (const item of orderItems) {
                        incrementStock.run(item.quantity, item.product_id);
                    }
                    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
                });
                restoreStock();
            } else {
                db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
            }

            // Send email notification (fire-and-forget)
            try {
                const { sendOrderStatusEmail } = require('../services/emailService');
                sendOrderStatusEmail(order, status);
            } catch (emailErr) {
                console.log('[Email] Status notification skipped:', emailErr.message);
            }

            // Generate WhatsApp link for admin
            const whatsappLink = getWhatsAppLink(order.phone, order, status);

            res.json({
                message: 'Order status updated successfully',
                whatsappLink
            });
        } catch (error) {
            next(error);
        }
    });

    // PATCH /api/orders/:id/payment (admin — verify or reject payment proof)
    router.patch('/:id/payment', requireAdmin, (req, res, next) => {
        try {
            const { id } = req.params;
            const { payment_status } = req.body;

            const validStatuses = ['Pending Verification', 'Verified', 'Rejected'];
            if (!validStatuses.includes(payment_status)) {
                return res.status(400).json({ error: `Invalid payment status. Must be one of: ${validStatuses.join(', ')}` });
            }

            const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
            if (!order) return res.status(404).json({ error: 'Order not found' });

            db.prepare('UPDATE orders SET payment_status = ? WHERE id = ?').run(payment_status, id);
            res.json({ message: `Payment status updated to ${payment_status}` });
        } catch (error) {
            next(error);
        }
    });

    return router;
};
