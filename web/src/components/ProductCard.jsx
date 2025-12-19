import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';

const ProductCard = ({ product }) => {
    const defaultImage = product.images?.find((img) => img.isDefault) || product.images?.[0];

    return (
        <div className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <Link to={`/products/${product._id}`}>
                <div className="relative overflow-hidden aspect-square">
                    <img
                        src={defaultImage?.url || '/placeholder-product.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
                        </div>
                    )}
                    <button className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-50">
                        <FiHeart className="w-5 h-5 text-gray-700 hover:text-red-500" />
                    </button>
                </div>
            </Link>

            <div className="p-4">
                <Link to={`/products/${product._id}`}>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition">
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
                        <span className="text-2xl font-bold text-gray-900">
                            NRS {product.price.toLocaleString()}
                        </span>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <span className="ml-2 text-sm text-gray-500 line-through">
                                NRS {product.compareAtPrice.toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>

                <Link
                    to={`/products/${product._id}`}
                    className="mt-4 w-full block text-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-2 rounded-lg font-medium hover:opacity-90 transition"
                >
                    View Details
                </Link>
            </div>
        </div>
    );
};

export default ProductCard;
