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

---

### 3. Orders

#### Get All Orders
\`\`\`bash
curl http://localhost:5000/api/orders
\`\`\`
*Returns:* Array of all orders, including their inner `items` array directly fetched from `order_items`.

#### Create an Order (with Items)
\`\`\`bash
curl -X POST -H "Content-Type: application/json" -d '{
  "customer_name": "Ali Khan",
  "phone": "03001234567",
  "address": "123 Test St, Lahore",
  "total": 3100,
  "payment_method": "COD",
  "items": [
    {
      "product_id": 1,
      "product_name": "Premium Kaghan Almonds",
      "weight_option": "1kg",
      "quantity": 1,
      "price": 2450
    },
    {
      "product_id": 5,
      "product_name": "Hunza Sun-Dried Apricots",
      "weight_option": "500g",
      "quantity": 1,
      "price": 650
    }
  ]
}' http://localhost:5000/api/orders
\`\`\`
*Note: This automatically decrements product stock based on `quantity` passed.*

#### Update Order Status
```bash
curl -X PATCH -H "Content-Type: application/json" -d '{
  "status": "Shipped"
}' http://localhost:5000/api/orders/1
```
*Valid statuses:* `Pending`, `Processing`, `Shipped`, `Delivered`.

---

### 4. Settings

#### Get All Settings
```bash
curl http://localhost:5000/api/settings
```
*Returns:* Flat key-value JSON object containing all core site settings like `store_name`, `contact_email`, `hero_image_url`, etc.

#### Update Settings (Admin Only)
```bash
curl -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer <jwt-token>" -d '{
  "store_name": "GBMarket Updated",
  "currency_symbol": "Rs."
}' http://localhost:5000/api/settings
```
*Returns:* The fully updated JSON setting map representing the live state. Supports partial updates (only the submitted keys get replaced).
