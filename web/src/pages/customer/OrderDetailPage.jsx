import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiPackage, FiTruck, FiCheckCircle, FiClock, FiMapPin, FiCreditCard, FiPrinter } from 'react-icons/fi';
import DashboardLayout from '../../components/DashboardLayout';

const OrderDetailPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);

    // Mock Data Fetching
    useEffect(() => {
        // Simulating API call
        setTimeout(() => {
            setOrder({
                id: id || 'ORD-2023-001',
                date: '2023-12-08T10:30:00',
                status: 'processing', // pending, processing, shipped, delivered, cancelled
                total: 2499,
                subtotal: 2399,
                shipping: 100,
                tax: 0,
                paymentMethod: 'Credit Card',
                paymentStatus: 'Paid',
                shippingAddress: {
                    name: 'John Doe',
                    line1: '123 Main Street',
                    line2: 'Apartment 4B',
                    city: 'Kathmandu',
                    state: 'Bagmati',
                    zip: '44600',
                    phone: '+977 9800000000'
                },
                items: [
                    {
                        id: 1,
                        name: 'Wireless Headphones',
                        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80',
                        price: 2399,
                        quantity: 1,
                        storeName: 'TechGadgets Nepal'
                    }
                ],
                timeline: [
                    { status: 'pending', label: 'Order Placed', date: '2023-12-08 10:30 AM', completed: true },
                    { status: 'processing', label: 'Processing', date: '2023-12-08 11:45 AM', completed: true },
                    { status: 'shipped', label: 'Shipped', date: null, completed: false },
                    { status: 'delivered', label: 'Delivered', date: null, completed: false }
                ]
            });
        }, 500);
    }, [id]);

    if (!order) {
        return (
            <DashboardLayout>
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-64 bg-gray-200 rounded-xl"></div>
                </div>
            </DashboardLayout>
        );
    }

    const currentStepIndex = order.timeline.findIndex(t => t.status === order.status);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <Link to="/orders" className="text-gray-500 hover:text-primary-600 flex items-center gap-2 mb-2 transition-colors">
                            <FiArrowLeft className="w-4 h-4" />
                            Back to Orders
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            Order #{order.id}
                            <span className={`px-3 py-1 rounded-full text-sm font-medium 
                                ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                        'bg-blue-100 text-blue-800'}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Placed on {new Date(order.date).toLocaleString()}
                        </p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <FiPrinter className="w-4 h-4" />
                        Invoice
                    </button>
                </div>

                {/* Order Timeline */}
                {order.status !== 'cancelled' && (
                    <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
                        <div className="min-w-[500px]">
                            <div className="relative flex justify-between">
                                {/* Connecting Line */}
                                <div className="absolute top-4 left-0 w-full h-1 bg-gray-200 -z-0"></div>
                                <div
                                    className="absolute top-4 left-0 h-1 bg-primary-500 transition-all duration-500 -z-0"
                                    style={{ width: `${(currentStepIndex / (order.timeline.length - 1)) * 100}%` }}
                                ></div>

                                {order.timeline.map((step, index) => {
                                    const isCompleted = index <= currentStepIndex;
                                    const isCurrent = index === currentStepIndex;

                                    return (
                                        <div key={index} className="flex flex-col items-center relative z-10 w-1/4">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors bg-white
                                                ${isCompleted ? 'border-primary-500 bg-primary-600 text-white' : 'border-gray-300 text-gray-400'}
                                            `}>
                                                {index === 0 && <FiClock className="w-4 h-4" />}
                                                {index === 1 && <FiPackage className="w-4 h-4" />}
                                                {index === 2 && <FiTruck className="w-4 h-4" />}
                                                {index === 3 && <FiCheckCircle className="w-4 h-4" />}
                                            </div>
                                            <p className={`mt-2 text-sm font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                                                {step.label}
                                            </p>
                                            {step.date && <p className="text-xs text-gray-500">{step.date}</p>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Items */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h2 className="font-semibold text-gray-900">Order Items</h2>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {order.items.map((item) => (
                                    <div key={item.id} className="p-6 flex items-center gap-4">
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-primary-600 font-medium mb-1">{item.storeName}</p>
                                            <h3 className="text-gray-900 font-medium">{item.name}</h3>
                                            <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">NRS {item.price.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Info & Summary */}
                    <div className="space-y-6">
                        {/* Shipping Address */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FiMapPin className="text-gray-400" />
                                Shipping Address
                            </h3>
                            <p className="font-medium text-gray-900">{order.shippingAddress.name}</p>
                            <p className="text-gray-600 text-sm mt-1">{order.shippingAddress.line1}</p>
                            {order.shippingAddress.line2 && <p className="text-gray-600 text-sm">{order.shippingAddress.line2}</p>}
                            <p className="text-gray-600 text-sm">
                                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                            </p>
                            <p className="text-gray-600 text-sm mt-2">{order.shippingAddress.phone}</p>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FiCreditCard className="text-gray-400" />
                                Payment Information
                            </h3>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600 text-sm">Method</span>
                                <span className="text-gray-900 font-medium text-sm">{order.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-sm">Status</span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    {order.paymentStatus}
                                </span>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
                            <div className="space-y-3 pb-4 border-b border-gray-200">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="text-gray-900">NRS {order.subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="text-gray-900">NRS {order.shipping.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tax</span>
                                    <span className="text-gray-900">NRS {order.tax.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-4">
                                <span className="font-bold text-gray-900">Total</span>
                                <span className="font-bold text-xl text-primary-600">NRS {order.total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default OrderDetailPage;
