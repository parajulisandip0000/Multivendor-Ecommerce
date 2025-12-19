import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiLock, FiCheck, FiShoppingBag, FiArrowRight } from 'react-icons/fi';

const ResetPasswordPage = () => {
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    const navigate = useNavigate();
    const { token } = useParams();

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 10) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;
        return strength;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'password') {
            setPasswordStrength(calculatePasswordStrength(value));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            // TODO: Implement reset password API call
            // await authService.resetPassword({ token, password: formData.password });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            toast.success('Password reset successful!');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    const getStrengthColor = () => {
        if (passwordStrength <= 1) return 'bg-red-500';
        if (passwordStrength <= 3) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getStrengthText = () => {
        if (passwordStrength <= 1) return 'Weak';
        if (passwordStrength <= 3) return 'Medium';
        return 'Strong';
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-500 p-12 flex-col justify-between text-white">
                <div>
                    <Link to="/" className="flex items-center gap-2 text-2xl font-bold">
                        <FiShoppingBag className="w-8 h-8" />
                        MarketHub
                    </Link>
                </div>

                <div className="space-y-8">
                    <h1 className="text-5xl font-bold leading-tight">
                        Create a new<br />secure password
                    </h1>
                    <p className="text-xl text-purple-100">
                        Choose a strong password to protect your account
                    </p>

                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                        <h3 className="font-semibold text-lg mb-4">Password Tips</h3>
                        <ul className="space-y-3 text-purple-100">
                            <li className="flex items-start gap-2">
                                <FiCheck className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                <span>Use at least 8 characters</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <FiCheck className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                <span>Mix uppercase and lowercase letters</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <FiCheck className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                <span>Include numbers and symbols</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <FiCheck className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                <span>Avoid common words or patterns</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="text-sm text-purple-100">
                    © 2024 MarketHub. All rights reserved.
                </div>
            </div>

            {/* Right Side - Form */}
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
                                Set New Password
                            </h2>
                            <p className="text-gray-600">
                                Your new password must be different from previous passwords
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* New Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiLock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        minLength={6}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                                        placeholder="Enter new password"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Password Strength Indicator */}
                                {formData.password && (
                                    <div className="mt-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all ${getStrengthColor()}`}
                                                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium text-gray-600">
                                                {getStrengthText()}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiLock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                                        placeholder="Confirm new password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                </div>
                                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                    <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || formData.password !== formData.confirmPassword}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    'Resetting Password...'
                                ) : (
                                    <>
                                        Reset Password
                                        <FiArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
