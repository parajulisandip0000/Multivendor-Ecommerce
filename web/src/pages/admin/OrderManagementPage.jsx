import { useState, useEffect } from 'react';
import { storeManagerService } from '../../services';
import StoreManagerLayout from '../../components/StoreManagerLayout';
import { FiSearch, FiFilter, FiCheck, FiX, FiRefreshCw, FiMessageCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const OrderManagementPage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchOrders();
    }, [page, statusFilter]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = { page, limit: 10 };
            if (statusFilter) params.status = statusFilter;

            const response = await storeManagerService.getOrders(params);
            setOrders(response.data);
            if (response.pagination) {
                setTotalPages(response.pagination.pages);
            }
        } catch (error) {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await storeManagerService.updateOrderStatus(orderId, { status: newStatus });
            toast.success(`Order status updated to ${newStatus}`);
            fetchOrders();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update order status');
        }
    };

    const StatusBadge = ({ status }) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            shipped: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };

        return (
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <StoreManagerLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
                    <p className="text-gray-500">Track and manage your orders</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Filters */}
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <FiFilter className="text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
                    </div>
                    <div className="flex gap-2">
                        {['', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                            <button
                                key={status}
                                onClick={() => { setStatusFilter(status); setPage(1); }}
                                className={`px-3 py-1 text-sm rounded-full border transition-colors
                                    ${statusFilter === status
                                        ? 'bg-primary-100 border-primary-500 text-primary-700 font-medium'
                                        : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {status === '' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="px-6 py-3 font-semibold">Order ID</th>
                                <th className="px-6 py-3 font-semibold">Date</th>
                                <th className="px-6 py-3 font-semibold">Customer</th>
                                <th className="px-6 py-3 font-semibold">Total</th>
                                <th className="px-6 py-3 font-semibold">Status</th>
                                <th className="px-6 py-3 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : orders.length > 0 ? (
                                orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-sm">#{order._id.slice(-6).toUpperCase()}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="font-medium text-gray-900">{order.customer?.name || 'Guest'}</div>
                                            <div className="text-gray-500 text-xs">{order.customer?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            NRS {order.total.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                                    className="text-sm border-gray-300 rounded shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="processing">Processing</option>
                                                    <option value="shipped">Shipped</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                                {order.customer?._id && (
                                                    <button
                                                        type="button"
                                                        onClick={() => navigate(`/store-manager/chat?customerId=${order.customer._id}`)}
                                                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700"
                                                        title="Message customer"
                                                    >
                                                        <FiMessageCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No orders found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-3 py-1 border rounded disabled:opacity-50 text-sm bg-white"
                    >
                        Previous
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-600">Page {page} of {totalPages}</span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="px-3 py-1 border rounded disabled:opacity-50 text-sm bg-white"
                    >
                        Next
                    </button>
                </div>
            </div>
        </StoreManagerLayout>
    );
};

export default OrderManagementPage;
