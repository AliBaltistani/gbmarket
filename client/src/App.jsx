import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

// Storefront Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

// Admin Components & Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCategories from './pages/admin/AdminCategories';
import AdminSettings from './pages/admin/AdminSettings';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';
import RouteTransition from './components/RouteTransition';
import MobileCartBar from './components/MobileCartBar';

// Storefront Layout Component
function StorefrontLayout() {
  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#3A2E1F] font-body flex flex-col antialiased selection:bg-[#F5A623] selection:text-[#3A2E1F]">
      <Header />
      <main className="flex-grow pt-20 px-4 sm:px-6 lg:px-8 pb-20 md:pb-8">
        <Outlet />
      </main>
      <Footer />
      <MobileCartBar />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SettingsProvider>
          <RouteTransition>
            <Routes>
              {/* Admin Login - Standalone Page */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Protected Admin Routes */}
              <Route path="/admin" element={<ProtectedAdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
              </Route>

              {/* Storefront Routes wrapped in Storefront Layout */}
              <Route element={<StorefrontLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:slug" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </RouteTransition>
        </SettingsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
