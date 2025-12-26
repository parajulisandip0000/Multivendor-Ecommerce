import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { customerService } from '../../services';
import { setCart } from '../../redux/slices/cartSlice';

const DEFAULT_ADDRESS = {
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Nepal',
};

const CheckoutPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const cartItems = useSelector((state) => state.cart.items);

    const [loading, setLoading] = useState(true);
    const [placing, setPlacing] = useState(false);
    const [shippingAddress, setShippingAddress] = useState(DEFAULT_ADDRESS);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [customerNote, setCustomerNote] = useState('');

    const isCustomer = isAuthenticated && user?.role === 'customer';

    const subtotal = useMemo(() => {
        return cartItems.reduce((sum, item) => sum + Number(item?.product?.price || 0) * Number(item?.quantity || 0), 0);
    }, [cartItems]);

    useEffect(() => {
        const load = async () => {
            if (!isCustomer) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const res = await customerService.getCart();
                const cart = res?.data;
                dispatch(setCart(Array.isArray(cart?.items) ? cart.items : []));
            } catch (error) {
                toast.error(error?.response?.data?.message || 'Failed to load cart');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [dispatch, isCustomer]);

    const onAddressChange = (e) => {
        const { name, value } = e.target;
        setShippingAddress((prev) => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const required = ['name', 'phone', 'street', 'city', 'state', 'zipCode', 'country'];
        for (const key of required) {
            if (!String(shippingAddress[key] || '').trim()) {
                toast.error(`Please enter ${key}`);
                return false;
            }
        }
        if (cartItems.length === 0) {
            toast.error('Your cart is empty');
            return false;
        }
        return true;
    };

    const placeOrder = async () => {
        if (!validate()) return;

        setPlacing(true);
        try {
            const payload = {
                items: cartItems.map((item) => ({
                    productId: item.product?._id,
                    quantity: item.quantity,
                    variant: item.variant,
                })),
                shippingAddress,
                paymentMethod,
                customerNote: customerNote.trim() || undefined,
            };

            const res = await customerService.createOrder(payload);
            const createdOrders = Array.isArray(res?.data) ? res.data : [];

            dispatch(setCart([]));
            toast.success(res?.message || 'Order placed successfully');
            navigate(createdOrders[0]?.orderNumber ? `/orders/${createdOrders[0].orderNumber}` : '/orders');
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to place order');
        } finally {
            setPlacing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
                        <p className="text-gray-600 mt-1">Confirm your shipping details and place your order.</p>
                    </div>
                    <Link to="/cart" className="text-primary-600 hover:text-primary-700 font-medium">
                        Back to cart
                    </Link>
                </div>

                {!isCustomer ? (
                    <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-8 text-center">
                        <div className="text-xl font-semibold text-gray-900">Login to checkout</div>
                        <p className="text-gray-600 mt-2">You need a customer account to place orders.</p>
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="mt-6 inline-flex items-center justify-center px-6 py-3 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition"
                        >
                            Go to login
                        </button>
                    </div>
                ) : loading ? (
                    <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-8 animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-1/3" />
                        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 h-72 bg-gray-100 rounded-2xl" />
                            <div className="h-72 bg-gray-100 rounded-2xl" />
                        </div>
                    </div>
                ) : cartItems.length === 0 ? (
                    <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-10 text-center">
                        <div className="text-xl font-semibold text-gray-900">Your cart is empty</div>
                        <p className="text-gray-600 mt-2">Add items to your cart before checking out.</p>
                        <Link
                            to="/products"
                            className="mt-6 inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:opacity-90 transition"
                        >
                            Shop products
                        </Link>
                    </div>
                ) : (
                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Full name</label>
                                        <input
                                            name="name"
                                            value={shippingAddress.name}
                                            onChange={onAddressChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                        <input
                                            name="phone"
                                            value={shippingAddress.phone}
                                            onChange={onAddressChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Zip code</label>
                                        <input
                                            name="zipCode"
                                            value={shippingAddress.zipCode}
                                            onChange={onAddressChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Street address</label>
                                        <input
                                            name="street"
                                            value={shippingAddress.street}
                                            onChange={onAddressChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                        <input
                                            name="city"
                                            value={shippingAddress.city}
                                            onChange={onAddressChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                                        <input
                                            name="state"
                                            value={shippingAddress.state}
                                            onChange={onAddressChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                                        <input
                                            name="country"
                                            value={shippingAddress.country}
                                            onChange={onAddressChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h2 className="text-xl font-bold text-gray-900">Payment</h2>
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment method</label>
                                        <select
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                                        >
                                            <option value="cod">Cash on delivery</option>
                                            <option value="esewa">eSewa</option>
                                            <option value="khalti">Khalti</option>
                                            <option value="phonepe">PhonePe</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Order note (optional)</label>
                                        <textarea
                                            value={customerNote}
                                            onChange={(e) => setCustomerNote(e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 p-6 h-fit">
                            <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
                            <div className="mt-4 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Items</span>
                                    <span className="font-semibold text-gray-900">{cartItems.length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-semibold text-gray-900">NRS {subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="font-semibold text-gray-900">NRS 0</span>
                                </div>
                                <div className="border-t border-gray-200 pt-3 flex justify-between">
                                    <span className="font-bold text-gray-900">Total</span>
                                    <span className="font-bold text-primary-600">NRS {subtotal.toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                disabled={placing}
                                onClick={placeOrder}
                                className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold hover:opacity-90 transition disabled:opacity-60"
                            >
                                {placing ? 'Placing order...' : 'Place order'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default CheckoutPage;
