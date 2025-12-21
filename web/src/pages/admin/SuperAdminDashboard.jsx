import { useState, useEffect } from 'react';
import { superAdminService } from '../../services';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import { FiShoppingBag, FiUsers, FiBox, FiDollarSign } from 'react-icons/fi';
import { toast } from 'react-toastify';

const SuperAdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await superAdminService.getDashboard();
                if (response.success) {
                    setStats(response.data.stats);
                    setRecentOrders(response.data.recentOrders);
                }
            } catch (error) {
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const statCards = [
        { title: 'Total Revenue', value: stats?.totalRevenue ? `Rs. ${stats.totalRevenue.toLocaleString()}` : 'Rs. 0', icon: FiDollarSign, color: 'bg-green-500' },
        { title: 'Total Stores', value: stats?.totalStores || 0, icon: FiShoppingBag, color: 'bg-blue-500' },
        { title: 'Total Users', value: stats?.totalUsers || 0, icon: FiUsers, color: 'bg-purple-500' },
        { title: 'Pending Stores', value: stats?.pendingStores || 0, icon: FiBox, color: 'bg-orange-500' },
    ];

    if (loading) {
        return (
            <SuperAdminLayout>
                <div className="flex h-64 items-center justify-center">
                    <div className="text-gray-500">Loading dashboard...</div>
                </div>
            </SuperAdminLayout>
        );
    }

    return (
        <SuperAdminLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Platform Overview</h1>
                <p className="text-gray-500 mt-1">Welcome back, SuperAdmin.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                                    <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="font-bold text-gray-900">Recent Platform Activity</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50 text-xs uppercase text-gray-500">
                                <th className="px-6 py-3 font-semibold">Order ID</th>
                                <th className="px-6 py-3 font-semibold">Customer</th>
                                <th className="px-6 py-3 font-semibold">Store</th>
                                <th className="px-6 py-3 font-semibold">Amount</th>
                                <th className="px-6 py-3 font-semibold">Status</th>
                                <th className="px-6 py-3 font-semibold">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentOrders.length > 0 ? (
                                recentOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">#{order._id.slice(-6).toUpperCase()}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{order.customer?.name || 'Guest'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{order.store?.name || 'Unknown Store'}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">Rs. {order.total.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full
                                                ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                        order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-yellow-100 text-yellow-700'}`}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No recent orders found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </SuperAdminLayout>
    );
};

export default SuperAdminDashboard;
