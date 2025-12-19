import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiMail } from 'react-icons/fi';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* About */}
                    <div>
                        <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                            MarketHub
                        </h3>
                        <p className="text-gray-400 mb-4">
                            Your trusted multi-vendor marketplace for quality products from verified sellers.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-white transition">
                                <FiFacebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition">
                                <FiTwitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition">
                                <FiInstagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition">
                                <FiMail className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/products" className="text-gray-400 hover:text-white transition">
                                    Shop
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="text-gray-400 hover:text-white transition">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-gray-400 hover:text-white transition">
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link to="/faq" className="text-gray-400 hover:text-white transition">
                                    FAQ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* For Sellers */}
                    <div>
                        <h4 className="font-semibold mb-4">For Sellers</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/register" className="text-gray-400 hover:text-white transition">
                                    Become a Seller
                                </Link>
                            </li>
                            <li>
                                <Link to="/seller-guide" className="text-gray-400 hover:text-white transition">
                                    Seller Guide
                                </Link>
                            </li>
                            <li>
                                <Link to="/store-admin/dashboard" className="text-gray-400 hover:text-white transition">
                                    Seller Dashboard
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h4 className="font-semibold mb-4">Customer Service</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/help" className="text-gray-400 hover:text-white transition">
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link to="/returns" className="text-gray-400 hover:text-white transition">
                                    Returns & Refunds
                                </Link>
                            </li>
                            <li>
                                <Link to="/shipping" className="text-gray-400 hover:text-white transition">
                                    Shipping Info
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="text-gray-400 hover:text-white transition">
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; 2025 MarketHub. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
