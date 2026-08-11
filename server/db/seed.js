const db = require('./db');

const categories = [
    { name: 'Almonds', slug: 'almonds' },
    { name: 'Walnuts', slug: 'walnuts' },
    { name: 'Cashews', slug: 'cashews' },
    { name: 'Pine Nuts', slug: 'pine-nuts' },
    { name: 'Dried Apricots', slug: 'dried-apricots' },
    { name: 'Dried Mulberries', slug: 'dried-mulberries' },
    { name: 'Raisins', slug: 'raisins' },
    { name: 'Dates', slug: 'dates' },
    { name: 'Mixed Nuts', slug: 'mixed-nuts' },
    { name: 'Pistachios', slug: 'pistachios' }
];

const products = [
    {
        name: 'Premium Kaghan Almonds (Regular)',
        slug: 'premium-kaghan-almonds-reg',
        description: 'High-quality naturally sun-dried almonds from the Kaghan valley. Thin-shelled and rich in flavor.',
        category_slug: 'almonds',
        image_url: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46',
        base_price: 650,
        stock: 50,
        weight_options: '[{"label":"250g","price":650},{"label":"500g","price":1250},{"label":"1kg","price":2450}]',
        is_featured: 1
    },
    {
        name: 'Gilgit Paper-Shell Walnuts',
        slug: 'gilgit-paper-shell-walnuts',
        description: 'Famous paper-shell walnuts from Gilgit. Easy to crack by hand, high oil content, and extremely nutritious.',
        category_slug: 'walnuts',
        image_url: 'https://images.unsplash.com/photo-1596769062638-e6ed3f46f496',
        base_price: 1100,
        stock: 45,
        weight_options: '[{"label":"500g","price":1100},{"label":"1kg","price":2100}]',
        is_featured: 1
    },
    {
        name: 'Roasted Salted Cashews',
        slug: 'roasted-salted-cashews',
        description: 'Jumbo-sized cashews, perfectly roasted and lightly sea-salted. Perfect for a healthy snack.',
        category_slug: 'cashews',
        image_url: 'https://images.unsplash.com/photo-1599827552599-2f36dcf80ee0',
        base_price: 1550,
        stock: 60,
        weight_options: '[{"label":"250g","price":1550},{"label":"500g","price":3000},{"label":"1kg","price":5900}]',
        is_featured: 0
    },
    {
        name: 'Chilgoza (Pine Nuts) from Chilas',
        slug: 'chilgoza-pine-nuts-chilas',
        description: '100% organic Chilgoza from the forests of Chilas. Rich in healthy fats and uniquely flavored.',
        category_slug: 'pine-nuts',
        image_url: 'https://images.unsplash.com/photo-1629828343714-c1884dd00ed3',
        base_price: 3200,
        stock: 20,
        weight_options: '[{"label":"250g","price":3200},{"label":"500g","price":6300},{"label":"1kg","price":12500}]',
        is_featured: 1
    },
    {
        name: 'Hunza Sun-Dried Apricots',
        slug: 'hunza-sun-dried-apricots',
        description: 'Golden, sweet and fleshy dried apricots directly brought from the orchards of Hunza.',
        category_slug: 'dried-apricots',
        image_url: 'https://images.unsplash.com/photo-1599879207869-7c87c2fb2402',
        base_price: 750,
        stock: 100,
        weight_options: '[{"label":"500g","price":750},{"label":"1kg","price":1450}]',
        is_featured: 1
    },
    {
        name: 'Skardu Sweet White Mulberries',
        slug: 'skardu-white-mulberries',
        description: 'Chewy, candy-like dried white mulberries from Skardu. A fantastic natural sweetener.',
        category_slug: 'dried-mulberries',
        image_url: 'https://images.unsplash.com/photo-1604130635338-04ff4fa31ae8',
        base_price: 600,
        stock: 35,
        weight_options: '[{"label":"500g","price":600},{"label":"1kg","price":1150}]',
        is_featured: 0
    },
    {
        name: 'Sundarkhani Raisins (Kishmish)',
        slug: 'sundarkhani-raisins',
        description: 'Long green seedless Sundarkhani raisins, naturally dried and highly nutritious.',
        category_slug: 'raisins',
        image_url: 'https://images.unsplash.com/photo-1591118671587-c10f8245ed0e',
        base_price: 800,
        stock: 70,
        weight_options: '[{"label":"250g","price":800},{"label":"500g","price":1550},{"label":"1kg","price":3000}]',
        is_featured: 0
    },
    {
        name: 'Premium Ajwa Dates',
        slug: 'premium-ajwa-dates',
        description: 'High grade, soft and luscious Ajwa dates. A timeless superfood.',
        category_slug: 'dates',
        image_url: 'https://images.unsplash.com/photo-1589139857948-c8ee575dce18',
        base_price: 2500,
        stock: 40,
        weight_options: '[{"label":"250g","price":2500},{"label":"500g","price":4800},{"label":"1kg","price":9500}]',
        is_featured: 1
    },
    {
        name: 'GBMarket 5-Nut Mix',
        slug: 'gbmarket-5-nut-mix',
        description: 'A special power-packed blend of almonds, walnuts, cashews, pistachios, and raisins.',
        category_slug: 'mixed-nuts',
        image_url: 'https://images.unsplash.com/photo-1594951468249-f79a953eacc2',
        base_price: 1800,
        stock: 65,
        weight_options: '[{"label":"500g","price":1800},{"label":"1kg","price":3500}]',
        is_featured: 1
    },
    {
        name: 'Roasted Salted Pistachios (Irani)',
        slug: 'roasted-salted-pistachios',
        description: 'Premium roasted pistachios with a hint of salt. Easy-to-open shells and a perfect crunch.',
        category_slug: 'pistachios',
        image_url: 'https://images.unsplash.com/photo-1593952796191-456cb0b82f0c',
        base_price: 1850,
        stock: 80,
        weight_options: '[{"label":"250g","price":1850},{"label":"500g","price":3600},{"label":"1kg","price":7100}]',
        is_featured: 1
    }
];

// Clean out existing data before seeding
db.exec(`
  DELETE FROM order_items;
  DELETE FROM orders;
  DELETE FROM products;
  DELETE FROM categories;
`);

// Insert Categories
const insertCategory = db.prepare('INSERT INTO categories (name, slug) VALUES (@name, @slug)');
const categoryMap = {};

categories.forEach(c => {
    const result = insertCategory.run(c);
    categoryMap[c.slug] = result.lastInsertRowid;
});

// Insert Products
const insertProduct = db.prepare(`
  INSERT INTO products (
    name, slug, description, category_id, image_url, base_price, stock, weight_options, is_featured
  ) VALUES (
    @name, @slug, @description, @category_id, @image_url, @base_price, @stock, @weight_options, @is_featured
  )
`);

products.forEach(p => {
    const categoryId = categoryMap[p.category_slug];
    insertProduct.run({
        name: p.name,
        slug: p.slug,
        description: p.description,
        category_id: categoryId,
        image_url: p.image_url,
        base_price: p.base_price,
        stock: p.stock,
        weight_options: p.weight_options,
        is_featured: p.is_featured
    });
});

console.log('Database seeding complete: Inserted 10 categories and 10 products successfully.');
