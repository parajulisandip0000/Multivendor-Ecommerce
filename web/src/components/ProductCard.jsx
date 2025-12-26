import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import { FaHeart, FaStar } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { customerService } from '../services';
import { setCart } from '../redux/slices/cartSlice';
import { setWishlist } from '../redux/slices/wishlistSlice';

const ProductCard = ({ product, size = 'md', actionButtons = 'details' }) => {
    const defaultImage = product.images?.find((img) => img.isDefault) || product.images?.[0];
    const isSmall = size === 'sm';
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const wishlistItems = useSelector((state) => state.wishlist.items);
    const [adding, setAdding] = useState(false);
    const [wishlistBusy, setWishlistBusy] = useState(false);

    const inStock = typeof product?.quantity === 'number' ? product.quantity > 0 : true;

    const wishlistEntry = wishlistItems.find((item) => {
        const itemProductId = typeof item?.product === 'string' ? item.product : item?.product?._id;
        return itemProductId && itemProductId === product?._id;
    });
    const isWishlisted = !!wishlistEntry;

    const addToCart = async (redirectToCheckout) => {
        if (!product?._id) return;

        if (!isAuthenticated || user?.role !== 'customer') {
            toast.info('Please login as a customer to continue');
            navigate('/login');
            return;
        }

        if (!inStock) {
            toast.error('Out of stock');
            return;
        }

        setAdding(true);
        try {
            const res = await customerService.addToCart({ productId: product._id, quantity: 1 });
            const cart = res?.data;
            dispatch(setCart(Array.isArray(cart?.items) ? cart.items : []));
            if (redirectToCheckout) {
                navigate('/checkout');
            } else {
                toast.success('Added to cart');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to add to cart');
        } finally {
            setAdding(false);
        }
    };

    const toggleWishlist = async (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (!product?._id) return;

        if (!isAuthenticated || user?.role !== 'customer') {
            toast.info('Please login as a customer to use wishlist');
            navigate('/login');
            return;
        }

        setWishlistBusy(true);
        try {
            if (isWishlisted && wishlistEntry?._id) {
                const res = await customerService.removeFromWishlist(wishlistEntry._id);
                const wishlist = res?.data;
                dispatch(setWishlist(Array.isArray(wishlist?.items) ? wishlist.items : []));
                toast.success('Removed from wishlist');
            } else {
                const res = await customerService.addToWishlist(product._id);
                const wishlist = res?.data;
                dispatch(setWishlist(Array.isArray(wishlist?.items) ? wishlist.items : []));
                toast.success('Added to wishlist');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Wishlist update failed');
        } finally {
            setWishlistBusy(false);
        }
    };

    return (
        <div className={`group bg-white ${isSmall ? 'rounded-lg shadow-sm hover:shadow-lg' : 'rounded-xl shadow-md hover:shadow-2xl'} transition-all duration-300 overflow-hidden`}>
            <Link to={`/products/${product._id}`}>
                <div className={`relative overflow-hidden ${isSmall ? 'aspect-[4/3]' : 'aspect-square'}`}>
                    <img
                        src={defaultImage?.url || '/placeholder-product.svg'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <div className={`absolute ${isSmall ? 'top-2 left-2 px-2 py-0.5 text-xs' : 'top-3 left-3 px-3 py-1 text-sm'} bg-red-500 text-white rounded-full font-semibold`}>
                            {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={toggleWishlist}
                        disabled={wishlistBusy}
                        className={`absolute ${isSmall ? 'top-2 right-2 p-1.5' : 'top-3 right-3 p-2'} bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-50 disabled:opacity-60`}
                        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                        title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                        {isWishlisted ? (
                            <FaHeart className={`${isSmall ? 'w-4 h-4' : 'w-5 h-5'} text-red-500`} />
                        ) : (
                            <FiHeart className={`${isSmall ? 'w-4 h-4' : 'w-5 h-5'} text-gray-700 hover:text-red-500`} />
                        )}
                    </button>
                </div>
            </Link>

            <div className={isSmall ? 'p-3' : 'p-4'}>
                <Link to={`/products/${product._id}`}>
                    <h3 className={`font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition ${isSmall ? 'text-sm' : ''}`}>
                        {product.name}
                    </h3>
                </Link>

                <div className="flex items-center mb-2">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                            <FaStar
                                key={i}
                                className={`w-4 h-4 ${i < Math.floor(product.reviewStats?.averageRating || 0)
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                    }`}
                            />
                        ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                        ({product.reviewStats?.totalReviews || 0})
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <span className={`${isSmall ? 'text-xl' : 'text-2xl'} font-bold text-gray-900`}>
                            NRS {product.price.toLocaleString()}
                        </span>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <span className="ml-2 text-sm text-gray-500 line-through">
                                NRS {product.compareAtPrice.toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>

                {actionButtons === 'details' ? (
                    <Link
                        to={`/products/${product._id}`}
                        className={`mt-3 w-full block text-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white ${isSmall ? 'py-1.5 text-sm' : 'py-2'} rounded-lg font-medium hover:opacity-90 transition`}
                    >
                        View Details
                    </Link>
                ) : (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => addToCart(false)}
                            disabled={adding || !inStock}
                            className={`${isSmall ? 'py-1.5 text-sm' : 'py-2'} rounded-lg font-semibold transition ${!inStock
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-primary-600 text-white hover:bg-primary-700'
                                }`}
                        >
                            {adding ? 'Adding...' : 'Add to cart'}
                        </button>
                        <button
                            type="button"
                            onClick={() => addToCart(true)}
                            disabled={adding || !inStock}
                            className={`${isSmall ? 'py-1.5 text-sm' : 'py-2'} rounded-lg font-semibold transition ${!inStock
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:opacity-90'
                                }`}
                        >
                            Buy now
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductCard;
