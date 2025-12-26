import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    FiShoppingBag,
    FiClock,
    FiHeart,
    FiTrendingUp,
    FiArrowRight,
    FiEye,
    FiMessageCircle,
    FiPackage,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import DashboardLayout from '../../components/DashboardLayout';
import { customerService } from '../../services';

const CustomerDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        wishlistItems: 0,
        totalSpent: 0,
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const pendingStatuses = 'pending,confirmed,processing,shipped,on_hold';

                const [ordersSummaryRes, pendingRes, wishlistRes, ordersRes] = await Promise.all([
                    customerService.getOrders({ page: 1, limit: 1 }),
                    customerService.getOrders({ page: 1, limit: 1, status: pendingStatuses }),
                    customerService.getWishlist(),
                    customerService.getOrders({ page: 1, limit: 100 }),
                ]);

                const totalOrders = ordersSummaryRes?.pagination?.total || 0;
                const pendingOrders = pendingRes?.pagination?.total || 0;
                const wishlistCount = Array.isArray(wishlistRes?.data?.items) ? wishlistRes.data.items.length : 0;

                const orders = Array.isArray(ordersRes?.data) ? ordersRes.data : [];
                const totalSpent = orders
                    .filter((o) => o?.status !== 'cancelled')
                    .reduce((sum, o) => sum + Number(o?.total || 0), 0);

                setStats({
                    totalOrders,
                    pendingOrders,
                    wishlistItems: wishlistCount,
                    totalSpent,
                });

                const recent = orders.slice(0, 5).map((o) => ({
                    id: o.orderNumber || o._id,
                    date: o.createdAt,
                    status: o.status,
                    total: o.total,
                    items: Array.isArray(o.items) ? o.items.length : 0,
                }));
                setRecentOrders(recent);
            } catch (error) {
                console.error(error);
                toast.error('Failed to load dashboard data');
                setStats({ totalOrders: 0, pendingOrders: 0, wishlistItems: 0, totalSpent: 0 });
                setRecentOrders([]);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const statCards = [
        {
            label: 'Total Orders',
            value: stats.totalOrders,
            icon: FiShoppingBag,
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-100',
            textColor: 'text-blue-600',
            iconBg: 'bg-blue-100',
        },
        {
            label: 'Pending Orders',
            value: stats.pendingOrders,
            icon: FiClock,
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-100',
            textColor: 'text-yellow-600',
            iconBg: 'bg-yellow-100',
        },
        {
            label: 'Wishlist Items',
            value: stats.wishlistItems,
            icon: FiHeart,
            bgColor: 'bg-pink-50',
            borderColor: 'border-pink-100',
            textColor: 'text-pink-600',
            iconBg: 'bg-pink-100',
        },
        {
            label: 'Total Spent',
            value: `NRS ${stats.totalSpent.toLocaleString()}`,
            icon: FiTrendingUp,
            bgColor: 'bg-green-50',
            borderColor: 'border-green-100',
            textColor: 'text-green-600',
            iconBg: 'bg-green-100',
        },
    ];

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-indigo-100 text-indigo-800',
            processing: 'bg-blue-100 text-blue-800',
            shipped: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            on_hold: 'bg-orange-100 text-orange-800',
            refunded: 'bg-slate-100 text-slate-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return badges[status] || badges.pending;
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-xl" />
                        ))}
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h1>
                    <p className="text-gray-600 mt-2">Here's what's happening with your orders today</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.label} className={`${stat.bgColor} ${stat.borderColor} rounded-xl p-6 border`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`${stat.iconBg} p-3 rounded-lg`}>
                                        <Icon className={`w-6 h-6 ${stat.textColor}`} />
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link
                        to="/orders"
                        className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow flex items-center gap-4 group"
                    >
                        <div className="bg-primary-100 p-3 rounded-lg group-hover:bg-primary-200 transition-colors">
                            <FiPackage className="w-6 h-6 text-primary-600" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-gray-900">My Orders</p>
                            <p className="text-sm text-gray-500">Track deliveries</p>
                        </div>
                        <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600" />
                    </Link>

                    <Link
                        to="/wishlist"
                        className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow flex items-center gap-4 group"
                    >
                        <div className="bg-primary-100 p-3 rounded-lg group-hover:bg-primary-200 transition-colors">
                            <FiHeart className="w-6 h-6 text-primary-600" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-gray-900">My Wishlist</p>
                            <p className="text-sm text-gray-500">Saved items</p>
                        </div>
                        <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600" />
                    </Link>

                    <Link
                        to="/chat"
                        className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow flex items-center gap-4 group"
                    >
                        <div className="bg-primary-100 p-3 rounded-lg group-hover:bg-primary-200 transition-colors">
                            <FiMessageCircle className="w-6 h-6 text-primary-600" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-gray-900">Support Chat</p>
                            <p className="text-sm text-gray-500">Message stores</p>
                        </div>
                        <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600" />
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                        <Link to="/orders" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1">
                            View All
                            <FiArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {recentOrders.map((order) => (
                            <div
                                key={order.id}
                                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-gray-50 transition-all"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="bg-primary-50 p-3 rounded-lg">
                                        <FiShoppingBag className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <p className="font-semibold text-gray-900">{order.id}</p>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                                                {String(order.status || 'pending').replace('_', ' ')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {order.date
                                                ? new Date(order.date).toLocaleDateString('en-US', {
                                                      year: 'numeric',
                                                      month: 'short',
                                                      day: 'numeric',
                                                  })
                                                : ''}{' '}
                                            • {order.items} item{order.items > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">NRS {Number(order.total || 0).toLocaleString()}</p>
                                    </div>
                                </div>
                                <Link to={`/orders/${order.id}`} className="ml-4 p-2 hover:bg-primary-50 rounded-lg transition-colors">
                                    <FiEye className="w-5 h-5 text-gray-400 hover:text-primary-600" />
                                </Link>
                            </div>
                        ))}
                    </div>

                    {recentOrders.length === 0 && (
                        <div className="text-center py-12">
                            <FiShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 mb-4">No orders yet</p>
                            <Link
                                to="/products"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:from-primary-700 hover:to-secondary-700 transition-all"
                            >
                                Start Shopping
                                <FiArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CustomerDashboard;
