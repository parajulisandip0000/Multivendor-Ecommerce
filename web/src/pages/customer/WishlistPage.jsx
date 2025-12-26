import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiArrowRight, FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import DashboardLayout from '../../components/DashboardLayout';
import { customerService } from '../../services';
import { setWishlist } from '../../redux/slices/wishlistSlice';
import { setCart } from '../../redux/slices/cartSlice';

const WishlistPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const wishlistItems = useSelector((state) => state.wishlist.items);

    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);

    const isCustomer = isAuthenticated && user?.role === 'customer';

    useEffect(() => {
        const load = async () => {
            if (!isCustomer) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const res = await customerService.getWishlist();
                const wishlist = res?.data;
                dispatch(setWishlist(Array.isArray(wishlist?.items) ? wishlist.items : []));
            } catch (error) {
                toast.error(error?.response?.data?.message || 'Failed to load wishlist');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [dispatch, isCustomer]);

    const removeFromWishlist = async (itemId) => {
        if (!itemId) return;
        setBusyId(itemId);
        try {
            const res = await customerService.removeFromWishlist(itemId);
            const wishlist = res?.data;
            dispatch(setWishlist(Array.isArray(wishlist?.items) ? wishlist.items : []));
            toast.success('Removed from wishlist');
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to remove item');
        } finally {
            setBusyId(null);
        }
    };

    const addToCart = async (wishlistItem) => {
        const productId = wishlistItem?.product?._id || wishlistItem?.product;
        if (!productId) return;

        if (!isCustomer) {
            navigate('/login');
            return;
        }

        setBusyId(wishlistItem._id);
        try {
            const res = await customerService.addToCart({ productId, quantity: 1 });
            const cart = res?.data;
            dispatch(setCart(Array.isArray(cart?.items) ? cart.items : []));
            toast.success('Added to cart');
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to add to cart');
        } finally {
            setBusyId(null);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
                        <p className="text-gray-500">{wishlistItems.length} items saved</p>
                    </div>
                </div>

                {!isCustomer ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                        <div className="bg-pink-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FiHeart className="w-10 h-10 text-pink-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Login to use wishlist</h2>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">You need a customer account to save products.</p>
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-all"
                        >
                            Go to login
                            <FiArrowRight />
                        </Link>
                    </div>
                ) : loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
                                <div className="aspect-square bg-gray-100" />
                                <div className="p-2 space-y-2">
                                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : wishlistItems.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                        {wishlistItems.map((item) => {
                            const product = item.product || {};
                            const image = product.images?.[0]?.url || '/placeholder-product.svg';
                            const inStock = typeof product?.quantity === 'number' ? product.quantity > 0 : true;
                            const isBusy = busyId === item._id;

                            return (
                                <div
                                    key={item._id}
                                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow group"
                                >
                                    <div className="relative aspect-square bg-gray-100 overflow-hidden">
                                        <img
                                            src={image}
                                            alt={product.name || 'Product'}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        {!inStock && (
                                            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                                Out of Stock
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeFromWishlist(item._id)}
                                            disabled={isBusy}
                                            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-60"
                                            title="Remove from wishlist"
                                        >
                                            <FiTrash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <div className="p-2">
                                        <Link to={`/products/${product._id}`}>
                                            <h3 className="font-semibold text-gray-900 mb-1 hover:text-primary-600 truncate text-xs">
                                                {product.name || 'Product'}
                                            </h3>
                                        </Link>
                                        <div className="flex items-center gap-1 mb-2">
                                            <span className="text-yellow-400">★</span>
                                            <span className="text-xs font-medium text-gray-900">
                                                {Number(product.reviewStats?.averageRating || 0).toFixed(1)}
                                            </span>
                                            <span className="text-xs text-gray-500">({product.reviewStats?.totalReviews || 0})</span>
                                        </div>

                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-sm font-bold text-gray-900">
                                                NRS {Number(product.price || 0).toLocaleString()}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => addToCart(item)}
                                                disabled={!inStock || isBusy}
                                                className={`p-1 rounded-md transition-colors flex items-center gap-2 ${
                                                    inStock
                                                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                            >
                                                <FiShoppingCart className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                        <div className="bg-pink-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FiHeart className="w-10 h-10 text-pink-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            Explore our catalog and save items you love to your wishlist to buy them later.
                        </p>
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-full font-medium hover:shadow-lg transition-all"
                        >
                            Start Shopping
                            <FiArrowRight />
                        </Link>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default WishlistPage;
