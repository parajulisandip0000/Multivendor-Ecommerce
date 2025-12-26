import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiEye, FiFilter, FiPackage, FiSearch, FiShoppingBag, FiTruck, FiXCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import DashboardLayout from '../../components/DashboardLayout';
import { customerService } from '../../services';

const STATUS_OPTIONS = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'on_hold', label: 'On hold' },
    { value: 'refunded', label: 'Refunded' },
];

const getStatusBadge = (status) => {
    const styles = {
        pending: 'bg-yellow-100 text-yellow-800',
        confirmed: 'bg-indigo-100 text-indigo-800',
        processing: 'bg-blue-100 text-blue-800',
        shipped: 'bg-purple-100 text-purple-800',
        delivered: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
        on_hold: 'bg-orange-100 text-orange-800',
        refunded: 'bg-slate-100 text-slate-800',
    };
    const icons = {
        pending: <FiShoppingBag className="w-4 h-4 mr-1" />,
        confirmed: <FiPackage className="w-4 h-4 mr-1" />,
        processing: <FiPackage className="w-4 h-4 mr-1" />,
        shipped: <FiTruck className="w-4 h-4 mr-1" />,
        delivered: <FiCheckCircle className="w-4 h-4 mr-1" />,
        cancelled: <FiXCircle className="w-4 h-4 mr-1" />,
        on_hold: <FiPackage className="w-4 h-4 mr-1" />,
        refunded: <FiXCircle className="w-4 h-4 mr-1" />,
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
            {icons[status] || icons.pending}
            {String(status || 'pending')
                .replace('_', ' ')
                .replace(/\b\w/g, (c) => c.toUpperCase())}
        </span>
    );
};

const OrderHistoryPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [page, setPage] = useState(1);

    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
    const [loading, setLoading] = useState(true);

    const debouncedSearch = useMemo(() => searchTerm.trim(), [searchTerm]);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const params = {
                    page,
                    limit: 10,
                    ...(filterStatus !== 'all' ? { status: filterStatus } : {}),
                    ...(debouncedSearch ? { search: debouncedSearch } : {}),
                };

                const res = await customerService.getOrders(params);
                setOrders(Array.isArray(res?.data) ? res.data : []);
                setPagination(res?.pagination || { total: 0, page: 1, pages: 1 });
            } catch (error) {
                toast.error(error?.response?.data?.message || 'Failed to load orders');
                setOrders([]);
                setPagination({ total: 0, page: 1, pages: 1 });
            } finally {
                setLoading(false);
            }
        };

        const t = setTimeout(load, 250);
        return () => clearTimeout(t);
    }, [debouncedSearch, filterStatus, page]);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, filterStatus]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                        <p className="text-gray-500">Track and manage your orders</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                        <div className="relative">
                            <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
                            >
                                {STATUS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse">
                                    <div className="h-16 bg-gray-100" />
                                    <div className="p-6">
                                        <div className="h-6 bg-gray-100 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : orders.length > 0 ? (
                        orders.map((order) => (
                            <div key={order._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                                <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200">
                                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Order Placed</p>
                                            <p className="text-gray-900 font-medium">
                                                {order.createdAt
                                                    ? new Date(order.createdAt).toLocaleDateString('en-US', {
                                                          day: 'numeric',
                                                          month: 'long',
                                                          year: 'numeric',
                                                      })
                                                    : ''}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Total Amount</p>
                                            <p className="text-gray-900 font-medium">NRS {Number(order.total || 0).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Order ID</p>
                                            <p className="text-gray-900 font-medium">{order.orderNumber || order._id}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {getStatusBadge(order.status)}
                                        <Link
                                            to={`/orders/${order.orderNumber || order._id}`}
                                            className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1"
                                        >
                                            <FiEye className="w-4 h-4" />
                                            View Details
                                        </Link>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4">
                                    {(order.items || []).slice(0, 3).map((item, idx) => (
                                        <div key={`${order._id}-${idx}`} className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                                <img
                                                    src={item.image || '/placeholder-product.svg'}
                                                    alt={item.name || 'Product'}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-gray-900 font-medium">{item.name || 'Product'}</h3>
                                                <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-gray-900 font-medium">NRS {Number(item.price || 0).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {(order.items || []).length > 3 && (
                                        <div className="text-sm text-gray-500">+ {(order.items || []).length - 3} more item(s)</div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiShoppingBag className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
                            <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
                            <Link
                                to="/products"
                                className="mt-4 inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                            >
                                Start Shopping
                            </Link>
                        </div>
                    )}
                </div>

                {!loading && pagination.pages > 1 && (
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <div className="text-sm text-gray-600">
                            Page <span className="font-semibold text-gray-900">{pagination.page}</span> of{' '}
                            <span className="font-semibold text-gray-900">{pagination.pages}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                            disabled={page >= pagination.pages}
                            className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default OrderHistoryPage;
