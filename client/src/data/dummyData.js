export const categories = [
    { id: 1, name: 'Almonds', slug: 'almonds', count: 12, icon: 'Nut' },
    { id: 2, name: 'Walnuts', slug: 'walnuts', count: 8, icon: 'CircleDot' },
    { id: 3, name: 'Cashews', slug: 'cashews', count: 10, icon: 'Sparkles' },
    { id: 4, name: 'Pine Nuts', slug: 'pine-nuts', count: 5, icon: 'Trees' },
    { id: 5, name: 'Dried Apricots', slug: 'dried-apricots', count: 14, icon: 'Sun' },
    { id: 6, name: 'Dried Mulberries', slug: 'dried-mulberries', count: 6, icon: 'Grape' },
    { id: 7, name: 'Raisins', slug: 'raisins', count: 9, icon: 'Flame' },
    { id: 8, name: 'Dates', slug: 'dates', count: 11, icon: 'Crown' },
    { id: 9, name: 'Mixed Nuts', slug: 'mixed-nuts', count: 7, icon: 'Box' },
    { id: 10, name: 'Pistachios', slug: 'pistachios', count: 15, icon: 'ShieldCheck' },
];

export const products = [
    {
        id: 1,
        name: 'Premium Kaghan Almonds',
        slug: 'premium-kaghan-almonds',
        category: 'Almonds',
        categorySlug: 'almonds',
        basePrice: 650,
        rating: 4.9,
        reviewsCount: 128,
        stock: 50,
        stockStatus: 'In Stock',
        isFeatured: true,
        isNew: true,
        description: 'High-quality naturally sun-dried almonds harvested from the pristine Kaghan valley. Thin-shelled, buttery, and packed with vitamin E.',
        images: [
            'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1594951468249-f79a953eacc2?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1599827552599-2f36dcf80ee0?auto=format&fit=crop&q=80&w=800'
        ],
        weightOptions: [
            { label: '250g', price: 650 },
            { label: '500g', price: 1250 },
            { label: '1kg', price: 2450 }
        ],
        nutritionInfo: {
            calories: '579 kcal per 100g',
            protein: '21.2g',
            carbs: '21.6g',
            fat: '49.9g',
            fiber: '12.5g'
        }
    },
    {
        id: 2,
        name: 'Gilgit Paper-Shell Walnuts',
        slug: 'gilgit-paper-shell-walnuts',
        category: 'Walnuts',
        categorySlug: 'walnuts',
        basePrice: 1100,
        rating: 4.8,
        reviewsCount: 94,
        stock: 45,
        stockStatus: 'In Stock',
        isFeatured: true,
        isNew: false,
        description: 'Famous paper-shell walnuts straight from Gilgit-Baltistan orchards. Effortless to crack by hand, high in Omega-3 fatty acids and natural oils.',
        images: [
            'https://images.unsplash.com/photo-1596769062638-e6ed3f46f496?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&q=80&w=800'
        ],
        weightOptions: [
            { label: '500g', price: 1100 },
            { label: '1kg', price: 2100 }
        ],
        nutritionInfo: {
            calories: '654 kcal per 100g',
            protein: '15.2g',
            carbs: '13.7g',
            fat: '65.2g',
            fiber: '6.7g'
        }
    },
    {
        id: 3,
        name: 'Roasted Salted Cashews',
        slug: 'roasted-salted-cashews',
        category: 'Cashews',
        categorySlug: 'cashews',
        basePrice: 1550,
        rating: 4.7,
        reviewsCount: 76,
        stock: 60,
        stockStatus: 'In Stock',
        isFeatured: false,
        isNew: true,
        description: 'Jumbo-grade whole cashews roasted to golden crisp perfection and lightly seasoned with pink Himalayan salt.',
        images: [
            'https://images.unsplash.com/photo-1599827552599-2f36dcf80ee0?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1593952796191-456cb0b82f0c?auto=format&fit=crop&q=80&w=800'
        ],
        weightOptions: [
            { label: '250g', price: 1550 },
            { label: '500g', price: 3000 },
            { label: '1kg', price: 5900 }
        ],
        nutritionInfo: {
            calories: '553 kcal per 100g',
            protein: '18.2g',
            carbs: '30.2g',
            fat: '43.8g',
            fiber: '3.3g'
        }
    },
    {
        id: 4,
        name: 'Chilgoza (Pine Nuts) from Chilas',
        slug: 'chilgoza-pine-nuts-chilas',
        category: 'Pine Nuts',
        categorySlug: 'pine-nuts',
        basePrice: 3200,
        rating: 5.0,
        reviewsCount: 210,
        stock: 8,
        stockStatus: 'Low Stock',
        isFeatured: true,
        isNew: true,
        description: 'Rare and precious wild-harvested pine nuts (Chilgoza) from the pine forests of Chilas. Exceptionally buttery and rich.',
        images: [
            'https://images.unsplash.com/photo-1629828343714-c1884dd00ed3?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&q=80&w=800'
        ],
        weightOptions: [
            { label: '250g', price: 3200 },
            { label: '500g', price: 6300 },
            { label: '1kg', price: 12500 }
        ],
        nutritionInfo: {
            calories: '673 kcal per 100g',
            protein: '13.7g',
            carbs: '13.1g',
            fat: '68.4g',
            fiber: '3.7g'
        }
    },
    {
        id: 5,
        name: 'Hunza Sun-Dried Apricots',
        slug: 'hunza-sun-dried-apricots',
        category: 'Dried Apricots',
        categorySlug: 'dried-apricots',
        basePrice: 750,
        rating: 4.9,
        reviewsCount: 152,
        stock: 100,
        stockStatus: 'In Stock',
        isFeatured: true,
        isNew: false,
        description: 'Chewy, sweet organic apricots naturally sun-dried without added sugars or preservatives. Pure mountain goodness.',
        images: [
            'https://images.unsplash.com/photo-1599879207869-7c87c2fb2402?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1604130635338-04ff4fa31ae8?auto=format&fit=crop&q=80&w=800'
        ],
        weightOptions: [
            { label: '500g', price: 750 },
            { label: '1kg', price: 1450 }
        ],
        nutritionInfo: {
            calories: '241 kcal per 100g',
            protein: '3.4g',
            carbs: '62.6g',
            fat: '0.5g',
            fiber: '7.3g'
        }
    },
    {
        id: 6,
        name: 'Skardu Sweet White Mulberries',
        slug: 'skardu-white-mulberries',
        category: 'Dried Mulberries',
        categorySlug: 'dried-mulberries',
        basePrice: 600,
        rating: 4.6,
        reviewsCount: 42,
        stock: 35,
        stockStatus: 'In Stock',
        isFeatured: false,
        isNew: false,
        description: 'Caramel-like dried white mulberries harvested from Skardu valley. Excellent healthy snack for tea time.',
        images: [
            'https://images.unsplash.com/photo-1604130635338-04ff4fa31ae8?auto=format&fit=crop&q=80&w=800'
        ],
        weightOptions: [
            { label: '500g', price: 600 },
            { label: '1kg', price: 1150 }
        ],
        nutritionInfo: {
            calories: '325 kcal per 100g',
            protein: '9.6g',
            carbs: '74.6g',
            fat: '2.5g',
            fiber: '14.0g'
        }
    },
    {
        id: 7,
        name: 'Sundarkhani Seedless Raisins',
        slug: 'sundarkhani-raisins',
        category: 'Raisins',
        categorySlug: 'raisins',
        basePrice: 800,
        rating: 4.8,
        reviewsCount: 88,
        stock: 70,
        stockStatus: 'In Stock',
        isFeatured: false,
        isNew: true,
        description: 'Elongated green Sundarkhani raisins, sweet and juicy, dried in shade to retain rich natural flavor and color.',
        images: [
            'https://images.unsplash.com/photo-1591118671587-c10f8245ed0e?auto=format&fit=crop&q=80&w=800'
        ],
        weightOptions: [
            { label: '250g', price: 800 },
            { label: '500g', price: 1550 },
            { label: '1kg', price: 3000 }
        ],
        nutritionInfo: {
            calories: '299 kcal per 100g',
            protein: '3.1g',
            carbs: '79.2g',
            fat: '0.5g',
            fiber: '3.7g'
        }
    },
    {
        id: 8,
        name: 'Royal Ajwa Dates',
        slug: 'royal-ajwa-dates',
        category: 'Dates',
        categorySlug: 'dates',
        basePrice: 2500,
        rating: 4.9,
        reviewsCount: 165,
        stock: 40,
        stockStatus: 'In Stock',
        isFeatured: true,
        isNew: false,
        description: 'Selected dark, soft, and moist royal Ajwa dates. Renowned worldwide for their delicate sweet flavor and health benefits.',
        images: [
            'https://images.unsplash.com/photo-1589139857948-c8ee575dce18?auto=format&fit=crop&q=80&w=800'
        ],
        weightOptions: [
            { label: '250g', price: 2500 },
            { label: '500g', price: 4800 },
            { label: '1kg', price: 9500 }
        ],
        nutritionInfo: {
            calories: '277 kcal per 100g',
            protein: '1.8g',
            carbs: '75.0g',
            fat: '0.2g',
            fiber: '6.7g'
        }
    },
    {
        id: 9,
        name: 'GBMarket 5-Nut Power Mix',
        slug: 'gbmarket-5-nut-mix',
        category: 'Mixed Nuts',
        categorySlug: 'mixed-nuts',
        basePrice: 1800,
        rating: 4.9,
        reviewsCount: 310,
        stock: 65,
        stockStatus: 'In Stock',
        isFeatured: true,
        isNew: true,
        description: 'Our signature energy mix featuring almonds, walnuts, cashews, pistachios, and Sundarkhani raisins in perfect balance.',
        images: [
            'https://images.unsplash.com/photo-1594951468249-f79a953eacc2?auto=format&fit=crop&q=80&w=800'
        ],
        weightOptions: [
            { label: '500g', price: 1800 },
            { label: '1kg', price: 3500 }
        ],
        nutritionInfo: {
            calories: '590 kcal per 100g',
            protein: '19.5g',
            carbs: '26.4g',
            fat: '48.1g',
            fiber: '8.2g'
        }
    },
    {
        id: 10,
        name: 'Roasted Salted Pistachios',
        slug: 'roasted-salted-pistachios',
        category: 'Pistachios',
        categorySlug: 'pistachios',
        basePrice: 1850,
        rating: 4.8,
        reviewsCount: 119,
        stock: 80,
        stockStatus: 'In Stock',
        isFeatured: true,
        isNew: false,
        description: 'Cracked open roasted pistachios with a satisfying crunch and slight salt touch. High in antioxidants and potassium.',
        images: [
            'https://images.unsplash.com/photo-1593952796191-456cb0b82f0c?auto=format&fit=crop&q=80&w=800'
        ],
        weightOptions: [
            { label: '250g', price: 1850 },
            { label: '500g', price: 3600 },
            { label: '1kg', price: 7100 }
        ],
        nutritionInfo: {
            calories: '562 kcal per 100g',
            protein: '20.2g',
            carbs: '27.2g',
            fat: '45.3g',
            fiber: '10.3g'
        }
    }
];

