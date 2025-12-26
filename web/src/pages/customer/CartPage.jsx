import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiMinus, FiPlus, FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { customerService } from '../../services';
import { setCart } from '../../redux/slices/cartSlice';

const CartPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const cartItems = useSelector((state) => state.cart.items);

    const [loading, setLoading] = useState(false);
    const [busyItemId, setBusyItemId] = useState(null);

    const isCustomer = isAuthenticated && user?.role === 'customer';

    const subtotal = useMemo(() => {
        return cartItems.reduce((sum, item) => {
            const price = Number(item?.product?.price || 0);
            const qty = Number(item?.quantity || 0);
            if (!Number.isFinite(price) || !Number.isFinite(qty)) return sum;
            return sum + price * qty;
        }, 0);
    }, [cartItems]);

    const hydrateCart = async () => {
        if (!isCustomer) return;
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

    useEffect(() => {
        hydrateCart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, user?.role]);

    const updateQuantity = async (item, nextQuantity) => {
        const itemId = item?._id;
        if (!itemId) return;

        const quantity = Math.max(1, Number(nextQuantity || 1));
        setBusyItemId(itemId);
        try {
            const res = await customerService.updateCartItem(itemId, { quantity });
            const cart = res?.data;
            dispatch(setCart(Array.isArray(cart?.items) ? cart.items : []));
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to update cart');
        } finally {
            setBusyItemId(null);
        }
    };

    const removeItem = async (itemId) => {
        if (!itemId) return;
        setBusyItemId(itemId);
        try {
            const res = await customerService.removeFromCart(itemId);
            const cart = res?.data;
            dispatch(setCart(Array.isArray(cart?.items) ? cart.items : []));
            toast.success('Removed from cart');
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to remove item');
        } finally {
            setBusyItemId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
                        <p className="text-gray-600 mt-1">
                            {cartItems.length} item{cartItems.length === 1 ? '' : 's'} in your cart
                        </p>
                    </div>
                    <Link to="/products" className="text-primary-600 hover:text-primary-700 font-medium">
                        Continue shopping
                    </Link>
                </div>

                {!isCustomer ? (
                    <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-8 text-center">
                        <div className="text-xl font-semibold text-gray-900">Login to view your cart</div>
                        <p className="text-gray-600 mt-2">You need a customer account to manage cart items.</p>
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
                        <div className="mt-6 space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-24 bg-gray-100 rounded-xl" />
                            ))}
                        </div>
                    </div>
                ) : cartItems.length === 0 ? (
                    <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-10 text-center">
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center">
                            <FiShoppingBag className="w-8 h-8 text-primary-600" />
                        </div>
                        <div className="mt-4 text-xl font-semibold text-gray-900">Your cart is empty</div>
                        <p className="text-gray-600 mt-2">Browse products and add items to your cart.</p>
                        <Link
                            to="/products"
                            className="mt-6 inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:opacity-90 transition"
                        >
                            Start shopping
                        </Link>
                    </div>
                ) : (
                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item) => {
                                const product = item.product || {};
                                const image = product.images?.[0]?.url || '/placeholder-product.svg';
                                const isBusy = busyItemId === item._id;
                                const maxQty = typeof product.quantity === 'number' ? product.quantity : null;

                                return (
                                    <div key={item._id} className="bg-white rounded-2xl border border-gray-200 p-4">
                                        <div className="flex gap-4">
                                            <Link
                                                to={`/products/${product._id}`}
                                                className="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200"
                                            >
                                                <img src={image} alt={product.name || 'Product'} className="w-full h-full object-cover" />
                                            </Link>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="min-w-0">
                                                        <Link
                                                            to={`/products/${product._id}`}
                                                            className="font-semibold text-gray-900 hover:text-primary-600 line-clamp-2"
                                                        >
                                                            {product.name || 'Product'}
                                                        </Link>
                                                        {maxQty === 0 && (
                                                            <div className="mt-1 text-sm text-red-600">Out of stock</div>
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        disabled={isBusy}
                                                        onClick={() => removeItem(item._id)}
                                                        className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                                        title="Remove"
                                                    >
                                                        <FiTrash2 className="w-5 h-5" />
                                                    </button>
                                                </div>

                                                <div className="mt-3 flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            disabled={isBusy || item.quantity <= 1}
                                                            onClick={() => updateQuantity(item, item.quantity - 1)}
                                                            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                                                        >
                                                            <FiMinus className="w-4 h-4" />
                                                        </button>
                                                        <div className="w-12 text-center font-semibold text-gray-900">
                                                            {item.quantity}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            disabled={isBusy || (typeof maxQty === 'number' && item.quantity >= maxQty)}
                                                            onClick={() => updateQuantity(item, item.quantity + 1)}
                                                            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                                                        >
                                                            <FiPlus className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    <div className="text-right">
                                                        <div className="text-sm text-gray-500">Price</div>
                                                        <div className="font-bold text-gray-900">
                                                            NRS {Number(product.price || 0).toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 p-6 h-fit">
                            <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
                            <div className="mt-4 space-y-3">
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
                                onClick={() => navigate('/checkout')}
                                className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold hover:opacity-90 transition"
                            >
                                Proceed to checkout
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default CartPage;
