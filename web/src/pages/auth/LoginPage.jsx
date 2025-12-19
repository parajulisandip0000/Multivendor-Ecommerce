import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiArrowRight, FiShoppingBag, FiShield, FiTrendingUp } from 'react-icons/fi';
import { loginStart, loginSuccess, loginFailure } from '../../redux/slices/authSlice';
import { authService } from '../../services';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        dispatch(loginStart());

        try {
            const response = await authService.login(formData);
            dispatch(loginSuccess(response.data));
            toast.success('Login successful!');

            // Redirect based on role
            const role = response.data.user.role;
            if (role === 'superadmin') {
                navigate('/admin/dashboard');
            } else if (role === 'store_admin') {
                navigate('/store-admin/dashboard');
            } else if (role === 'store_manager') {
                navigate('/store-manager/dashboard');
            } else {
                navigate('/dashboard'); // Redirect customers to dashboard
            }
        } catch (error) {
            dispatch(loginFailure(error.response?.data?.message || 'Login failed'));
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-600 p-12 flex-col justify-between text-white">
                <div>
                    <Link to="/" className="flex items-center gap-2 text-2xl font-bold">
                        <FiShoppingBag className="w-8 h-8" />
                        MarketHub
                    </Link>
                </div>

                <div className="space-y-8">
                    <h1 className="text-5xl font-bold leading-tight">
                        Welcome back to<br />your marketplace
                    </h1>
                    <p className="text-xl text-blue-100">
                        Access thousands of products from verified sellers worldwide
                    </p>

                    <div className="space-y-6 pt-8">
                        <div className="flex items-start gap-4">
                            <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                                <FiShoppingBag className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Wide Selection</h3>
                                <p className="text-blue-100">Browse 10,000+ products across all categories</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                                <FiShield className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Secure Shopping</h3>
                                <p className="text-blue-100">Protected transactions and buyer guarantee</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                                <FiTrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Best Deals</h3>
                                <p className="text-blue-100">Competitive prices from verified sellers</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-sm text-blue-100">
                    © 2024 MarketHub. All rights reserved.
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
                <div className="max-w-md w-full">
                    {/* Mobile Logo */}
                    <div className="lg:hidden mb-8 text-center">
                        <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                            <FiShoppingBag className="w-8 h-8 text-primary-600" />
                            MarketHub
                        </Link>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-lg">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                Sign In
                            </h2>
                            <p className="text-gray-600">
                                Welcome back! Please enter your details.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiMail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiLock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Forgot Password Link */}
                            <div className="flex items-center justify-end">
                                <Link
                                    to="/forgot-password"
                                    className="text-sm font-medium text-primary-600 hover:text-primary-500"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    'Signing in...'
                                ) : (
                                    <>
                                        Sign In
                                        <FiArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>

                            {/* Sign Up Link */}
                            <div className="text-center pt-4">
                                <p className="text-sm text-gray-600">
                                    Don't have an account?{' '}
                                    <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-500">
                                        Sign up for free
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
