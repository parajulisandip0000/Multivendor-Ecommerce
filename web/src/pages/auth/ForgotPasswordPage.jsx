import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiMail, FiArrowLeft, FiShoppingBag, FiSend } from 'react-icons/fi';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // TODO: Implement forgot password API call
            // await authService.forgotPassword({ email });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            setEmailSent(true);
            toast.success('Password reset link sent to your email!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 p-12 flex-col justify-between text-white">
                <div>
                    <Link to="/" className="flex items-center gap-2 text-2xl font-bold">
                        <FiShoppingBag className="w-8 h-8" />
                        MarketHub
                    </Link>
                </div>

                <div className="space-y-8">
                    <h1 className="text-5xl font-bold leading-tight">
                        Forgot your<br />password?
                    </h1>
                    <p className="text-xl text-pink-100">
                        No worries! We'll send you reset instructions to your email.
                    </p>

                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                        <h3 className="font-semibold text-lg mb-2">What happens next?</h3>
                        <ol className="space-y-2 text-pink-100">
                            <li className="flex items-start gap-2">
                                <span className="font-bold">1.</span>
                                <span>Enter your email address</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold">2.</span>
                                <span>Check your inbox for reset link</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold">3.</span>
                                <span>Create a new password</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold">4.</span>
                                <span>Sign in with new credentials</span>
                            </li>
                        </ol>
                    </div>
                </div>

                <div className="text-sm text-pink-100">
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
                        {!emailSent ? (
                            <>
                                <div className="mb-8">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                        Reset Password
                                    </h2>
                                    <p className="text-gray-600">
                                        Enter your email and we'll send you a reset link
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
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            'Sending...'
                                        ) : (
                                            <>
                                                Send Reset Link
                                                <FiSend className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>

                                    {/* Back to Login */}
                                    <div className="text-center pt-4">
                                        <Link
                                            to="/login"
                                            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                                        >
                                            <FiArrowLeft className="w-4 h-4" />
                                            Back to Sign In
                                        </Link>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FiSend className="w-8 h-8 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Check Your Email
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    We've sent a password reset link to<br />
                                    <span className="font-semibold">{email}</span>
                                </p>
                                <p className="text-sm text-gray-500 mb-6">
                                    Didn't receive the email? Check your spam folder or
                                </p>
                                <button
                                    onClick={() => setEmailSent(false)}
                                    className="text-primary-600 hover:text-primary-700 font-semibold"
                                >
                                    Try another email address
                                </button>
                                <div className="mt-8 pt-6 border-t">
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                                    >
                                        <FiArrowLeft className="w-4 h-4" />
                                        Back to Sign In
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
