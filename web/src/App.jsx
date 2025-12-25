import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { loadUser } from './redux/slices/authSlice';

// Customer Pages
import HomePage from './pages/customer/HomePage';
import ProductListPage from './pages/customer/ProductListPage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import StorePage from './pages/customer/StorePage';
import CartPage from './pages/customer/CartPage';
import WishlistPage from './pages/customer/WishlistPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrderHistoryPage from './pages/customer/OrderHistoryPage';
import OrderDetailPage from './pages/customer/OrderDetailPage';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import ProfilePage from './pages/customer/ProfilePage';
import AddressesPage from './pages/customer/AddressesPage';
import SettingsPage from './pages/customer/SettingsPage';
import CustomerChatPage from './pages/chat/CustomerChatPage';
import SellerChatPage from './pages/chat/SellerChatPage';
import StoreManagerChatPage from './pages/chat/StoreManagerChatPage';
import SuperAdminChatPage from './pages/chat/SuperAdminChatPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

import SellerDashboard from './pages/seller/SellerDashboard';
import ProductsPage from './pages/seller/ProductsPage';
import AddProductPage from './pages/seller/AddProductPage';
import EditProductPage from './pages/seller/EditProductPage';
import OrdersPage from './pages/seller/OrdersPage';
import SellerOrderDetailPage from './pages/seller/OrderDetailPage';
import StoreProfilePage from './pages/seller/StoreProfilePage';
import AnalyticsPage from './pages/seller/AnalyticsPage';
import ManagersPage from './pages/seller/ManagersPage';
import RegisterStorePage from './pages/seller/RegisterStorePage';
import SellerEditProfilePage from './pages/seller/SellerEditProfilePage';

// Admin Pages
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';
import StoreRequestsPage from './pages/admin/StoreRequestsPage';
import AdminStoresPage from './pages/admin/AdminStoresPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminLogsPage from './pages/admin/AdminLogsPage';
import PlatformSettingsPage from './pages/admin/PlatformSettingsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import StoreAdminDashboard from './pages/admin/StoreAdminDashboard';
import StoreManagerDashboard from './pages/admin/StoreManagerDashboard';
import StoreManagerAnalyticsPage from './pages/admin/StoreManagerAnalyticsPage';
import StoreManagerSettingsPage from './pages/admin/StoreManagerSettingsPage';
import StoreManagerProfilePage from './pages/admin/StoreManagerProfilePage';
import SuperAdminProfilePage from './pages/admin/SuperAdminProfilePage';
import ProductManagementPage from './pages/admin/ProductManagementPage';
import OrderManagementPage from './pages/admin/OrderManagementPage';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);

  // If we have a token but no user, wait for hydration
  // This prevents redirecting to login/home while fetching user data
  if (isAuthenticated && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Guest Route Component (redirects to dashboard if already logged in)
const GuestRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (isAuthenticated && user) {
    if (user.role === 'superadmin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === 'store_admin') {
      return <Navigate to="/seller/dashboard" replace />;
    } else if (user.role === 'store_manager') {
      return <Navigate to="/store-manager/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

function App() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(loadUser());
    }
  }, [dispatch, token]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<ProductListPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/stores/:id" element={<StorePage />} />
      <Route path="/login" element={
        <GuestRoute>
          <LoginPage />
        </GuestRoute>
      } />
      <Route path="/register" element={
        <GuestRoute>
          <RegisterPage />
        </GuestRoute>
      } />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      {/* Customer Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/addresses"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <AddressesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CartPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wishlist"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <WishlistPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CheckoutPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <OrderHistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <OrderDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerChatPage />
          </ProtectedRoute>
        }
      />

      {/* SuperAdmin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/chat"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <SuperAdminChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/store-requests"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <StoreRequestsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/stores"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <AdminStoresPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <AdminUsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <AdminProductsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/logs"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <AdminLogsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <AdminAnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <PlatformSettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <SuperAdminProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Store Admin Routes */}
      <Route
        path="/store-admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['store_admin']}>
            <Navigate to="/seller/dashboard" replace />
          </ProtectedRoute>
        }
      />

      {/* Store Manager Routes */}
      <Route
        path="/store-manager/dashboard"
        element={
          <ProtectedRoute allowedRoles={['store_manager', 'store_admin']}>
            <StoreManagerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store-manager/products"
        element={
          <ProtectedRoute allowedRoles={['store_manager', 'store_admin']}>
            <ProductManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store-manager/orders"
        element={
          <ProtectedRoute allowedRoles={['store_manager', 'store_admin']}>
            <OrderManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store-manager/chat"
        element={
          <ProtectedRoute allowedRoles={['store_manager', 'store_admin']}>
            <StoreManagerChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store-manager/analytics"
        element={
          <ProtectedRoute allowedRoles={['store_manager', 'store_admin']}>
            <StoreManagerAnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store-manager/settings"
        element={
          <ProtectedRoute allowedRoles={['store_manager', 'store_admin']}>
            <StoreManagerSettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store-manager/profile"
        element={
          <ProtectedRoute allowedRoles={['store_manager', 'store_admin']}>
            <StoreManagerProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Seller Routes */}
      <Route
        path="/seller/dashboard"
        element={
          <ProtectedRoute allowedRoles={['store_admin']}>
            <SellerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/register-store"
        element={
          <ProtectedRoute allowedRoles={['store_admin']}>
            <RegisterStorePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/products"
        element={
          <ProtectedRoute allowedRoles={['store_admin']}>
            <ProductsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/products/add"
        element={
          <ProtectedRoute allowedRoles={['store_admin']}>
            <AddProductPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/products/edit/:id"
        element={
          <ProtectedRoute allowedRoles={['store_admin']}>
            <EditProductPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/seller/orders"
        element={
          <ProtectedRoute allowedRoles={['store_admin']}>
            <OrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/orders/:id"
        element={
          <ProtectedRoute allowedRoles={['store_admin']}>
            <SellerOrderDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/profile"
        element={
          <ProtectedRoute allowedRoles={['store_admin']}>
            <StoreProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/edit-profile"
        element={
          <ProtectedRoute allowedRoles={['store_admin']}>
            <SellerEditProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/analytics"
        element={
          <ProtectedRoute allowedRoles={['store_admin']}>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/managers"
        element={
          <ProtectedRoute allowedRoles={['store_admin']}>
            <ManagersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/chat"
        element={
          <ProtectedRoute allowedRoles={['store_admin']}>
            <SellerChatPage />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
