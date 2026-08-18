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

const db = require('../db/db');

function getDynamicDomain() {
    try {
        const siteRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('site_url');
        const nameRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('store_name');
        const currRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('currency_symbol');
        const siteUrl = siteRow?.value || '';
        const storeName = nameRow?.value || 'Store';
        const currency = currRow?.value || '$';
        return {
            siteUrl,
            hostname: siteUrl ? new URL(siteUrl).hostname : 'localhost',
            storeName,
            currency
        };
    } catch {
        return { siteUrl: '', hostname: 'localhost', storeName: 'Store', currency: '$' };
    }
}

function getEmailConfig() {
    const { hostname, siteUrl, storeName, currency } = getDynamicDomain();
    const fromAddr = process.env.SMTP_FROM || process.env.SMTP_USER || `noreply@${hostname}`;
    const adminAddr = process.env.ADMIN_EMAIL || process.env.SMTP_USER || null;
    return { siteUrl, storeName, currency, fromAddress: fromAddr, adminEmail: adminAddr };
}

/**
 * Send order confirmation email to customer
 */
async function sendOrderConfirmation(order, items) {
    if (!transporter || !order.customer_email) return;
    const { siteUrl, storeName, currency, fromAddress } = getEmailConfig();

    const itemRows = items.map(i =>
        `<tr><td style="padding:8px;border-bottom:1px solid #eee">${i.product_name}</td><td style="padding:8px;border-bottom:1px solid #eee">${i.weight_option}</td><td style="padding:8px;border-bottom:1px solid #eee">${i.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee">${currency} ${i.price}</td></tr>`
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
                <p style="font-size:18px;font-weight:bold;text-align:right">Total: ${currency} ${order.total}</p>
                <hr style="border:none;border-top:1px solid #E8DEC8;margin:16px 0">
                <p style="font-size:12px;color:#666">Delivery Address: ${order.address}</p>
                <p style="font-size:12px;color:#666">Payment: ${order.payment_method || 'Cash on Delivery'}</p>
                <p style="margin-top:20px;font-size:12px;color:#999">— ${storeName} Team</p>
            </div>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: `"${storeName}" <${fromAddress}>`,
            to: order.customer_email,
            subject: `Order Confirmed #${order.id} — ${storeName}`,
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
    if (!transporter) return;
    const { storeName, currency, fromAddress, adminEmail } = getEmailConfig();
    if (!adminEmail) return;

    const itemList = items.map(i => `• ${i.product_name} (${i.weight_option}) x${i.quantity} — ${currency} ${i.price}`).join('\n');

    const text = `New Order #${order.id}\n\nCustomer: ${order.customer_name}\nPhone: ${order.phone}\nAddress: ${order.address}\nTotal: ${currency} ${order.total}\n\nItems:\n${itemList}`;

    try {
        await transporter.sendMail({
            from: `"${storeName} Orders" <${fromAddress}>`,
            to: adminEmail,
            subject: `New Order #${order.id} — ${currency} ${order.total}`,
            text
        });
        console.log(`[Email] Admin notification sent for order #${order.id}`);
    } catch (err) {
        console.error(`[Email] Failed to send admin notification:`, err.message);
    }
}
/**
 * Send contact form submission to admin email
 */
async function sendContactFormEmail(name, email, subject, message) {
    if (!transporter) return;
    const { storeName, fromAddress, adminEmail } = getEmailConfig();
    if (!adminEmail) {
        console.log('[Email] Contact form email skipped — SMTP not configured or no admin email.');
        return;
    }

    const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#3A2E1F">
            <div style="background:#3A2E1F;padding:20px;text-align:center;border-radius:12px 12px 0 0">
                <h1 style="margin:0;color:#F5A623;font-size:20px">📬 New Contact Form Message</h1>
            </div>
            <div style="padding:24px;background:#FFFDF9;border:1px solid #E8DEC8;border-top:none;border-radius:0 0 12px 12px">
                <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
                    <tr><td style="padding:8px;font-weight:bold;width:100px;vertical-align:top">Name:</td><td style="padding:8px">${name}</td></tr>
                    <tr><td style="padding:8px;font-weight:bold;vertical-align:top">Email:</td><td style="padding:8px"><a href="mailto:${email}">${email}</a></td></tr>
                    <tr><td style="padding:8px;font-weight:bold;vertical-align:top">Subject:</td><td style="padding:8px">${subject}</td></tr>
                </table>
                <div style="background:#F5EFE0;padding:16px;border-radius:12px;border:1px solid #E8DEC8">
                    <p style="font-weight:bold;margin:0 0 8px 0;font-size:12px;text-transform:uppercase;color:#666">Message:</p>
                    <p style="margin:0;white-space:pre-wrap;line-height:1.6">${message}</p>
                </div>
                <p style="margin-top:20px;font-size:12px;color:#999">— Sent via ${storeName} Contact Form</p>
            </div>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: `"${storeName} Contact" <${fromAddress}>`,
            replyTo: email,
            to: adminEmail,
            subject: `[Contact] ${subject} — from ${name}`,
            html
        });
        console.log(`[Email] Contact form email sent to admin (from ${email})`);
    } catch (err) {
        console.error(`[Email] Failed to send contact form email:`, err.message);
        throw err;
    }
}

