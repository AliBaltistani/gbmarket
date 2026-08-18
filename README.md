# GBMarket - Premium Dry Fruits & Nuts Platform

![GBMarket Cover](https://images.unsplash.com/photo-1596769062638-e6ed3f46f496?auto=format&fit=crop&q=80&w=1200)

GBMarket is a premium e-commerce platform dedicated to bringing 100% authentic, sun-dried organic dry fruits and nuts directly from the mountain farmers of Gilgit-Baltistan to your doorstep across Pakistan.

The platform is designed with a modern, responsive UI focused on a seamless shopping experience, alongside a fully-featured CMS admin panel, robust backend, and production-ready SEO optimizations.

## 🚀 Key Features

### Storefront
* **Dynamic Homepage**: Fully customizable promotional strips, carousels, and category showcases built from the admin panel.
* **Shopping Experience**: Filtered product listings, detailed product pages, intuitive cart system, and mobile-friendly sticky action bars.
* **Order Tracking System**: Real-time order tracking timeline via phone number and order ID.
* **SEO & Rich Snippets**: Deeply integrated meta tags (Open Graph, Twitter Cards) and JSON-LD structured data (Product, Organization, BreadcrumbList) for maximum search engine visibility.

### Admin Panel (CMS)
* **Inventory Management**: Create, edit, and soft-delete categories and products.
* **Order Management**: Process orders, verify payment proofs, and update statuses.
* **Homepage Builder**: A dynamic layout builder specifically for injecting and re-ordering promotional banners and carousels on the storefront.
* **Store Settings**: Centrally manage contact information, hero imagery, minimum order values, and business policies.

## 🛠️ Technology Stack

**Frontend (Client)**
* [React JS](https://reactjs.org/) powered by [Vite](https://vitejs.dev/)
* [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
* [React Router DOM](https://reactrouter.com/) for client-side routing
* [React Helmet Async](https://github.com/staylor/react-helmet-async) for dynamic document head management
* [Lucide React](https://lucide.dev/) for crisp, consistent iconography

**Backend (Server)**
* [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
* [Better SQLite3](https://github.com/WiseLibs/better-sqlite3) for a blazing fast, embedded SQL database
* [Multer](https://github.com/expressjs/multer) & Local Storage for media management
* **Security**: `helmet`, `express-rate-limit`, and recursive payload XSS sanitization. 

## 📦 Local Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone <your-repository-url>
   cd gbmarket
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   
   # Duplicate the environment template and configure your secrets
   cp .env.example .env 
   
   # Start the Express server (starts on Port 5000 by default)
   npm run dev
   ```
   *(Note: The embedded `gbmarket.db` SQLite database will auto-initialize upon server startup).*

3. **Frontend Setup**
   ```bash
   # Open a new terminal tab
   cd ../client
   npm install
   
   # Start the Vite development server
   npm run dev
   ```

4. **Access the Platform**
   * Storefront: `http://localhost:5173`
   * Admin Login: `http://localhost:5173/admin/login` (Check seeds configuration for default credentials).

## 🚦 Before You Deploy (Production Checklist)

Before deploying to a live production environment, verify the following configurations are complete:
- [ ] `CLIENT_ORIGIN` is set to your real frontend URL(s) in server's environment variables — if left unset or wrong, all API requests from your live frontend will fail with CORS errors (comma-separate multiple origins if needed, e.g. both your custom domain and a Vercel preview URL)
- [ ] `VITE_API_URL` is set to your real backend URL in the frontend's environment variables at build time — if left as the local default, your deployed frontend will try to call localhost and fail
- [ ] `JWT_SECRET` is set to a real, long random value (not the placeholder) — the server already refuses to start with the placeholder value, but confirm it's set before deploying
- [ ] `ADMIN_USERNAME` and `ADMIN_PASSWORD` are set to real values before running the seed script for the first time in production
- [ ] `DB_PATH` is set to a path on a persistent disk/volume if your hosting platform supports one (see "Database Persistence in Production" section) — otherwise your database may be wiped on redeploy
- [ ] `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are all set — otherwise uploaded images will not persist in production
- [ ] `site_url` is set correctly in Admin → Settings after your first deploy, so `robots.txt` and `sitemap.xml` point to your real domain instead of a placeholder or the wrong host
- [ ] `NODE_ENV` is set to "production" in your hosting platform's environment variables

## 🖼️ Image Storage (Production)

By default, uploaded images are stored temporarily on local disk (fine for local development). For production deployment:
* Sign up for a free Cloudinary account and set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in your `.env` file.
* If migrating an existing deployment from local storage to Cloudinary, previously uploaded images will need to be manually re-uploaded through the admin panel, since old `/uploads/...` URLs won't resolve on hosts without persistent local storage.

## 💾 Database Persistence in Production

SQLite is a file-based database — it MUST live on a persistent volume/disk in production, not the app's own ephemeral code directory.
* On **Render**: create a persistent disk in your service settings, mount it at a path like `/data`, and set `DB_PATH=/data/gbmarket.db` in your environment variables.
* On platforms without persistent disk support (e.g. typical Vercel serverless functions), SQLite will NOT reliably persist at all. A hosted database service (like Turso, which is SQLite-compatible) would be required instead. This is a platform limitation, not something `DB_PATH` alone can fix.

## 🗺️ Architectural Highlights

* **Dynamic Sitemap**: Driven by `/sitemap.xml` express route handling database queries injecting `lastmod` data to notify search engines.
* **Bulk Imports**: Support for mass CSV ingestion with relational data integrity validation.
* **Modularity**: Strict division of concerns between Express route handlers, SQLite schemas, API middleware, and React components.

## 📄 License

Proprietary License - Do not distribute. All rights reserved by GBMarket.
