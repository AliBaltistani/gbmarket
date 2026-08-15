import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';
import RouteTransition from './components/RouteTransition';
import MobileCartBar from './components/MobileCartBar';
import WhatsAppButton from './components/WhatsAppButton';
import ChatBot from './components/ChatBot';

// Lazy-loaded Storefront Pages
const Home = React.lazy(() => import('./pages/Home'));
const Shop = React.lazy(() => import('./pages/Shop'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const OrderConfirmation = React.lazy(() => import('./pages/OrderConfirmation'));
const About = React.lazy(() => import('./pages/About'));
const Contact = React.lazy(() => import('./pages/Contact'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const TrackOrder = React.lazy(() => import('./pages/TrackOrder'));

// Lazy-loaded Admin Components & Pages
const AdminLogin = React.lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = React.lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = React.lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders = React.lazy(() => import('./pages/admin/AdminOrders'));
const AdminCategories = React.lazy(() => import('./pages/admin/AdminCategories'));
const AdminSettings = React.lazy(() => import('./pages/admin/AdminSettings'));
const AdminHomepage = React.lazy(() => import('./pages/admin/AdminHomepage'));
const AdminPayments = React.lazy(() => import('./pages/admin/AdminPayments'));

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
      <ChatBot />
      <WhatsAppButton />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <SettingsProvider>
            <RouteTransition>
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-screen">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F5A623]"></div>
                </div>
              }>
                <Routes>
                  {/* Admin Login - Standalone Page */}
                  <Route path="/admin/login" element={<AdminLogin />} />

                  {/* Protected Admin Routes */}
                  <Route path="/admin" element={<ProtectedAdminRoute />}>
                    <Route element={<AdminLayout />}>
                      <Route index element={<Navigate to="/admin/dashboard" replace />} />
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="homepage" element={<AdminHomepage />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="categories" element={<AdminCategories />} />
                      <Route path="settings" element={<AdminSettings />} />
                      <Route path="payments" element={<AdminPayments />} />
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
                    <Route path="/track-order" element={<TrackOrder />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </Suspense>
            </RouteTransition>
          </SettingsProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
