/**
 * WhatsApp notification service using wa.me links (free, no API key needed).
 * Generates pre-filled WhatsApp message links for admin to send status updates.
 */

const STATUS_MESSAGES = {
    'Processing': (order) =>
        `🔄 *Order Update — GBMarket*\n\nHi ${order.customer_name}!\n\nYour order *#${order.id}* is now being *processed*. We're packing your items with care! 📦\n\nTotal: Rs. ${order.total}\n\nThank you for shopping with GBMarket! 🌿`,

    'Shipped': (order) =>
        `🚚 *Order Shipped — GBMarket*\n\nHi ${order.customer_name}!\n\nGreat news! Your order *#${order.id}* has been *shipped* and is on its way! 🎉\n\nTotal: Rs. ${order.total}\nPayment: Cash on Delivery\n\nYou can track your order at: ${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/track-order\n\nThank you for choosing GBMarket! 🌿`,

    'Delivered': (order) =>
        `✅ *Order Delivered — GBMarket*\n\nHi ${order.customer_name}!\n\nYour order *#${order.id}* has been *delivered* successfully! 🎉\n\nWe hope you enjoy your fresh dry fruits! If you have any feedback, feel free to reach out.\n\nThank you for choosing GBMarket! 🌿`,

    'Cancelled': (order) =>
        `❌ *Order Cancelled — GBMarket*\n\nHi ${order.customer_name},\n\nYour order *#${order.id}* has been *cancelled*.\n\nIf you have any questions, please contact us.\n\nGBMarket Team`
};

/**
 * Generate a WhatsApp wa.me link with pre-filled message
 * @param {string} phone - Customer phone number
 * @param {object} order - Order object with id, customer_name, total
 * @param {string} newStatus - The new status
 * @returns {string|null} - wa.me URL or null if phone/status invalid
 */
function getWhatsAppLink(phone, order, newStatus) {
    if (!phone || !STATUS_MESSAGES[newStatus]) return null;

    // Clean phone: remove spaces, dashes, parentheses. Keep leading +
    const cleanPhone = phone.replace(/[\s\-()]/g, '');
    // If starts with 0, assume Pakistan (+92)
    const intlPhone = cleanPhone.startsWith('0')
        ? '92' + cleanPhone.slice(1)
        : cleanPhone.replace(/^\+/, '');

    const message = STATUS_MESSAGES[newStatus](order);
    return `https://wa.me/${intlPhone}?text=${encodeURIComponent(message)}`;
}

module.exports = { getWhatsAppLink };
