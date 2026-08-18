const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.resolve(__dirname, 'gbmarket.db');

const isProduction = process.env.NODE_ENV === 'production';
const db = new Database(dbPath, isProduction ? {} : { verbose: console.log });

console.log('Using database at: ' + dbPath);

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

  // Migration for new keys like site_url, working_hours, map_embed_url
  const existSiteUrl = db.prepare('SELECT COUNT(*) as count FROM settings WHERE key = ?').get('site_url');
  if (existSiteUrl.count === 0) {
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('site_url', '');
  }

  const existWorkingHours = db.prepare('SELECT COUNT(*) as count FROM settings WHERE key = ?').get('working_hours');
  if (existWorkingHours.count === 0) {
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('working_hours', 'Mon - Sat: 9:00 AM - 8:00 PM');
  }

  const existMapUrl = db.prepare('SELECT COUNT(*) as count FROM settings WHERE key = ?').get('map_embed_url');
  if (existMapUrl.count === 0) {
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('map_embed_url', '');
  }

  // --- CMS Pages Migrations ---
  const existPrivacy = db.prepare('SELECT COUNT(*) as count FROM settings WHERE key = ?').get('privacy_policy_content');
  if (existPrivacy.count === 0) {
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('privacy_policy_content', '<h2 class="text-xl font-bold text-[#3A2E1F] my-4">1. Introduction</h2><p class="mb-4">We value your privacy and are committed to protecting your personal data...</p><h2 class="text-xl font-bold text-[#3A2E1F] my-4">Contact Us</h2><p class="mb-4">If you have any questions, please contact us.</p>');
  }

  const existAboutStory = db.prepare('SELECT COUNT(*) as count FROM settings WHERE key = ?').get('about_story_heading');
  if (existAboutStory.count === 0) {
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('about_hero_heading', 'Welcome to Our Store');
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('about_hero_subheading', 'We are dedicated to bringing you the finest quality products, sourced with care and delivered to your doorstep.');
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('about_story_heading', 'Our Story');
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('about_story_text', 'We are passionate about delivering the highest quality products to our customers. Every item in our collection is carefully sourced and quality-checked to ensure you receive nothing but the best.\n\nOur commitment to excellence means we work directly with trusted suppliers, ensuring authenticity and freshness in every order.');
  }

  // Add new dynamic settings if they don't exist
  const newSettings = [
    { key: 'currency_code', val: 'USD' },
    { key: 'locale', val: 'en_US' },
    { key: 'default_shipping_fee', val: '350' },
    { key: 'shipping_info_text', val: 'Orders dispatched within 24 hours.\nDelivery time: 2–3 business days.\nFree shipping on all orders above the threshold.\nTracked delivery via courier service.' },
    { key: 'order_prefix', val: 'GB' },
    { key: 'sku_prefix', val: 'GBM' },
    { key: 'phone_pattern', val: '^(\\d{10,15}|\\+\\d{10,15})$' },
    { key: 'phone_placeholder', val: 'Phone Number' },
    { key: 'search_placeholder', val: 'Search products...' },
    { key: 'chatbot_name', val: 'AI Assistant' },
    { key: 'footer_tagline', val: 'Crafted with love for healthy living' },
    { key: 'footer_feature_1_title', val: 'Free Express Shipping' },
    { key: 'footer_feature_1_text', val: 'On all orders over the threshold' },
    { key: 'footer_feature_2_title', val: '100% Quality Guaranteed' },
    { key: 'footer_feature_2_text', val: 'Direct from trusted sources' },
    { key: 'footer_feature_3_title', val: '7-Day Fresh Guarantee' },
    { key: 'footer_feature_3_text', val: '100% money back or replacement' },
    { key: 'product_badge_text', val: '100% Organic' },
    { key: 'empty_cart_text', val: 'Looks like you haven\'t added any products to your cart yet.' },
    { key: 'shipping_tab_heading', val: 'Nationwide Delivery' },
    { key: 'shipping_bullet_1', val: 'Orders dispatched within 24 hours.' },
    { key: 'shipping_bullet_2', val: 'Delivery time: 2–3 business days.' },
    { key: 'shipping_bullet_3', val: 'Free shipping on all orders above the threshold.' },
    { key: 'shipping_bullet_4', val: 'Tracked delivery via courier service.' }
  ];

  const checkSetting = db.prepare('SELECT COUNT(*) as count FROM settings WHERE key = ?');
  const insertSet = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');

  db.transaction(() => {
    for (const s of newSettings) {
      if (checkSetting.get(s.key).count === 0) {
        insertSet.run(s.key, s.val);
      }
    }
  })();

  // Seed Initial Settings if empty
  const { count } = db.prepare('SELECT COUNT(*) as count FROM settings').get();
  if (count === 0) {
    const seedSettings = {
      store_name: 'My Store',
      store_tagline: 'Premium quality products delivered to your doorstep',
      site_url: '',
      logo_url: '/placeholder.png',
      favicon_url: '/vite.svg',
      footer_logo_url: '/placeholder.png',
      contact_email: '',
      contact_phone: '',
      contact_address: '',
      working_hours: 'Mon - Sat: 9:00 AM - 8:00 PM',
      map_embed_url: '',
      hero_heading: 'Premium Quality Products Delivered to Your Door.',
      hero_subheading: 'Discover our carefully curated collection of premium products.',
      hero_image_url: 'https://images.unsplash.com/photo-1596769062638-e6ed3f46f496?auto=format&fit=crop&q=80&w=1200',
      social_facebook: '',
      social_instagram: '',
      social_whatsapp: '',
      footer_about_text: 'Your trusted destination for premium quality products, carefully sourced and delivered to your doorstep.',
      currency_symbol: '$ ',
      currency_code: 'USD',
      locale: 'en_US',
      free_shipping_threshold: '3000',
      default_shipping_fee: '350',
      shipping_info_text: 'Orders dispatched within 24 hours.\nDelivery time: 2–3 business days.\nFree shipping on all orders above the threshold.\nTracked delivery via courier service.',
      shipping_tab_heading: 'Nationwide Delivery',
      shipping_bullet_1: 'Orders dispatched within 24 hours.',
      shipping_bullet_2: 'Delivery time: 2–3 business days.',
      shipping_bullet_3: 'Free shipping on all orders above the threshold.',
      shipping_bullet_4: 'Tracked delivery via courier service.',
      order_prefix: 'ORD',
      sku_prefix: 'SKU',
      phone_pattern: '^(\\d{10,15}|\\+\\d{10,15})$',
      phone_placeholder: 'Phone Number',
      search_placeholder: 'Search products...',
      chatbot_name: 'AI Assistant',
      footer_tagline: 'Crafted with care for quality living',
      footer_feature_1_title: 'Free Express Shipping',
      footer_feature_1_text: 'On all orders over the threshold',
      footer_feature_2_title: '100% Quality Guaranteed',
      footer_feature_2_text: 'Direct from trusted sources',
      footer_feature_3_title: '7-Day Satisfaction Guarantee',
      footer_feature_3_text: '100% money back or replacement',
      product_badge_text: 'Premium Quality',
      empty_cart_text: 'Looks like you haven\'t added any products to your cart yet.',
      privacy_policy_content: '<h2 class="text-xl font-bold text-[#3A2E1F] my-4">1. Introduction</h2><p class="mb-4">We value your privacy and are committed to protecting your personal data...</p><h2 class="text-xl font-bold text-[#3A2E1F] my-4">Contact Us</h2><p class="mb-4">If you have any questions, please contact us.</p>',
      about_hero_heading: 'Welcome to Our Store',
      about_hero_subheading: 'We are dedicated to bringing you the finest quality products, sourced with care and delivered to your doorstep.',
      about_story_heading: 'Our Story',
      about_story_text: 'We are passionate about delivering the highest quality products to our customers. Every item in our collection is carefully sourced and quality-checked to ensure you receive nothing but the best.\n\nOur commitment to excellence means we work directly with trusted suppliers, ensuring authenticity and freshness in every order.',
      about_story_image: 'https://images.unsplash.com/photo-1596769062638-e6ed3f46f496?auto=format&fit=crop&q=80&w=800'
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
            badge: 'New Collection 2026',
            title: 'Premium Quality Products For Your Lifestyle',
            subtitle: 'Discover our handpicked selection of premium products, sourced from trusted suppliers.',
            ctaText: 'Shop Now',
            ctaLink: '/shop',
            image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&q=80&w=800',
            highlight: 'Curated Premium Selection'
          },
          {
            badge: 'Best Sellers',
            title: 'Top Rated Products Our Customers Love',
            subtitle: 'Browse our most popular items, rated 5 stars by thousands of happy customers.',
            ctaText: 'View Best Sellers',
            ctaLink: '/shop',
            image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800',
            highlight: 'Trusted By Thousands'
          },
          {
            badge: 'Limited Edition',
            title: 'Exclusive Products Available Now',
            subtitle: 'Get your hands on our exclusive limited-edition products before they sell out.',
            ctaText: 'Discover More',
            ctaLink: '/shop',
            image: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&q=80&w=800',
            highlight: 'Premium Quality Guaranteed'
          }
        ]
      }), 0);

      // 2. Category Showcase
      insertSection.run('category_showcase', 'Browse Categories', JSON.stringify({
        heading: 'Browse Categories',
        description: 'Explore our product categories'
      }), 1);

      // 3. Featured Products Grid
      insertSection.run('product_grid', 'Featured Products', JSON.stringify({
        heading: 'Featured Products',
        badge: 'Best Seller Collection',
        filter: 'featured',
        maxItems: 6
      }), 2);

      // 4. New Arrivals Carousel
      insertSection.run('product_carousel', 'New Arrivals', JSON.stringify({
        heading: 'New Arrivals',
        badge: 'Just Landed',
        description: 'Check out our latest additions to the store.',
        filter: 'new',
        maxItems: 8
      }), 3);

      // 5. Banner Image
      insertSection.run('banner_image', 'Promotional Banner', JSON.stringify({
        image: 'https://images.unsplash.com/photo-1596769062638-e6ed3f46f496?auto=format&fit=crop&q=80&w=1200',
        link: '/shop',
        alt: 'Shop Our Premium Products'
      }), 4);

      // 6. Promo Cards
      insertSection.run('promo_cards', 'Promotional Offers', JSON.stringify({
        cards: [
          {
            badge: 'Save Up to 20% OFF',
            heading: 'Bundle Deals & Combo Packs',
            body: 'Get our curated product bundles at special discounted rates this season.',
            ctaText: 'Shop Deals',
            ctaLink: '/shop',
            theme: 'dark'
          },
          {
            badge: 'Free Express Delivery',
            heading: 'Fast Shipping Nationwide',
            body: 'Enjoy free insured doorstep shipping on qualifying orders. Carefully packed and delivered to your home.',
            ctaText: 'Explore Products',
            ctaLink: '/shop',
            theme: 'light'
          }
        ]
      }), 5);

      // 7. Customer Reviews
      insertSection.run('reviews', 'Customer Reviews', JSON.stringify({
        heading: 'What Our Customers Say',
        reviews: [
          { name: 'Sarah Johnson', rating: 5, text: 'Best quality products I have ever purchased. Truly premium and exactly as described!', location: 'New York' },
          { name: 'Michael Chen', rating: 5, text: 'Amazing products and fast delivery. My whole family loves them. Will order again!', location: 'Los Angeles' },
          { name: 'Emily Davis', rating: 4, text: 'Great selection and fast delivery. Packaging was excellent and everything arrived fresh.', location: 'Chicago' }
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
      insertPA.run('easypaisa', 'Mobile Wallet', '1234567890', 'Store Official', 'Send payment to the above number and upload the screenshot as proof.');
      insertPA.run('jazzcash', 'Mobile Payment', '0987654321', 'Store Official', 'Send payment to the above number and upload the transaction screenshot.');
      insertPA.run('bank_transfer', 'Bank Transfer', 'XX00BANK0012345678901234', 'Store Official', 'Transfer the total amount to the above bank account and upload the receipt screenshot.');
    });
    paTrx();
    console.log('Default payment accounts seeded.');
  }
}

// Automatically create tables if they don't exist
initDb();

module.exports = db;
