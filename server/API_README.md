# GBMarket Backend API Documentation

This directory contains the Express backend for GBMarket, using a local SQLite database (`gbmarket.db`).

## Setup and Run
```bash
# 1. Install dependencies
npm install

# 2. Reseed the database (Optional, it resets data to initial dataset)
npm run seed

# 3. Start development server
npm run dev
```

## Available Endpoints (Port 5000)

### 1. Categories 
#### Get All Categories
\`\`\`bash
curl http://localhost:5000/api/categories
\`\`\`
*Returns:* Array of all categories with `id`, `name`, and `slug`.

#### Create Category
\`\`\`bash
curl -X POST -H "Content-Type: application/json" -d '{"name":"Dried Beans", "slug":"dried-beans"}' http://localhost:5000/api/categories
\`\`\`

#### Delete Category
\`\`\`bash
curl -X DELETE http://localhost:5000/api/categories/11
\`\`\`

---

### 2. Products 

#### Get All Products
\`\`\`bash
curl http://localhost:5000/api/products
\`\`\`
*Returns:* Array of all products with `category_name`, `category_slug`, and parsed `weight_options`.

#### Filter Products by Category Slug
\`\`\`bash
curl http://localhost:5000/api/products?category=almonds
\`\`\`

#### Search Products
\`\`\`bash
curl "http://localhost:5000/api/products?search=almond"
\`\`\`
*Note: Performs case-insensitive search across product `name` and `description`.*

#### Get Product by Slug
\`\`\`bash
curl http://localhost:5000/api/products/premium-kaghan-almonds-reg
\`\`\`

#### Create a Product
\`\`\`bash
curl -X POST -H "Content-Type: application/json" -d '{
  "name": "Sample Product",
  "slug": "sample-product",
  "description": "Test item",
  "category_id": 1,
  "base_price": 500,
  "weight_options": [{"label":"1kg","price":500}]
}' http://localhost:5000/api/products
\`\`\`

#### Update a Product
\`\`\`bash
curl -X PUT -H "Content-Type: application/json" -d '{
  "name": "Updated Product",
  "slug": "sample-product",
  "base_price": 600
}' http://localhost:5000/api/products/1
\`\`\`

#### Delete a Product
\`\`\`bash
curl -X DELETE http://localhost:5000/api/products/1
\`\`\`
