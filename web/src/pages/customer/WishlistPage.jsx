import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiTrash2, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { toast } from 'react-toastify';
import DashboardLayout from '../../components/DashboardLayout';

const WishlistPage = () => {
    // Mock Data
    const [wishlistItems, setWishlistItems] = useState([
        {
            id: 1,
            name: 'Premium Wireless Headphones',
            price: 2499,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
            stock: true,
            rating: 4.5,
            reviews: 128
        },
        {
            id: 2,
            name: 'Smart Fitness Watch',
            price: 1299,
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
            stock: true,
            rating: 4.8,
            reviews: 89
        },
        {
            id: 3,
            name: 'Professional Camera Lens',
            price: 15999,
            image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80',
            stock: false,
            rating: 4.9,
            reviews: 24
        }
    ]);

    const removeFromWishlist = (id) => {
        setWishlistItems(wishlistItems.filter(item => item.id !== id));
        toast.success('Removed from wishlist');
    };

    const addToCart = (item) => {
        toast.success(`Added ${item.name} to cart`);
        // TODO: Implement actual add to cart logic
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
                        <p className="text-gray-500">{wishlistItems.length} items saved</p>
                    </div>
                </div>

                {/* Wishlist Grid */}
                {wishlistItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlistItems.map((item) => (
                            <div key={item.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group">
                                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    {!item.stock && (
                                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                            Out of Stock
                                        </div>
                                    )}
                                    <button
                                        onClick={() => removeFromWishlist(item.id)}
                                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Remove from wishlist"
                                    >
                                        <FiTrash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="p-4">
                                    <Link to={`/products/${item.id}`}>
                                        <h3 className="font-semibold text-gray-900 mb-1 hover:text-primary-600 truncate">{item.name}</h3>
                                    </Link>
                                    <div className="flex items-center gap-1 mb-3">
                                        <span className="text-yellow-400">★</span>
                                        <span className="text-sm font-medium text-gray-900">{item.rating}</span>
                                        <span className="text-sm text-gray-500">({item.reviews})</span>
                                    </div>

                                    <div className="flex items-center justify-between mt-4">
                                        <span className="text-lg font-bold text-gray-900">NRS {item.price.toLocaleString()}</span>
                                        <button
                                            onClick={() => addToCart(item)}
                                            disabled={!item.stock}
                                            className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${item.stock
                                                ? 'bg-primary-600 text-white hover:bg-primary-700'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                        >
                                            <FiShoppingCart className="w-5 h-5" />
                                            {/* <span className="text-sm font-medium hidden sm:block">Add</span> */}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                        <div className="bg-pink-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FiHeart className="w-10 h-10 text-pink-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            Explorer our catalog and save items you love to your wishlist to buy them later.
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
