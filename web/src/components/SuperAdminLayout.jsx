import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiHome, FiShoppingBag, FiUsers, FiSettings, FiLogOut, FiMenu, FiX, FiShield, FiInbox, FiBox, FiTrendingUp } from 'react-icons/fi';
import { logout } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';

const SuperAdminLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const menuItems = [
        { path: '/admin/dashboard', icon: FiHome, label: 'Dashboard' },
        { path: '/admin/store-requests', icon: FiInbox, label: 'Store Requests' },
        { path: '/admin/stores', icon: FiShoppingBag, label: 'All Stores' },
        { path: '/admin/users', icon: FiUsers, label: 'Users' },
        { path: '/admin/products', icon: FiBox, label: 'Products' },
        { path: '/admin/analytics', icon: FiTrendingUp, label: 'Analytics' },
        { path: '/admin/logs', icon: FiShield, label: 'System Logs' },
        { path: '/admin/settings', icon: FiSettings, label: 'Platform Settings' },
    ];

    const handleLogout = () => {
        dispatch(logout());
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Header */}
            <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg hover:bg-gray-100"
                    >
                        {sidebarOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                    </button>
                    <span className="font-bold text-lg text-gray-900">Admin Panel</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                    <img src={user?.avatar || 'https://via.placeholder.com/150'} alt="Profile" className="w-full h-full object-cover" />
                </div>
            </div>

            <div className="flex">
                {/* Sidebar */}
                <aside className={`
                    fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 
                    transform transition-transform duration-300 ease-in-out z-30
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}>
                    <div className="flex flex-col h-full">
                        {/* Brand */}
                        <div className="p-6 border-b border-gray-200">
                            <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent flex items-center gap-2">
                                <FiShield className="text-red-600" />
                                SuperAdmin
                            </h1>
                            <p className="text-xs text-gray-500 mt-1">Platform Management</p>
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
                                                        ? 'bg-red-50 text-red-600 font-medium'
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

                        {/* User Info & Logout */}
                        <div className="p-4 border-t border-gray-200 bg-gray-50">
                            <div className="flex items-center gap-3 mb-4 px-2">
                                <div className="w-10 h-10 rounded-full bg-white border border-gray-200 overflow-hidden">
                                    <img src={user?.avatar || 'https://via.placeholder.com/150'} alt={user?.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 w-full transition-colors text-sm font-medium"
                            >
                                <FiLogOut className="w-4 h-4" />
                                <span>Sign Out</span>
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
                <main className="flex-1 min-h-screen w-full">
                    <div className="max-w-7xl mx-auto p-4 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SuperAdminLayout;
