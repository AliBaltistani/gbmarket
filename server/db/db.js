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
      is_deleted INTEGER DEFAULT 0,
      rating REAL DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      customer_email TEXT,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      subtotal REAL NOT NULL DEFAULT 0,
      shipping_fee REAL NOT NULL DEFAULT 0,
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

    CREATE TABLE IF NOT EXISTS homepage_sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section_type TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      config TEXT NOT NULL DEFAULT '{}',
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_visible INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payment_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      method TEXT NOT NULL,
      title TEXT NOT NULL,
      account_number TEXT NOT NULL,
      account_name TEXT NOT NULL,
      instructions TEXT DEFAULT '',
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Ensure rating and review_count columns exist for legacy databases
  const tableInfo = db.prepare("PRAGMA table_info(products)").all();
  const hasRating = tableInfo.some(col => col.name === 'rating');
  const hasReviewCount = tableInfo.some(col => col.name === 'review_count');

  if (!hasRating) {
    db.exec('ALTER TABLE products ADD COLUMN rating REAL DEFAULT 0');
  }
  if (!hasReviewCount) {
    db.exec('ALTER TABLE products ADD COLUMN review_count INTEGER DEFAULT 0');
  }

  // B8: Ensure subtotal and shipping_fee columns exist for legacy databases
  const ordersInfo = db.prepare("PRAGMA table_info(orders)").all();
  const hasSubtotal = ordersInfo.some(col => col.name === 'subtotal');
  const hasShippingFee = ordersInfo.some(col => col.name === 'shipping_fee');

  if (!hasSubtotal) {
    db.exec('ALTER TABLE orders ADD COLUMN subtotal REAL NOT NULL DEFAULT 0');
    // Backfill: set subtotal = total for existing orders
    db.exec('UPDATE orders SET subtotal = total WHERE subtotal = 0');
  }
  if (!hasShippingFee) {
    db.exec('ALTER TABLE orders ADD COLUMN shipping_fee REAL NOT NULL DEFAULT 0');
  }

  // F6: Ensure customer_email column exists for legacy databases
  const hasEmail = ordersInfo.some(col => col.name === 'customer_email');
  if (!hasEmail) {
    db.exec('ALTER TABLE orders ADD COLUMN customer_email TEXT');
  }

  // B7: Ensure is_deleted column exists for product soft-delete
  const productsInfo = db.prepare("PRAGMA table_info(products)").all();
  const hasIsDeleted = productsInfo.some(col => col.name === 'is_deleted');
  if (!hasIsDeleted) {
    db.exec('ALTER TABLE products ADD COLUMN is_deleted INTEGER DEFAULT 0');
  }

  // Ensure payment_proof and payment_status columns exist for online payments
  const hasPaymentProof = ordersInfo.some(col => col.name === 'payment_proof');
  const hasPaymentStatus = ordersInfo.some(col => col.name === 'payment_status');
  if (!hasPaymentProof) {
    db.exec('ALTER TABLE orders ADD COLUMN payment_proof TEXT');
  }
  if (!hasPaymentStatus) {
    db.exec("ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'Unpaid'");
    // Backfill: COD orders don't need payment verification
    db.exec("UPDATE orders SET payment_status = 'Unpaid' WHERE payment_method = 'COD' AND payment_status IS NULL");
  }

  // Ensure image_url column exists on categories for category images
  const categoriesInfo = db.prepare("PRAGMA table_info(categories)").all();
  const hasCategoryImage = categoriesInfo.some(col => col.name === 'image_url');
  if (!hasCategoryImage) {
    db.exec('ALTER TABLE categories ADD COLUMN image_url TEXT');
  }

  // Extended product fields migration
  const prodInfo = db.prepare("PRAGMA table_info(products)").all();
  const prodCols = prodInfo.map(c => c.name);
  if (!prodCols.includes('gallery_images')) db.exec('ALTER TABLE products ADD COLUMN gallery_images TEXT');
  if (!prodCols.includes('short_description')) db.exec('ALTER TABLE products ADD COLUMN short_description TEXT');
  if (!prodCols.includes('origin')) db.exec('ALTER TABLE products ADD COLUMN origin TEXT');
  if (!prodCols.includes('shelf_life')) db.exec('ALTER TABLE products ADD COLUMN shelf_life TEXT');
  if (!prodCols.includes('storage_instructions')) db.exec('ALTER TABLE products ADD COLUMN storage_instructions TEXT');
  if (!prodCols.includes('discount_percent')) db.exec('ALTER TABLE products ADD COLUMN discount_percent INTEGER DEFAULT 0');
  if (!prodCols.includes('is_new')) db.exec('ALTER TABLE products ADD COLUMN is_new INTEGER DEFAULT 0');

  // Product reviews table
  db.exec(`
    CREATE TABLE IF NOT EXISTS product_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      customer_name TEXT NOT NULL,
      customer_email TEXT,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      title TEXT,
      comment TEXT,
      is_approved INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);


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

  // Seed Default Homepage Sections if empty
  const { count: hpCount } = db.prepare('SELECT COUNT(*) as count FROM homepage_sections').get();
  if (hpCount === 0) {
    const insertSection = db.prepare('INSERT INTO homepage_sections (section_type, title, config, sort_order, is_visible) VALUES (?, ?, ?, ?, 1)');
    const hpTrx = db.transaction(() => {
      // 1. Hero Banner Carousel
      insertSection.run('hero_banner', 'Hero Banner', JSON.stringify({
        slides: [
          {
            badge: 'Fresh Harvest 2026',
            title: '100% Organic & Sun-Dried Mountain Produce',
            subtitle: 'Handpicked paper-shell almonds & walnuts from the high-altitude orchards of Gilgit-Baltistan.',
            ctaText: 'Explore Harvest',
            ctaLink: '/shop',
            image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&q=80&w=800',
            highlight: 'Premium Grade Paper-Shell Almonds'
          },
          {
            badge: 'Pure Mountain Oils',
            title: 'Cold-Pressed Hunza Apricot & Almond Oils',
            subtitle: 'Raw, unrefined superfood oils extracted directly from wild Gilgit mountain harvests.',
            ctaText: 'Shop Pure Oils',
            ctaLink: '/shop',
            image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800',
            highlight: '100% Unpasteurized & Nutrient Rich'
          },
          {
            badge: 'Limited Reserve',
            title: 'Wild Mountain Pine Nuts (Chilgoza)',
            subtitle: 'Exquisite grade-A pine nuts harvested straight from natural pine forests of Gilgit-Baltistan.',
            ctaText: 'Discover Chilgoza',
            ctaLink: '/shop',
            image: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&q=80&w=800',
            highlight: 'Direct Sourced Mountain Luxury'
          }
        ]
      }), 0);

      // 2. Category Showcase
      insertSection.run('category_showcase', 'Browse Categories', JSON.stringify({
        heading: 'Browse Categories',
        description: 'Auto-scrolling organic mountain dry fruit varieties'
      }), 1);

      // 3. Featured Products Grid
      insertSection.run('product_grid', 'Featured Dry Fruits', JSON.stringify({
        heading: 'Featured Dry Fruits',
        badge: 'Best Seller Collection',
        filter: 'featured',
        maxItems: 6
      }), 2);

      // 4. New Arrivals Carousel
      insertSection.run('product_carousel', 'New Arrivals', JSON.stringify({
        heading: 'New Arrivals Strip',
        badge: 'Fresh Batch Harvest',
        description: 'Handpicked items from this season\'s first harvest.',
        filter: 'new',
        maxItems: 8
      }), 3);

      // 5. Banner Image
      insertSection.run('banner_image', 'Promotional Banner', JSON.stringify({
        image: 'https://images.unsplash.com/photo-1596769062638-e6ed3f46f496?auto=format&fit=crop&q=80&w=1200',
        link: '/shop',
        alt: 'Shop Organic Dry Fruits from Gilgit-Baltistan'
      }), 4);

      // 6. Promo Cards
      insertSection.run('promo_cards', 'Promotional Offers', JSON.stringify({
        cards: [
          {
            badge: 'Save Up to 20% OFF',
            heading: 'Organic Mountain Dry Fruit Bundles',
            body: 'Get our curated 5-Nut Power Mix paired with authentic Hunza Sun-Dried Apricots at special discounted rates this season.',
            ctaText: 'Shop Deal Bundles',
            ctaLink: '/shop',
            theme: 'dark'
          },
          {
            badge: 'Free Express Delivery',
            heading: 'Fast Shipping Across Pakistan',
            body: 'Enjoy free insured doorstep shipping on all orders over Rs. 3,000. Freshly sealed packs delivered right to your home.',
            ctaText: 'Explore Fresh Nuts',
            ctaLink: '/shop',
            theme: 'light'
          }
        ]
      }), 5);

      // 7. Customer Reviews
      insertSection.run('reviews', 'Customer Reviews', JSON.stringify({
        heading: 'What Our Customers Say',
        reviews: [
          { name: 'Ahmed Khan', rating: 5, text: 'Best quality almonds I have ever tasted. Truly organic and fresh from the mountains!', location: 'Islamabad' },
          { name: 'Fatima Ali', rating: 5, text: 'The Hunza apricots are amazing. My whole family loves them. Will order again!', location: 'Lahore' },
          { name: 'Bilal Shah', rating: 4, text: 'Great pine nuts and fast delivery. Packaging was excellent and everything was fresh.', location: 'Karachi' }
        ]
      }), 6);
    });
    hpTrx();
    console.log('Homepage sections seeded with defaults.');
  }

  // Seed Default Payment Accounts if empty
  const { count: paCount } = db.prepare('SELECT COUNT(*) as count FROM payment_accounts').get();
  if (paCount === 0) {
    const insertPA = db.prepare('INSERT INTO payment_accounts (method, title, account_number, account_name, instructions, is_active) VALUES (?, ?, ?, ?, ?, 1)');
    const paTrx = db.transaction(() => {
      insertPA.run('easypaisa', 'Easypaisa', '03001234567', 'GBMarket Official', 'Send payment to the above Easypaisa number and upload the screenshot as proof.');
      insertPA.run('jazzcash', 'JazzCash', '03009876543', 'GBMarket Official', 'Send payment to the above JazzCash number and upload the transaction screenshot.');
      insertPA.run('bank_transfer', 'Bank Transfer (HBL)', 'PK36HABB0012345678901234', 'GBMarket Pvt Ltd', 'Transfer the total amount to the above bank account and upload the receipt screenshot. Bank: Habib Bank Limited.');
    });
    paTrx();
    console.log('Default payment accounts seeded.');
  }
}

// Automatically create tables if they don't exist
initDb();

module.exports = db;
