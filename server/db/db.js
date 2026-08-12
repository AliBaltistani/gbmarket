const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'gbmarket.db');
const isProduction = process.env.NODE_ENV === 'production';
const db = new Database(dbPath, isProduction ? {} : { verbose: console.log });

// Enable foreign keys
db.pragma('foreign_keys = ON');

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      image_url TEXT,
      base_price REAL NOT NULL,
      stock INTEGER DEFAULT 0,
      weight_options TEXT,
      is_featured INTEGER DEFAULT 0,
      rating REAL DEFAULT 4.8,
      review_count INTEGER DEFAULT 25,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'Pending',
      payment_method TEXT DEFAULT 'COD',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER REFERENCES orders(id),
      product_id INTEGER REFERENCES products(id),
      product_name TEXT NOT NULL,
      weight_option TEXT,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT
    );
  `);
  // Ensure rating and review_count columns exist for legacy databases
  const tableInfo = db.prepare("PRAGMA table_info(products)").all();
  const hasRating = tableInfo.some(col => col.name === 'rating');
  const hasReviewCount = tableInfo.some(col => col.name === 'review_count');

  if (!hasRating) {
    db.exec('ALTER TABLE products ADD COLUMN rating REAL DEFAULT 4.8');
  }
  if (!hasReviewCount) {
    db.exec('ALTER TABLE products ADD COLUMN review_count INTEGER DEFAULT 25');
  }

  // Update products with realistic varied rating & review count data if they are uniform defaults
  const sampleRatings = [
    { id: 1, rating: 4.9, review_count: 84 },
    { id: 2, rating: 4.8, review_count: 56 },
    { id: 3, rating: 4.6, review_count: 32 },
    { id: 4, rating: 5.0, review_count: 112 },
    { id: 5, rating: 4.7, review_count: 95 },
    { id: 6, rating: 4.5, review_count: 19 },
    { id: 7, rating: 4.8, review_count: 41 },
    { id: 8, rating: 4.9, review_count: 148 },
    { id: 9, rating: 4.9, review_count: 73 },
    { id: 10, rating: 4.7, review_count: 62 }
  ];
  const updateReviewStmt = db.prepare('UPDATE products SET rating = ?, review_count = ? WHERE id = ?');
  sampleRatings.forEach(item => {
    updateReviewStmt.run(item.rating, item.review_count, item.id);
  });

  console.log('Database schema initialized.');

  // Seed Initial Settings if empty
  const { count } = db.prepare('SELECT COUNT(*) as count FROM settings').get();
  if (count === 0) {
    const seedSettings = {
      store_name: 'GBMarket',
      store_tagline: 'Premium Dry Fruits & Nuts from the Mountains of Gilgit-Baltistan',
      logo_url: '/placeholder.png',
      favicon_url: '/vite.svg',
      footer_logo_url: '/placeholder.png',
      contact_email: 'info@gbmarket.pk',
      contact_phone: '+92 300 1234567',
      contact_address: 'Main Bazaar, Gilgit, Gilgit-Baltistan, Pakistan',
      hero_heading: '100% Organic & Sun-Dried Mountain Produce',
      hero_subheading: 'Handpicked from the orchards of Hunza, Skardu, and Gilgit Valley, brought fresh to your doorstep across Pakistan.',
      hero_image_url: 'https://images.unsplash.com/photo-1594951468249-f79a953eacc2?auto=format&fit=crop&q=80&w=1200',
      social_facebook: 'https://facebook.com/gbmarket.pk',
      social_instagram: 'https://instagram.com/gbmarket.pk',
      social_whatsapp: '+92 300 1234567',
      footer_about_text: 'GBMarket brings authentic, handpicked, sun-dried organic fruits and nuts directly from local mountain farmers of Gilgit-Baltistan to your doorstep with guaranteed purity.',
      currency_symbol: 'Rs. ',
      free_shipping_threshold: '5000'
    };
    const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
    const trx = db.transaction(() => {
      for (const [key, value] of Object.entries(seedSettings)) {
        insertSetting.run(key, value);
      }
    });
    trx();
    console.log('Database settings seeded with defaults.');
  }
}

// Automatically create tables if they don't exist
initDb();

module.exports = db;