/**
 * Send order status update email to customer
 */
async function sendOrderStatusEmail(order, newStatus) {
    if (!transporter || !order.customer_email) return;
    const { siteUrl, storeName, currency, fromAddress } = getEmailConfig();

    const statusConfig = {
        'Processing': { emoji: '🔄', color: '#2563EB', label: 'Processing', desc: 'Your order is being prepared and packed.' },
        'Shipped': { emoji: '🚚', color: '#D97706', label: 'Shipped', desc: 'Your order is on its way! Expect delivery within 2-3 business days.' },
        'Delivered': { emoji: '✅', color: '#059669', label: 'Delivered', desc: 'Your order has been delivered successfully!' },
        'Cancelled': { emoji: '❌', color: '#DC2626', label: 'Cancelled', desc: 'Your order has been cancelled. Contact us if you have questions.' }
    };

    const config = statusConfig[newStatus];
    if (!config) return;

    const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#3A2E1F">
            <div style="background:${config.color};padding:20px;text-align:center;border-radius:12px 12px 0 0">
                <h1 style="margin:0;color:white;font-size:22px">${config.emoji} Order ${config.label}</h1>
            </div>
            <div style="padding:24px;background:#FFFDF9;border:1px solid #E8DEC8;border-top:none;border-radius:0 0 12px 12px">
                <p>Hi <strong>${order.customer_name}</strong>,</p>
                <p>${config.desc}</p>
                <div style="background:#F5EFE0;padding:16px;border-radius:12px;margin:16px 0;border:1px solid #E8DEC8">
                    <p style="margin:0"><strong>Order ID:</strong> #${order.id}</p>
                    <p style="margin:8px 0 0 0"><strong>Status:</strong> <span style="color:${config.color};font-weight:bold">${config.label}</span></p>
                    <p style="margin:8px 0 0 0"><strong>Total:</strong> ${currency} ${order.total}</p>
                </div>
                <p style="margin:16px 0">
                    <a href="${siteUrl}/track-order" 
                       style="display:inline-block;padding:12px 24px;background:#F5A623;color:#3A2E1F;font-weight:bold;text-decoration:none;border-radius:24px">
                        Track Your Order →
                    </a>
                </p>
                <p style="margin-top:20px;font-size:12px;color:#999">— ${storeName} Team</p>
            </div>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: `"${storeName}" <${fromAddress}>`,
            to: order.customer_email,
            subject: `${config.emoji} Order #${order.id} — ${config.label}`,
            html
        });
        console.log(`[Email] Status update (${newStatus}) sent to ${order.customer_email}`);
    } catch (err) {
        console.error(`[Email] Failed to send status update:`, err.message);
    }
}

module.exports = { sendOrderConfirmation, sendAdminNotification, sendContactFormEmail, sendOrderStatusEmail };
