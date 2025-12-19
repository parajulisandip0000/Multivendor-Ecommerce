import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storeManagerService } from '../../services';
import StoreManagerLayout from '../../components/StoreManagerLayout';
import { FiBox, FiShoppingBag, FiClock, FiAlertTriangle, FiArrowRight } from 'react-icons/fi';
import { toast } from 'react-toastify';

const StoreManagerDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        stats: {
            totalProducts: 0,
            totalOrders: 0,
            pendingOrders: 0
        },
        recentOrders: [],
        lowStockProducts: []
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await storeManagerService.getDashboard();
            setData(response.data);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            // toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const StatCard = ({ title, value, icon: Icon, color, link }) => (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
                    <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
                </div>
                {link && (
                    <Link to={link} className="text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1">
                        View <FiArrowRight className="w-4 h-4" />
                    </Link>
                )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            <p className="text-sm text-gray-500 mt-1">{title}</p>
        </div>
    );

    return (
        <StoreManagerLayout>
            <div className="pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                            <p className="text-gray-500 mt-1">Welcome back, Manager</p>
                        </div>
                        <Link
                            to="/store-manager/products"
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium shadow-sm transition-colors flex items-center gap-2"
                        >
                            <FiBox /> Manage Products
                        </Link>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <StatCard
                            title="Total Products"
                            value={data.stats.totalProducts}
                            icon={FiBox}
                            color="bg-purple-600"
                            link="/store-manager/products"
                        />
                        <StatCard
                            title="Total Orders"
                            value={data.stats.totalOrders}
                            icon={FiShoppingBag}
                            color="bg-blue-600"
                            link="/store-manager/orders"
                        />
                        <StatCard
                            title="Pending Orders"
                            value={data.stats.pendingOrders}
                            icon={FiClock}
                            color="bg-yellow-600"
                            link="/store-manager/orders?status=processing"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Recent Orders */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                                <h2 className="font-bold text-gray-900">Recent Orders</h2>
                                <Link to="/store-manager/orders" className="text-primary-600 text-sm font-medium hover:underline">
                                    View All
                                </Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                            <th className="px-6 py-3 font-semibold">Order ID</th>
                                            <th className="px-6 py-3 font-semibold">Customer</th>
                                            <th className="px-6 py-3 font-semibold">Total</th>
                                            <th className="px-6 py-3 font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {data.recentOrders?.length > 0 ? (
                                            data.recentOrders.map((order) => (
                                                <tr key={order._id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                        #{order._id.slice(-6).toUpperCase()}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{order.customer?.name || 'Guest'}</td>
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                        NRS {order.total.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full
                                                            ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                                order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                                    order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                                                        'bg-yellow-100 text-yellow-700'}`}>
                                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                                    No orders found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Low Stock Alert */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                    <FiAlertTriangle className="text-yellow-500" /> Low Stock
                                </h2>
                                <Link to="/store-manager/products" className="text-primary-600 text-sm font-medium hover:underline">
                                    Manage Stock
                                </Link>
                            </div>
                            <div className="p-4">
                                {data.lowStockProducts?.length > 0 ? (
                                    <div className="space-y-4">
                                        {data.lowStockProducts.map((product) => (
                                            <div key={product._id} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition">
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                                    {product.images?.[0]?.url && (
                                                        <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                                                    <p className="text-sm text-red-500 font-medium">Only {product.stock} left</p>
                                                </div>
                                                <Link
                                                    to={`/store-manager/products?search=${product.name}`}
                                                    className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                                                >
                                                    Restock
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <FiBox className="text-green-600" />
                                        </div>
                                        <p>All products are well stocked!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StoreManagerLayout>
    );
};

export default StoreManagerDashboard;
