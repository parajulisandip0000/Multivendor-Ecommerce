import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaStar } from 'react-icons/fa';
import { FiMinus, FiPlus, FiShield, FiShoppingCart, FiTruck } from 'react-icons/fi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ZoomableImage from '../../components/ZoomableImage';
import ProductCard from '../../components/ProductCard';
import { customerService, productService, storeService } from '../../services';
import { setCart } from '../../redux/slices/cartSlice';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);

    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(false);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });

    const productImages = useMemo(() => {
        if (!product) return [];
        const images = Array.isArray(product.images) ? product.images.filter((img) => img?.url) : [];

        // If no images exist, fall back to thumbnail (but do not mix thumbnail into the gallery)
        if (images.length === 0 && product.thumbnail?.url) {
            images.push({ url: product.thumbnail.url, isDefault: true });
        }
        const unique = new Map();
        for (const img of images) {
            if (!img?.url) continue;
            if (!unique.has(img.url)) unique.set(img.url, img);
        }
        return Array.from(unique.values());
    }, [product]);

    const fetchData = async () => {
        setLoading(true);
        setSelectedImageIndex(0);
        try {
            const [productRes, reviewsRes] = await Promise.all([
                productService.getProduct(id),
                productService.getProductReviews(id, { limit: 6 }),
            ]);

            const p = productRes?.data || null;
            setProduct(p);
            setReviews(Array.isArray(reviewsRes?.data) ? reviewsRes.data : []);

            if (p?.category) {
                const similarRes = await productService.getProducts({
                    category: p.category,
                    limit: 8,
                    sort: '-reviewStats.averageRating',
                });
                const items = Array.isArray(similarRes?.data) ? similarRes.data : [];
                const filtered = items.filter((x) => x?._id && x._id !== p._id).slice(0, 6);
                if (filtered.length > 0) {
                    setSimilarProducts(filtered);
                } else if (p?.store?._id) {
                    const storeRes = await storeService.getStoreProducts(p.store._id, { limit: 8, sort: '-createdAt' });
                    const storeItems = Array.isArray(storeRes?.data) ? storeRes.data : [];
                    setSimilarProducts(storeItems.filter((x) => x?._id && x._id !== p._id).slice(0, 6));
                } else {
                    setSimilarProducts([]);
                }
            } else {
                if (p?.store?._id) {
                    const storeRes = await storeService.getStoreProducts(p.store._id, { limit: 8, sort: '-createdAt' });
                    const storeItems = Array.isArray(storeRes?.data) ? storeRes.data : [];
                    setSimilarProducts(storeItems.filter((x) => x?._id && x._id !== p._id).slice(0, 6));
                } else {
                    setSimilarProducts([]);
                }
            }
        } catch (error) {
            console.error('Error fetching product details:', error);
            toast.error('Failed to load product details');
            setProduct(null);
            setReviews([]);
            setSimilarProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const canAddToCart = (product?.quantity ?? 0) > 0;

    const addToCart = async () => {
        if (!product?._id) return;

        if (!isAuthenticated || user?.role !== 'customer') {
            toast.info('Please login as a customer to add items to cart');
            navigate('/login');
            return;
        }

        if (!canAddToCart) {
            toast.error('This item is out of stock');
            return;
        }

        const safeQty = Math.max(1, Math.min(quantity, product.quantity));

        setAddingToCart(true);
        try {
            const res = await customerService.addToCart({ productId: product._id, quantity: safeQty });
            const cart = res?.data;
            dispatch(setCart(Array.isArray(cart?.items) ? cart.items : []));
            toast.success('Added to cart');
        } catch (error) {
            console.error('Add to cart failed:', error);
            toast.error(error?.response?.data?.message || 'Failed to add to cart');
        } finally {
            setAddingToCart(false);
        }
    };

    const submitReview = async (event) => {
        event.preventDefault();
        if (!product?._id) return;

        if (!isAuthenticated || user?.role !== 'customer') {
            toast.info('Please login as a customer to write a review');
            navigate('/login');
            return;
        }

        const rating = Number(reviewForm.rating);
        if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
            toast.error('Please choose a rating');
            return;
        }

        const comment = reviewForm.comment.trim();
        if (!comment) {
            toast.error('Please write a comment');
            return;
        }

        setSubmittingReview(true);
        try {
            await customerService.createReview({
                productId: product._id,
                rating,
                title: reviewForm.title.trim() || undefined,
                comment,
            });
            toast.success('Review submitted');
            setReviewForm({ rating: 5, title: '', comment: '' });
            await fetchData();
        } catch (error) {
            console.error('Review submit failed:', error);
            toast.error(error?.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="bg-white rounded-2xl border border-gray-200 p-8">
                        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <div className="aspect-square bg-gray-100 rounded-xl" />
                            <div className="space-y-4">
                                <div className="h-8 bg-gray-100 rounded w-3/4" />
                                <div className="h-5 bg-gray-100 rounded w-1/2" />
                                <div className="h-12 bg-gray-100 rounded w-2/3" />
                                <div className="h-10 bg-gray-100 rounded w-1/2" />
                                <div className="h-12 bg-gray-100 rounded w-full" />
                            </div>
                        </div>
                    </div>
                ) : !product ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                        <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
                        <p className="text-gray-600 mt-2">The product may have been removed or is unavailable.</p>
                        <Link
                            to="/"
                            className="inline-block mt-6 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition"
                        >
                            Back to home
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-10">
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                {/* Images */}
                                <div className="space-y-4">
                                    <div className="aspect-square rounded-xl border border-gray-200 overflow-hidden bg-white">
                                        <ZoomableImage
                                            src={productImages[selectedImageIndex]?.url || '/placeholder-product.svg'}
                                            alt={product.name}
                                            className="w-full h-full"
                                        />
                                    </div>

                                    {productImages.length > 1 && (
                                        <div className="grid grid-cols-6 gap-3">
                                            {productImages.slice(0, 6).map((img, idx) => (
                                                <button
                                                    key={img.url}
                                                    type="button"
                                                    onClick={() => setSelectedImageIndex(idx)}
                                                    className={`aspect-square rounded-lg border overflow-hidden bg-gray-50 ${idx === selectedImageIndex
                                                        ? 'border-primary-500 ring-2 ring-primary-100'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                    aria-label={`View image ${idx + 1}`}
                                                >
                                                    <img src={img.url} alt={product.name} className="w-full h-full object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div>
                                    <div className="flex items-start justify-between gap-6">
                                        <div className="min-w-0">
                                            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                                                {product.name}
                                            </h1>
                                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
                                                {product.store?._id ? (
                                                    <Link
                                                        to={`/stores/${product.store._id}`}
                                                        className="text-gray-600 hover:text-primary-600 transition"
                                                    >
                                                        Sold by <span className="font-medium">{product.store?.name || 'Store'}</span>
                                                    </Link>
                                                ) : (
                                                    <span className="text-gray-600">
                                                        Category: <span className="font-medium">{product.category}</span>
                                                    </span>
                                                )}
                                                {product.category && (
                                                    <span className="text-gray-500">• {product.category}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className={`shrink-0 px-3 py-1 rounded-full text-sm font-semibold ${canAddToCart ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                            }`}>
                                            {canAddToCart ? 'In stock' : 'Out of stock'}
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center gap-2">
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
                                        <span className="text-sm text-gray-600">
                                            {Number(product.reviewStats?.averageRating || 0).toFixed(1)} ({product.reviewStats?.totalReviews || 0} reviews)
                                        </span>
                                    </div>

                                    <div className="mt-6 flex items-end gap-3">
                                        <div className="text-3xl font-extrabold text-gray-900">
                                            NRS {Number(product.price || 0).toLocaleString()}
                                        </div>
                                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                                            <div className="pb-1">
                                                <div className="text-sm text-gray-500 line-through">
                                                    NRS {Number(product.compareAtPrice).toLocaleString()}
                                                </div>
                                                <div className="text-sm font-semibold text-red-600">
                                                    Save {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <p className="mt-6 text-gray-700 leading-relaxed">
                                        {product.description}
                                    </p>

                                    <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
                                        <div className="inline-flex items-center rounded-xl border border-gray-200 bg-white overflow-hidden">
                                            <button
                                                type="button"
                                                className="px-4 py-3 text-gray-700 hover:bg-gray-50 disabled:text-gray-300"
                                                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                                disabled={quantity <= 1}
                                                aria-label="Decrease quantity"
                                            >
                                                <FiMinus />
                                            </button>
                                            <div className="px-4 py-3 min-w-14 text-center font-semibold text-gray-900">
                                                {quantity}
                                            </div>
                                            <button
                                                type="button"
                                                className="px-4 py-3 text-gray-700 hover:bg-gray-50 disabled:text-gray-300"
                                                onClick={() => {
                                                    const maxQty = Math.max(1, product.quantity || 1);
                                                    setQuantity((q) => Math.min(maxQty, q + 1));
                                                }}
                                                disabled={!canAddToCart || quantity >= (product.quantity || 1)}
                                                aria-label="Increase quantity"
                                            >
                                                <FiPlus />
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={addToCart}
                                            disabled={!canAddToCart || addingToCart}
                                            className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition ${canAddToCart
                                                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 hover:opacity-90'
                                                : 'bg-gray-300 cursor-not-allowed'
                                                }`}
                                        >
                                            <FiShoppingCart className="w-5 h-5" />
                                            {addingToCart ? 'Adding...' : 'Add to cart'}
                                        </button>
                                    </div>

                                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
                                            <FiTruck className="w-6 h-6 text-primary-600" />
                                            <div>
                                                <div className="font-semibold text-gray-900">Fast delivery</div>
                                                <div className="text-sm text-gray-600">Reliable shipping nationwide</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
                                            <FiShield className="w-6 h-6 text-primary-600" />
                                            <div>
                                                <div className="font-semibold text-gray-900">Secure payments</div>
                                                <div className="text-sm text-gray-600">Trusted checkout experience</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reviews */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
                            <div className="flex items-end justify-between gap-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
                                    <p className="text-gray-600 mt-1">
                                        {product.reviewStats?.totalReviews || 0} total reviews
                                    </p>
                                </div>
                                {!isAuthenticated || user?.role !== 'customer' ? (
                                    <Link to="/login" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
                                        Login to review
                                    </Link>
                                ) : (
                                    <span className="text-sm font-semibold text-gray-600">Share your experience below</span>
                                )}
                            </div>

                            {isAuthenticated && user?.role === 'customer' && (
                                <form onSubmit={submitReview} className="mt-6 border border-gray-200 rounded-xl p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 mb-2">Rating</label>
                                            <div className="inline-flex items-center gap-2">
                                                {[1, 2, 3, 4, 5].map((r) => (
                                                    <button
                                                        key={r}
                                                        type="button"
                                                        onClick={() => setReviewForm((prev) => ({ ...prev, rating: r }))}
                                                        className="p-1"
                                                        aria-label={`Set rating ${r}`}
                                                    >
                                                        <FaStar
                                                            className={`w-6 h-6 ${r <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-900 mb-2">Title (optional)</label>
                                            <input
                                                type="text"
                                                value={reviewForm.title}
                                                onChange={(e) => setReviewForm((prev) => ({ ...prev, title: e.target.value }))}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                placeholder="Great quality!"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Comment</label>
                                        <textarea
                                            value={reviewForm.comment}
                                            onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                                            rows={4}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder="Tell others what you liked (or didn’t)..."
                                        />
                                    </div>

                                    <div className="mt-4 flex items-center justify-end">
                                        <button
                                            type="submit"
                                            disabled={submittingReview}
                                            className="px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-500 to-secondary-500 hover:opacity-90 disabled:opacity-60"
                                        >
                                            {submittingReview ? 'Submitting...' : 'Submit review'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {reviews.length === 0 ? (
                                <div className="mt-6 text-gray-600">No reviews yet.</div>
                            ) : (
                                <div className="mt-6 space-y-5">
                                    {reviews.map((review) => (
                                        <div key={review._id} className="border border-gray-200 rounded-xl p-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0">
                                                    <div className="font-semibold text-gray-900 truncate">
                                                        {review.customer?.name || 'Customer'}
                                                    </div>
                                                    {review.title && (
                                                        <div className="mt-1 font-medium text-gray-900">{review.title}</div>
                                                    )}
                                                    <div className="mt-1 flex items-center gap-2">
                                                        <div className="flex items-center">
                                                            {[...Array(5)].map((_, i) => (
                                                                <FaStar
                                                                    key={i}
                                                                    className={`w-4 h-4 ${i < Math.floor(review.rating || 0)
                                                                        ? 'text-yellow-400'
                                                                        : 'text-gray-300'
                                                                        }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-sm text-gray-500">
                                                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {review.comment && (
                                                <p className="mt-3 text-gray-700 leading-relaxed">{review.comment}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Similar products */}
                        {similarProducts.length > 0 && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
                                <div className="flex items-end justify-between gap-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            {product.category ? 'Similar products' : 'More from this store'}
                                        </h2>
                                        <p className="text-gray-600 mt-1">
                                            {product.category
                                                ? `More items in ${product.category}`
                                                : `More items from ${product.store?.name || 'this store'}`}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                                    {similarProducts.map((p) => (
                                        <ProductCard key={p._id} product={p} size="sm" actionButtons="cart" />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default ProductDetailPage;
