import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ProfileOrders from './pages/ProfileOrders';
import OrderSuccess from './pages/OrderSuccess';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import ProductForm from './pages/admin/ProductForm';
import BulkProductUpload from './pages/admin/BulkProductUpload';
import Orders from './pages/admin/Orders';
import OrderForm from './pages/admin/OrderForm';
import Customers from './pages/admin/Customers';
import CustomerForm from './pages/admin/CustomerForm';
import Banners from './pages/admin/Banners';
import BannerForm from './pages/admin/BannerForm';
import Revenue from './pages/admin/Revenue';
import About from './pages/About';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Reviews from './pages/admin/Reviews';
import Testimonials from './pages/admin/Testimonials';

// Protected Routes
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/orders" element={<ProfileOrders />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/checkout" element={<Checkout />} />
                
                {/* Protected Routes */}
                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } />
                
                {/* Admin Routes */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />
                <Route path="/admin/products" element={
                  <AdminRoute>
                    <AdminProducts />
                  </AdminRoute>
                } />
                <Route path="/admin/products/new" element={
                  <AdminRoute>
                    <ProductForm />
                  </AdminRoute>
                } />
                <Route path="/admin/products/edit/:id" element={
                  <AdminRoute>
                    <ProductForm />
                  </AdminRoute>
                } />
                <Route path="/admin/products/bulk-upload" element={
                  <AdminRoute>
                    <BulkProductUpload />
                  </AdminRoute>
                } />
                <Route path="/admin/orders" element={
                  <AdminRoute>
                    <Orders />
                  </AdminRoute>
                } />
                <Route path="/admin/orders/new" element={
                  <AdminRoute>
                    <OrderForm />
                  </AdminRoute>
                } />
                <Route path="/admin/customers" element={
                  <AdminRoute>
                    <Customers />
                  </AdminRoute>
                } />
                <Route path="/admin/customers/new" element={
                  <AdminRoute>
                    <CustomerForm />
                  </AdminRoute>
                } />
                <Route path="/admin/customers/edit/:id" element={
                  <AdminRoute>
                    <CustomerForm />
                  </AdminRoute>
                } />
                <Route path="/admin/banners" element={
                  <AdminRoute>
                    <Banners />
                  </AdminRoute>
                } />
                <Route path="/admin/banners/new" element={
                  <AdminRoute>
                    <BannerForm />
                  </AdminRoute>
                } />
                <Route path="/admin/banners/edit/:id" element={
                  <AdminRoute>
                    <BannerForm />
                  </AdminRoute>
                } />
                <Route path="/admin/revenue" element={
                  <AdminRoute>
                    <Revenue />
                  </AdminRoute>
                } />
                <Route path="/admin/reviews" element={<AdminRoute><Reviews /></AdminRoute>} />
                <Route path="/admin/testimonials" element={<AdminRoute><Testimonials /></AdminRoute>} />

                {/* Catch all route - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
            <ToastContainer position="bottom-right" />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
