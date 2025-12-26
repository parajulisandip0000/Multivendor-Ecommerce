import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiHome, FiShoppingBag, FiShoppingCart, FiUser, FiHeart, FiMapPin, FiSettings, FiLogOut, FiMenu, FiX, FiCamera, FiMessageCircle } from 'react-icons/fi';
import { logout, updateUserAvatar } from '../redux/slices/authSlice';
import { authService } from '../services';
import { toast } from 'react-toastify';
import { useRef } from 'react';

const DashboardLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const fileInputRef = useRef(null);

    const menuItems = [
        { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
        { path: '/cart', icon: FiShoppingCart, label: 'Cart' },
        { path: '/chat', icon: FiMessageCircle, label: 'Messages' },
        { path: '/orders', icon: FiShoppingBag, label: 'My Orders' },
        { path: '/profile', icon: FiUser, label: 'Profile' },
        { path: '/wishlist', icon: FiHeart, label: 'Wishlist' },
        { path: '/addresses', icon: FiMapPin, label: 'Addresses' },
        { path: '/settings', icon: FiSettings, label: 'Settings' },
    ];

    const handleLogout = () => {
        dispatch(logout());
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate type
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
            const data = await authService.updateProfilePicture(formData);
            dispatch(updateUserAvatar(data.data.avatar));
            toast.success('Profile picture updated successfully');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to update profile picture');
        }
    };

    const onAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Header */}
            <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
                <Link to="/" className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                    MarketHub
                </Link>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                >
                    {sidebarOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                </button>
            </div>

            <div className="flex">
                {/* Sidebar */}
                <aside className={`
                    fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 
                    transform transition-transform duration-300 ease-in-out z-30
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}>
                    <div className="flex flex-col h-full">
                        {/* Logo - Desktop */}
                        <div className="hidden lg:block p-6 border-b border-gray-200">
                            <Link to="/" className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                                MarketHub
                            </Link>
                        </div>

                        {/* User Profile Section */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="relative group cursor-pointer" onClick={onAvatarClick}>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-100">
                                        {user?.avatar ? (
                                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-lg">
                                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <FiCamera className="text-white w-5 h-5" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
                                    <p className="text-sm text-gray-500 truncate">{user?.email || ''}</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Menu */}
                        <nav className="flex-1 p-4 overflow-y-auto">
                            <ul className="space-y-1">
                                {menuItems.map((item) => {
                                    const Icon = item.icon;
                                    const active = isActive(item.path);
                                    return (
                                        <li key={item.path}>
                                            <Link
                                                to={item.path}
                                                onClick={() => setSidebarOpen(false)}
                                                className={`
                                                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                                                    ${active
                                                        ? 'bg-primary-50 text-primary-600 font-medium'
                                                        : 'text-gray-700 hover:bg-gray-100'
                                                    }
                                                `}
                                            >
                                                <Icon className="w-5 h-5" />
                                                <span>{item.label}</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>

                        {/* Logout Button */}
                        <div className="p-4 border-t border-gray-200">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full transition-colors"
                            >
                                <FiLogOut className="w-5 h-5" />
                                <span className="font-medium">Logout</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Overlay for mobile */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Main Content */}
                <main className="flex-1 min-h-screen">
                    <div className="max-w-7xl mx-auto p-4 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
