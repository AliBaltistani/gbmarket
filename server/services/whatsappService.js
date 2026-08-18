/**
 * WhatsApp notification service using wa.me links (free, no API key needed).
 * Generates pre-filled WhatsApp message links for admin to send status updates.
 */

const db = require('../db/db');

function getStoreConfig() {
    try {
        const nameRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('store_name');
        const currRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('currency_symbol');
        const codeRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('country_code');
        return {
            storeName: nameRow?.value || 'Store',
            currency: currRow?.value || '$',
            countryCode: codeRow?.value || ''
        };
    } catch {
        return { storeName: 'Store', currency: '$', countryCode: '' };
    }
}

function getStatusMessages() {
    const { storeName, currency } = getStoreConfig();
    return {
        'Processing': (order) =>
            `🔄 *Order Update — ${storeName}*\n\nHi ${order.customer_name}!\n\nYour order *#${order.id}* is now being *processed*. We're packing your items with care! 📦\n\nTotal: ${currency} ${order.total}\n\nThank you for shopping with ${storeName}! 🌿`,

        'Shipped': (order) =>
            `🚚 *Order Shipped — ${storeName}*\n\nHi ${order.customer_name}!\n\nGreat news! Your order *#${order.id}* has been *shipped* and is on its way! 🎉\n\nTotal: ${currency} ${order.total}\nPayment: ${order.payment_method || 'Cash on Delivery'}\n\nYou can track your order at: ${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/track-order\n\nThank you for choosing ${storeName}! 🌿`,

        'Delivered': (order) =>
            `✅ *Order Delivered — ${storeName}*\n\nHi ${order.customer_name}!\n\nYour order *#${order.id}* has been *delivered* successfully! 🎉\n\nWe hope you enjoy your order! If you have any feedback, feel free to reach out.\n\nThank you for choosing ${storeName}! 🌿`,

        'Cancelled': (order) =>
            `❌ *Order Cancelled — ${storeName}*\n\nHi ${order.customer_name},\n\nYour order *#${order.id}* has been *cancelled*.\n\nIf you have any questions, please contact us.\n\n${storeName} Team`
    };
}

/**
 * Generate a WhatsApp wa.me link with pre-filled message
 * @param {string} phone - Customer phone number
 * @param {object} order - Order object with id, customer_name, total
 * @param {string} newStatus - The new status
 * @returns {string|null} - wa.me URL or null if phone/status invalid
 */
function getWhatsAppLink(phone, order, newStatus) {
    const STATUS_MESSAGES = getStatusMessages();
    if (!phone || !STATUS_MESSAGES[newStatus]) return null;

    // Clean phone: remove spaces, dashes, parentheses. Keep leading +
    const cleanPhone = phone.replace(/[\s\-()]/g, '');
    // Use configured country code, or try to detect
    const { countryCode } = getStoreConfig();
    let intlPhone;
    if (cleanPhone.startsWith('0') && countryCode) {
        intlPhone = countryCode + cleanPhone.slice(1);
    } else {
        intlPhone = cleanPhone.replace(/^\+/, '');
    }

    const message = STATUS_MESSAGES[newStatus](order);
    return `https://wa.me/${intlPhone}?text=${encodeURIComponent(message)}`;
}

module.exports = { getWhatsAppLink };
