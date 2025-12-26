import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft, FiCreditCard, FiMapPin, FiPackage, FiPrinter } from 'react-icons/fi';
import { toast } from 'react-toastify';
import DashboardLayout from '../../components/DashboardLayout';
import { customerService } from '../../services';

const DEFAULT_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const formatStatus = (status) =>
    String(status || '')
        .replace('_', ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

const OrderDetailPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await customerService.getOrder(id);
                setOrder(res?.data || null);
            } catch (error) {
                toast.error(error?.response?.data?.message || 'Failed to load order');
                setOrder(null);
            } finally {
                setLoading(false);
            }
        };
        if (id) load();
    }, [id]);

    const steps = useMemo(() => {
        if (!order || order.status === 'cancelled') return [];
        return DEFAULT_STEPS;
    }, [order]);

    const currentStepIndex = useMemo(() => {
        if (!order || !steps.length) return -1;
        return steps.findIndex((s) => s === order.status);
    }, [order, steps]);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/4" />
                    <div className="h-64 bg-gray-200 rounded-xl" />
                </div>
            </DashboardLayout>
        );
    }

    if (!order) {
        return (
            <DashboardLayout>
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                    <div className="text-xl font-semibold text-gray-900">Order not found</div>
                    <p className="text-gray-600 mt-2">This order may have been removed or you may not have access.</p>
                    <Link
                        to="/orders"
                        className="mt-6 inline-flex items-center justify-center px-6 py-3 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition"
                    >
                        Back to orders
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    const orderId = order.orderNumber || order._id;
    const shipping = order.shippingAddress || {};

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <Link to="/orders" className="text-gray-500 hover:text-primary-600 flex items-center gap-2 mb-2 transition-colors">
                            <FiArrowLeft className="w-4 h-4" />
                            Back to Orders
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            Order #{orderId}
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    order.status === 'delivered'
                                        ? 'bg-green-100 text-green-800'
                                        : order.status === 'cancelled'
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-blue-100 text-blue-800'
                                }`}
                            >
                                {formatStatus(order.status)}
                            </span>
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">Placed on {order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <FiPrinter className="w-4 h-4" />
                        Invoice
                    </button>
                </div>

                {steps.length > 0 && (
                    <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
                        <div className="min-w-[500px]">
                            <div className="relative flex justify-between">
                                <div className="absolute top-4 left-0 w-full h-1 bg-gray-200 -z-0" />
                                <div
                                    className="absolute top-4 left-0 h-1 bg-primary-500 transition-all duration-500 -z-0"
                                    style={{
                                        width:
                                            currentStepIndex <= 0
                                                ? '0%'
                                                : `${(currentStepIndex / (steps.length - 1)) * 100}%`,
                                    }}
                                />

                                {steps.map((s, idx) => {
                                    const completed = idx <= currentStepIndex;
                                    return (
                                        <div key={s} className="flex flex-col items-center relative z-10">
                                            <div
                                                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 ${
                                                    completed
                                                        ? 'bg-primary-600 border-primary-600 text-white'
                                                        : 'bg-white border-gray-300 text-gray-400'
                                                }`}
                                            >
                                                {idx + 1}
                                            </div>
                                            <div className="text-sm font-medium text-gray-700 mt-2">{formatStatus(s)}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FiPackage className="text-gray-400" />
                                Items
                            </h3>
                            <div className="space-y-4">
                                {(order.items || []).map((item, idx) => (
                                    <div key={`${order._id}-${idx}`} className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                            <img
                                                src={item.image || '/placeholder-product.svg'}
                                                alt={item.name || 'Product'}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-primary-600 font-medium mb-1">{order.store?.name || 'Store'}</p>
                                            <h3 className="text-gray-900 font-medium">{item.name || 'Product'}</h3>
                                            <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">NRS {Number(item.price || 0).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FiMapPin className="text-gray-400" />
                                Shipping Address
                            </h3>
                            <p className="font-medium text-gray-900">{shipping.name || ''}</p>
                            <p className="text-gray-600 text-sm mt-1">{shipping.street || ''}</p>
                            <p className="text-gray-600 text-sm">
                                {[shipping.city, shipping.state, shipping.zipCode].filter(Boolean).join(', ')}
                            </p>
                            <p className="text-gray-600 text-sm mt-1">{shipping.country || ''}</p>
                            <p className="text-gray-600 text-sm mt-2">{shipping.phone || ''}</p>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FiCreditCard className="text-gray-400" />
                                Payment Information
                            </h3>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600 text-sm">Method</span>
                                <span className="text-gray-900 font-medium text-sm">{formatStatus(order.paymentMethod)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-sm">Status</span>
                                <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                        order.paymentStatus === 'paid'
                                            ? 'bg-green-100 text-green-800'
                                            : order.paymentStatus === 'failed'
                                              ? 'bg-red-100 text-red-800'
                                              : 'bg-yellow-100 text-yellow-800'
                                    }`}
                                >
                                    {formatStatus(order.paymentStatus)}
                                </span>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
                            <div className="space-y-3 pb-4 border-b border-gray-200">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="text-gray-900">NRS {Number(order.subtotal || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="text-gray-900">NRS {Number(order.shippingFee || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tax</span>
                                    <span className="text-gray-900">NRS {Number(order.tax || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Discount</span>
                                    <span className="text-gray-900">NRS {Number(order.discount || 0).toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-4">
                                <span className="font-bold text-gray-900">Total</span>
                                <span className="font-bold text-xl text-primary-600">NRS {Number(order.total || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default OrderDetailPage;
