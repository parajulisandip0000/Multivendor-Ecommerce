import { Link } from 'react-router-dom';
import { FiClock, FiShoppingCart } from 'react-icons/fi';
import { useState, useEffect } from 'react';

const DealCard = ({ product, dealEndTime }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (!dealEndTime) return;

        const calculateTimeLeft = () => {
            const difference = new Date(dealEndTime) - new Date();

            if (difference > 0) {
                const hours = Math.floor(difference / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);

                setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
            } else {
                setTimeLeft('Expired');
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [dealEndTime]);

    const discountPercentage = product.discount || 0;
    const originalPrice = product.price / (1 - discountPercentage / 100);

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
            {/* Image Container */}
            <Link to={`/products/${product._id}`} className="block relative">
                <div className="aspect-square overflow-hidden bg-gray-100">
                    <img
                        src={product.images?.[0] || '/placeholder-product.svg'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                            e.target.src = '/placeholder-product.svg';
                        }}
                    />
                </div>

                {/* Discount Badge */}
                {discountPercentage > 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                        -{discountPercentage}%
                    </div>
                )}

                {/* Deal Timer */}
                {dealEndTime && (
                    <div className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
                        <FiClock className="w-3 h-3" />
                        {timeLeft}
                    </div>
                )}
            </Link>

            {/* Content */}
            <div className="p-4">
                <Link to={`/products/${product._id}`}>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition">
                        {product.name}
                    </h3>
                </Link>

                {/* Pricing */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl font-bold text-gray-900">
                        NRS {product.price.toFixed(2)}
                    </span>
                    {discountPercentage > 0 && (
                        <span className="text-sm text-gray-500 line-through">
                            NRS {originalPrice.toFixed(2)}
                        </span>
                    )}
                </div>

                {/* Rating */}
                {product.averageRating > 0 && (
                    <div className="flex items-center gap-1 mb-3">
                        <div className="flex text-yellow-400">
                            {'★'.repeat(Math.floor(product.averageRating))}
                            {'☆'.repeat(5 - Math.floor(product.averageRating))}
                        </div>
                        <span className="text-sm text-gray-600">
                            ({product.reviewCount || 0})
                        </span>
                    </div>
                )}

                {/* Add to Cart Button */}
                <button className="w-full bg-primary-600 text-white py-2 rounded-lg font-semibold hover:bg-primary-700 transition flex items-center justify-center gap-2">
                    <FiShoppingCart className="w-4 h-4" />
                    Add to Cart
                </button>
            </div>
        </div>
    );
};

export default DealCard;
