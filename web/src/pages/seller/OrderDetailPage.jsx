import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchSellerOrderDetails, updateSellerOrderStatus, clearCurrentOrder } from '../../redux/slices/sellerSlice';
import SellerDashboardLayout from '../../components/SellerDashboardLayout';
import { FiArrowLeft, FiUser, FiMapPin, FiCreditCard, FiPackage, FiClock } from 'react-icons/fi';
import { toast } from 'react-toastify';

const OrderDetailPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentOrder, loading, error } = useSelector((state) => state.seller);
    const [statusToUpdate, setStatusToUpdate] = useState('');

    useEffect(() => {
        if (id) {
            dispatch(fetchSellerOrderDetails(id));
        }
        return () => {
            dispatch(clearCurrentOrder());
            setStatusToUpdate('');
        };
    }, [dispatch, id]);

    useEffect(() => {
        if (currentOrder) {
            setStatusToUpdate(currentOrder.status);
        }
    }, [currentOrder]);

    const handleStatusUpdate = async () => {
        if (!statusToUpdate || statusToUpdate === currentOrder.status) return;
        try {
            await dispatch(updateSellerOrderStatus({ id, status: statusToUpdate })).unwrap();
            toast.success('Order status updated successfully');
        } catch (error) {
            toast.error(error || 'Failed to update status');
        }
    };

    if (loading && !currentOrder) {
        return (
            <SellerDashboardLayout>
                <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                </div>
            </SellerDashboardLayout>
        );
    }

    if (error) {
        return (
            <SellerDashboardLayout>
                <div className="text-center py-12">
                    <p className="text-red-500 text-lg mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/seller/orders')}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                    >
                        Back to Orders
                    </button>
                </div>
            </SellerDashboardLayout>
        );
    }

    if (!currentOrder) return null;

    return (
        <SellerDashboardLayout>
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/seller/orders')}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <FiArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Order #{currentOrder._id.slice(-6).toUpperCase()}</h1>
                            <p className="text-sm text-gray-500">
                                Placed on {new Date(currentOrder.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Status Actions */}
                    <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-200">
                        <span className="text-sm font-medium text-gray-600 pl-2">Status:</span>
                        <select
                            value={statusToUpdate}
                            onChange={(e) => setStatusToUpdate(e.target.value)}
                            className="px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-primary-500"
                            disabled={currentOrder.status === 'cancelled' || currentOrder.status === 'delivered'}
                        >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                            onClick={handleStatusUpdate}
                            disabled={statusToUpdate === currentOrder.status || loading}
                            className="px-4 py-1.5 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Update
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Items */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FiPackage /> Order Items
                            </h2>
                            <div className="divide-y divide-gray-100">
                                {currentOrder.items.map((item, index) => (
                                    <div key={index} className="py-4 flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                            {item.product?.images?.[0]?.url ? (
                                                <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{item.product?.name || 'Unknown Product'}</p>
                                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">NRS {(item.price * item.quantity).toLocaleString()}</p>
                                            <p className="text-xs text-gray-500">@{item.price.toLocaleString()} / unit</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                                <span className="font-medium text-gray-700">Total Order Value</span>
                                <span className="text-xl font-bold text-primary-600">NRS {currentOrder.total.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Timeline / History (Placeholder for now) */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FiClock /> Order Timeline
                            </h2>
                            <div className="text-sm text-gray-600">
                                <p>Created: {new Date(currentOrder.createdAt).toLocaleString()}</p>
                                {currentOrder.deliveredAt && (
                                    <p className="text-green-600">Delivered: {new Date(currentOrder.deliveredAt).toLocaleString()}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        {/* Customer Details */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FiUser /> Customer
                            </h2>
                            <div className="flex items-center gap-3 mb-4">
                                <img
                                    src={currentOrder.customer?.avatar || 'https://via.placeholder.com/150'}
                                    alt="Customer"
                                    className="w-12 h-12 rounded-full border border-gray-200"
                                />
                                <div>
                                    <p className="font-medium text-gray-900">{currentOrder.customer?.name || 'Guest User'}</p>
                                    <p className="text-sm text-gray-500">{currentOrder.customer?.email}</p>
                                </div>
                            </div>
                            {currentOrder.customer?.phone && (
                                <p className="text-sm text-gray-600 mb-2">Phone: {currentOrder.customer.phone}</p>
                            )}
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FiMapPin /> Shipping Address
                            </h2>
                            <div className="text-sm text-gray-600 leading-relaxed">
                                <p className="font-medium text-gray-900">{currentOrder.shippingAddress?.fullName || currentOrder.customer?.name}</p>
                                <p>{currentOrder.shippingAddress?.addressLine1}</p>
                                {currentOrder.shippingAddress?.addressLine2 && <p>{currentOrder.shippingAddress.addressLine2}</p>}
                                <p>
                                    {currentOrder.shippingAddress?.city}, {currentOrder.shippingAddress?.state} {currentOrder.shippingAddress?.postalCode}
                                </p>
                                <p>{currentOrder.shippingAddress?.country}</p>
                                <p className="mt-2 text-gray-500">Phone: {currentOrder.shippingAddress?.phone}</p>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FiCreditCard /> Payment
                            </h2>
                            <div className="text-sm">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Method:</span>
                                    <span className="font-medium text-gray-900 uppercase">{currentOrder.paymentMethod}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Status:</span>
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${currentOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {currentOrder.paymentStatus}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SellerDashboardLayout>
    );
};

export default OrderDetailPage;