export const blogPosts = [
    {
        id: 1,
        title: '7 Health Benefits of Gilgit Walnuts You Must Know',
        slug: 'health-benefits-gilgit-walnuts',
        date: 'Aug 10, 2026',
        author: 'Dr. Ayesha Malik',
        excerpt: 'Discover why paper-shell walnuts from Gilgit-Baltistan are considered the ultimate brain food loaded with Omega-3 fats.',
        image: 'https://images.unsplash.com/photo-1596769062638-e6ed3f46f496?auto=format&fit=crop&q=80&w=600'
    },
    {
        id: 2,
        title: 'How We Source Sun-Dried Apricots from Hunza Valley',
        slug: 'sourcing-apricots-hunza-valley',
        date: 'Aug 04, 2026',
        author: 'GBMarket Sourcing Team',
        excerpt: 'Take a visual tour through Hunza orchards and see how local farmers traditionally dry apricots without chemicals.',
        image: 'https://images.unsplash.com/photo-1599879207869-7c87c2fb2402?auto=format&fit=crop&q=80&w=600'
    },
    {
        id: 3,
        title: 'The Ultimate Guide to Storing Nuts & Dry Fruits Fresh',
        slug: 'guide-to-storing-nuts-dry-fruits',
        date: 'Jul 28, 2026',
        author: 'Chef Hameed Khan',
        excerpt: 'Keep your almonds, cashews, and Chilgoza crisp for months with these simple airtight container and refrigeration tips.',
        image: 'https://images.unsplash.com/photo-1594951468249-f79a953eacc2?auto=format&fit=crop&q=80&w=600'
    }
];

export const initialCartItems = [
    {
        id: 1,
        productId: 1,
        name: 'Premium Kaghan Almonds',
        slug: 'premium-kaghan-almonds',
        selectedWeight: '500g',
        unitPrice: 1250,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&q=80&w=400'
    },
    {
        id: 2,
        productId: 5,
        name: 'Hunza Sun-Dried Apricots',
        slug: 'hunza-sun-dried-apricots',
        selectedWeight: '500g',
        unitPrice: 750,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1599879207869-7c87c2fb2402?auto=format&fit=crop&q=80&w=400'
    },
    {
        id: 3,
        productId: 9,
        name: 'GBMarket 5-Nut Power Mix',
        slug: 'gbmarket-5-nut-mix',
        selectedWeight: '1kg',
        unitPrice: 3500,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1594951468249-f79a953eacc2?auto=format&fit=crop&q=80&w=400'
    }
];
