import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiShoppingCart, FiHeart, FiUser, FiMenu } from 'react-icons/fi';
import { logout } from '../redux/slices/authSlice';
import { useEffect, useState } from 'react';
import ProductSearchBar from './ProductSearchBar';
import { customerService } from '../services';
import { setWishlist, clearWishlist } from '../redux/slices/wishlistSlice';
import { setCart, clearCart } from '../redux/slices/cartSlice';

const Navbar = () => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const { items: cartItems } = useSelector((state) => state.cart);
    const { items: wishlistItems } = useSelector((state) => state.wishlist);
    const dispatch = useDispatch();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const hydrateCustomerData = async () => {
            if (!isAuthenticated || user?.role !== 'customer') return;
            try {
                const [wishlistRes, cartRes] = await Promise.all([
                    customerService.getWishlist(),
                    customerService.getCart(),
                ]);

                const wishlist = wishlistRes?.data;
                dispatch(setWishlist(Array.isArray(wishlist?.items) ? wishlist.items : []));

                const cart = cartRes?.data;
                dispatch(setCart(Array.isArray(cart?.items) ? cart.items : []));
            } catch {
                // ignore hydration errors (e.g., expired session); auth flow will handle it
            }
        };

        hydrateCustomerData();
    }, [dispatch, isAuthenticated, user?.role]);

    const handleLogout = () => {
        dispatch(logout());
        dispatch(clearCart());
        dispatch(clearWishlist());
    };

    const getDashboardLink = () => {
        if (!user) return '/';
        switch (user.role) {
            case 'superadmin':
                return '/admin/dashboard';
            case 'store_admin':
                return '/store-admin/dashboard';
            case 'store_manager':
                return '/store-manager/dashboard';
            default:
                return '/dashboard';
        }
    };

    return (
        <nav className="bg-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center">
                            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                                MarketHub
                            </span>
                        </Link>
                    </div>

                    {/* Search Bar - Desktop */}
                    <div className="hidden md:flex items-center flex-1 max-w-2xl mx-8">
                        <ProductSearchBar
                            inputClassName="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        {isAuthenticated ? (
                            <>
                                {user?.role === 'customer' && (
                                    <>
                                        <Link to="/wishlist" className="relative text-gray-700 hover:text-primary-600 transition">
                                            <FiHeart className="w-6 h-6" />
                                            {wishlistItems.length > 0 && (
                                                <span className="absolute -top-2 -right-2 bg-secondary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                    {wishlistItems.length}
                                                </span>
                                            )}
                                        </Link>
                                        <Link to="/cart" className="relative text-gray-700 hover:text-primary-600 transition">
                                            <FiShoppingCart className="w-6 h-6" />
                                            {cartItems.length > 0 && (
                                                <span className="absolute -top-2 -right-2 bg-secondary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                    {cartItems.length}
                                                </span>
                                            )}
                                        </Link>
                                    </>
                                )}
                                <div className="relative group">
                                    <button className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition">
                                        <FiUser className="w-6 h-6" />
                                        <span className="font-medium">{user?.name}</span>
                                    </button>
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                        <Link
                                            to={getDashboardLink()}
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                        >
                                            Dashboard
                                        </Link>
                                        {user?.role === 'customer' && (
                                            <Link
                                                to="/orders"
                                                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                            >
                                                My Orders
                                            </Link>
                                        )}
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-gray-700 hover:text-primary-600 font-medium transition"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-2 rounded-full font-medium hover:opacity-90 transition"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-gray-700 hover:text-primary-600"
                        >
                            <FiMenu className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-200">
                    <div className="px-4 pt-2 pb-4 space-y-3">
                        <div className="relative">
                            <ProductSearchBar
                                inputClassName="w-full px-4 py-2 pl-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        {isAuthenticated ? (
                            <>
                                <Link to={getDashboardLink()} className="block py-2 text-gray-700">
                                    Dashboard
                                </Link>
                                {user?.role === 'customer' && (
                                    <>
                                        <Link to="/wishlist" className="block py-2 text-gray-700">
                                            Wishlist ({wishlistItems.length})
                                        </Link>
                                        <Link to="/cart" className="block py-2 text-gray-700">
                                            Cart ({cartItems.length})
                                        </Link>
                                        <Link to="/orders" className="block py-2 text-gray-700">
                                            My Orders
                                        </Link>
                                    </>
                                )}
                                <button onClick={handleLogout} className="block w-full text-left py-2 text-gray-700">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="block py-2 text-gray-700">
                                    Login
                                </Link>
                                <Link to="/register" className="block py-2 text-gray-700">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
