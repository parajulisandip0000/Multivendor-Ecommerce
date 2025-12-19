import { useState, useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ProductCard from './ProductCard';

const ProductCarousel = ({ title, products, viewAllLink }) => {
    const scrollContainerRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const scroll = (direction) => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const scrollAmount = container.offsetWidth * 0.8;
        const newScrollLeft = direction === 'left'
            ? container.scrollLeft - scrollAmount
            : container.scrollLeft + scrollAmount;

        container.scrollTo({
            left: newScrollLeft,
            behavior: 'smooth'
        });

        // Update arrow visibility
        setTimeout(() => {
            setShowLeftArrow(container.scrollLeft > 10);
            setShowRightArrow(
                container.scrollLeft < container.scrollWidth - container.offsetWidth - 10
            );
        }, 300);
    };

    return (
        <div className="relative group">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                {viewAllLink && (
                    <a
                        href={viewAllLink}
                        className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
                    >
                        See all →
                    </a>
                )}
            </div>

            {/* Carousel Container */}
            <div className="relative">
                {/* Left Arrow */}
                {showLeftArrow && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100 transition opacity-0 group-hover:opacity-100"
                        aria-label="Scroll left"
                    >
                        <FiChevronLeft className="w-6 h-6 text-gray-700" />
                    </button>
                )}

                {/* Products Container */}
                <div
                    ref={scrollContainerRef}
                    className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {products.map((product) => (
                        <div key={product._id} className="flex-none w-64">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>

                {/* Right Arrow */}
                {showRightArrow && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100 transition opacity-0 group-hover:opacity-100"
                        aria-label="Scroll right"
                    >
                        <FiChevronRight className="w-6 h-6 text-gray-700" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProductCarousel;
