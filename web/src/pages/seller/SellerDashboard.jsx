import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboard } from '../../redux/slices/sellerSlice';
import SellerDashboardLayout from '../../components/SellerDashboardLayout';
import { FiBox, FiShoppingBag, FiDollarSign, FiStar, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const LoadingSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-white rounded-xl"></div>
            ))}
        </div>
        <div className="h-96 bg-white rounded-xl"></div>
    </div>
);

const SellerDashboard = () => {
    const dispatch = useDispatch();
    const { stats, recentOrders, loading, error } = useSelector((state) => state.seller);

    useEffect(() => {
        dispatch(fetchDashboard());
    }, [dispatch]);

    if (loading && !stats) {
        return (
            <SellerDashboardLayout>
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-500">Welcome back to your seller center</p>
                </div>
                <LoadingSkeleton />
            </SellerDashboardLayout>
        );
    }

    if (error) {
        if (error.includes('Store not found') || error.includes('404')) {
            return (
                <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                    <div className="text-center max-w-md">
                        <div className="bg-red-100 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-6">
                            <FiShoppingBag className="w-10 h-10 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Store Not Found</h2>
                        <p className="text-gray-600 mb-8">
                            It looks like you haven't set up your store yet. Please register your store to start selling.
                        </p>
                        <Link
                            to="/seller/register-store"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-colors"
                        >
                            <FiArrowRight /> Register Store
                        </Link>
                        <div className="mt-8">
                            <button
                                onClick={() => dispatch(fetchDashboard())}
                                className="text-sm text-gray-500 hover:text-gray-700 underline"
                            >
                                Retry Connection
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <SellerDashboardLayout>
                <div className="text-center py-12">
                    <p className="text-red-500 text-lg">Error loading dashboard: {error}</p>
                    <button
                        onClick={() => dispatch(fetchDashboard())}
                        className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg"
                    >
                        Retry
                    </button>
                </div>
            </SellerDashboardLayout>
        );
    }

    const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                    {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
                </div>
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );

    return (
        <SellerDashboardLayout>
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-500">Here's what's happening with your store today.</p>
                </div>
                <Link
                    to="/seller/products/add"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
                >
                    + Add Product
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Revenue"
                    value={`NRS ${stats?.totalRevenue?.toLocaleString() || 0}`}
                    icon={FiDollarSign}
                    color="bg-green-500"
                    subtext="Lifetime earnings"
                />
                <StatCard
                    title="Orders"
                    value={stats?.totalOrders || 0}
                    icon={FiShoppingBag}
                    color="bg-blue-500"
                    subtext="Total orders processed"
                />
                <StatCard
                    title="Products"
                    value={stats?.totalProducts || 0}
                    icon={FiBox}
                    color="bg-purple-500"
                    subtext="Active listings"
                />
                <StatCard
                    title="Rating"
                    value={stats?.averageRating?.toFixed(1) || 'N/A'}
                    icon={FiStar}
                    color="bg-yellow-500"
                    subtext="Average customer rating"
                />
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h2 className="font-bold text-gray-900">Recent Orders</h2>
                    <Link to="/seller/orders" className="text-primary-600 text-sm font-medium hover:underline flex items-center gap-1">
                        View All <FiArrowRight />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="px-6 py-3 font-semibold">Order ID</th>
                                <th className="px-6 py-3 font-semibold">Customer</th>
                                <th className="px-6 py-3 font-semibold">Date</th>
                                <th className="px-6 py-3 font-semibold">Amount</th>
                                <th className="px-6 py-3 font-semibold">Status</th>
                                <th className="px-6 py-3 font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentOrders?.length > 0 ? (
                                recentOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">#{order._id.slice(-6).toUpperCase()}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{order.customer?.name || 'Guest'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">NRS {order.total.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full
                                                ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                        order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-yellow-100 text-yellow-700'}`}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                to={`/seller/orders/${order._id}`}
                                                className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                                            >
                                                Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        No orders found yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </SellerDashboardLayout>
    );
};

export default SellerDashboard;
