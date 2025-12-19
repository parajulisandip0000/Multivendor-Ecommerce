import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiFilter, FiShoppingBag, FiTruck, FiPackage, FiCheckCircle, FiXCircle, FiEye } from 'react-icons/fi';
import DashboardLayout from '../../components/DashboardLayout';

const OrderHistoryPage = () => {
    // Mock Data
    const [orders, setOrders] = useState([
        {
            id: 'ORD-2023-001',
            date: '2023-12-08',
            total: 2499,
            status: 'delivered',
            items: [
                { id: 1, name: 'Wireless Headphones', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80', price: 2499, quantity: 1 }
            ]
        },
        {
            id: 'ORD-2023-002',
            date: '2023-12-05',
            total: 1299,
            status: 'shipped',
            items: [
                { id: 2, name: 'Smart Watch', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80', price: 1299, quantity: 1 }
            ]
        },
        {
            id: 'ORD-2023-003',
            date: '2023-12-01',
            total: 3499,
            status: 'processing',
            items: [
                { id: 3, name: 'Running Shoes', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80', price: 3499, quantity: 1 }
            ]
        },
        {
            id: 'ORD-2023-004',
            date: '2023-11-28',
            total: 599,
            status: 'cancelled',
            items: [
                { id: 4, name: 'Bluetooth Speaker', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=200&q=80', price: 599, quantity: 1 }
            ]
        }
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            shipped: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        const icons = {
            pending: <FiShoppingBag className="w-4 h-4 mr-1" />,
            processing: <FiPackage className="w-4 h-4 mr-1" />,
            shipped: <FiTruck className="w-4 h-4 mr-1" />,
            delivered: <FiCheckCircle className="w-4 h-4 mr-1" />,
            cancelled: <FiXCircle className="w-4 h-4 mr-1" />
        };
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
                {icons[status]}
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesFilter = filterStatus === 'all' || order.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
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
                                <option value="all">All Orders</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                            <div key={order.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                                {/* Order Header */}
                                <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200">
                                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Order Placed</p>
                                            <p className="text-gray-900 font-medium">
                                                {new Date(order.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Total Amount</p>
                                            <p className="text-gray-900 font-medium">NRS {order.total.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Order ID</p>
                                            <p className="text-gray-900 font-medium">{order.id}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {getStatusBadge(order.status)}
                                        <Link
                                            to={`/orders/${order.id}`}
                                            className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1"
                                        >
                                            <FiEye className="w-4 h-4" />
                                            View Details
                                        </Link>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="p-6">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-gray-900 font-medium">{item.name}</h3>
                                                <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-gray-900 font-medium">NRS {item.price.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
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
                            <Link to="/products" className="mt-4 inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                                Start Shopping
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default OrderHistoryPage;
