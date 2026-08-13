const nodemailer = require('nodemailer');

// F3: Email notification service with optional SMTP config
// If SMTP env vars are not set, emails are silently skipped

const isConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

let transporter = null;

if (isConfigured) {
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: (parseInt(process.env.SMTP_PORT) || 587) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
    console.log('[Email] SMTP configured — email notifications enabled.');
} else {
    console.log('[Email] SMTP not configured — email notifications disabled. Set SMTP_HOST, SMTP_USER, SMTP_PASS to enable.');
}

const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@gbmarket.pk';
const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || null;

/**
 * Send order confirmation email to customer
 */
async function sendOrderConfirmation(order, items) {
    if (!transporter || !order.customer_email) return;

    const itemRows = items.map(i =>
        `<tr><td style="padding:8px;border-bottom:1px solid #eee">${i.product_name}</td><td style="padding:8px;border-bottom:1px solid #eee">${i.weight_option}</td><td style="padding:8px;border-bottom:1px solid #eee">${i.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee">Rs. ${i.price}</td></tr>`
    ).join('');

    const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#3A2E1F">
            <div style="background:#F5A623;padding:20px;text-align:center;border-radius:12px 12px 0 0">
                <h1 style="margin:0;color:#3A2E1F;font-size:24px">Order Confirmed! 🎉</h1>
            </div>
            <div style="padding:24px;background:#FFFDF9;border:1px solid #E8DEC8;border-top:none;border-radius:0 0 12px 12px">
                <p>Hi <strong>${order.customer_name}</strong>,</p>
                <p>Thank you for your order! Here's your order summary:</p>
                <p><strong>Order ID:</strong> #${order.id}</p>
                <table style="width:100%;border-collapse:collapse;margin:16px 0">
                    <thead><tr style="background:#F5EFE0"><th style="padding:8px;text-align:left">Product</th><th style="padding:8px">Weight</th><th style="padding:8px">Qty</th><th style="padding:8px">Price</th></tr></thead>
                    <tbody>${itemRows}</tbody>
                </table>
                <p style="font-size:18px;font-weight:bold;text-align:right">Total: Rs. ${order.total}</p>
                <hr style="border:none;border-top:1px solid #E8DEC8;margin:16px 0">
                <p style="font-size:12px;color:#666">Delivery Address: ${order.address}</p>
                <p style="font-size:12px;color:#666">Payment: Cash on Delivery (COD)</p>
                <p style="margin-top:20px;font-size:12px;color:#999">— GBMarket Team</p>
            </div>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: `"GBMarket" <${fromAddress}>`,
            to: order.customer_email,
            subject: `Order Confirmed #${order.id} — GBMarket`,
            html
        });
        console.log(`[Email] Order confirmation sent to ${order.customer_email}`);
    } catch (err) {
        console.error(`[Email] Failed to send confirmation to ${order.customer_email}:`, err.message);
    }
}

/**
 * Send new order notification to admin
 */
async function sendAdminNotification(order, items) {
    if (!transporter || !adminEmail) return;

    const itemList = items.map(i => `• ${i.product_name} (${i.weight_option}) x${i.quantity} — Rs. ${i.price}`).join('\n');

    const text = `New Order #${order.id}\n\nCustomer: ${order.customer_name}\nPhone: ${order.phone}\nAddress: ${order.address}\nTotal: Rs. ${order.total}\n\nItems:\n${itemList}`;

    try {
        await transporter.sendMail({
            from: `"GBMarket Orders" <${fromAddress}>`,
            to: adminEmail,
            subject: `New Order #${order.id} — Rs. ${order.total}`,
            text
        });
        console.log(`[Email] Admin notification sent for order #${order.id}`);
    } catch (err) {
        console.error(`[Email] Failed to send admin notification:`, err.message);
    }
}

module.exports = { sendOrderConfirmation, sendAdminNotification };
