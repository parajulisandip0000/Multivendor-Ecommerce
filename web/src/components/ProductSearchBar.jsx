import { useEffect, useRef, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services';

const getProductThumbUrl = (product) => {
    if (!product) return null;
    return (
        product.thumbnail?.url ||
        product.images?.find((img) => img?.isDefault)?.url ||
        product.images?.[0]?.url ||
        null
    );
};

const ProductSearchBar = ({ inputClassName = '', containerClassName = '' }) => {
    const navigate = useNavigate();
    const rootRef = useRef(null);
    const lastRequestIdRef = useRef(0);

    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const onMouseDown = (event) => {
            if (!rootRef.current) return;
            if (!rootRef.current.contains(event.target)) {
                setIsOpen(false);
                setActiveIndex(-1);
            }
        };

        document.addEventListener('mousedown', onMouseDown);
        return () => document.removeEventListener('mousedown', onMouseDown);
    }, []);

    useEffect(() => {
        const q = query.trim();

        if (q.length < 1) {
            setSuggestions([]);
            setIsOpen(false);
            setActiveIndex(-1);
            setIsLoading(false);
            return;
        }

        const requestId = ++lastRequestIdRef.current;
        setIsLoading(true);

        const timer = setTimeout(async () => {
            try {
                const response = await productService.getProducts({ search: q, limit: 5 });
                const items = Array.isArray(response?.data) ? response.data : [];

                if (lastRequestIdRef.current !== requestId) return;
                setSuggestions(items.slice(0, 5));
                setIsOpen(true);
                setActiveIndex(-1);
            } catch {
                if (lastRequestIdRef.current !== requestId) return;
                setSuggestions([]);
                setIsOpen(true);
                setActiveIndex(-1);
            } finally {
                if (lastRequestIdRef.current === requestId) {
                    setIsLoading(false);
                }
            }
        }, 250);

        return () => clearTimeout(timer);
    }, [query]);

    const selectProduct = (product) => {
        if (!product?._id) return;
        setIsOpen(false);
        setActiveIndex(-1);
        setQuery('');
        navigate(`/products/${product._id}`);
    };

    const onKeyDown = (event) => {
        if (!isOpen || suggestions.length === 0) {
            if (event.key === 'Escape') setIsOpen(false);
            return;
        }

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((prev) => Math.max(prev - 1, 0));
        } else if (event.key === 'Enter') {
            if (activeIndex >= 0 && activeIndex < suggestions.length) {
                event.preventDefault();
                selectProduct(suggestions[activeIndex]);
            }
        } else if (event.key === 'Escape') {
            setIsOpen(false);
            setActiveIndex(-1);
        }
    };

    return (
        <div ref={rootRef} className={`relative w-full ${containerClassName}`}>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                    if (query.trim().length >= 1) setIsOpen(true);
                }}
                onKeyDown={onKeyDown}
                placeholder="Search products..."
                autoComplete="off"
                className={inputClassName}
                aria-label="Search products"
                aria-autocomplete="list"
                aria-expanded={isOpen}
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />

            {isOpen && query.trim().length >= 1 && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
                    {suggestions.length > 0 ? (
                        <ul className="max-h-80 overflow-auto">
                            {suggestions.map((product, index) => {
                                const thumbUrl = getProductThumbUrl(product);
                                const isActive = index === activeIndex;

                                return (
                                    <li key={product._id || index}>
                                        <button
                                            type="button"
                                            className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 ${isActive ? 'bg-gray-50' : ''
                                                }`}
                                            onMouseEnter={() => setActiveIndex(index)}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                selectProduct(product);
                                            }}
                                        >
                                            <div className="w-10 h-10 rounded-md bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                                                {thumbUrl ? (
                                                    <img
                                                        src={thumbUrl}
                                                        alt={product?.name || 'Product'}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <FiSearch className="text-gray-300" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-medium text-gray-900 truncate">
                                                    {product?.name || 'Unnamed product'}
                                                </div>
                                                <div className="text-sm text-gray-500 truncate">
                                                    {product?.store?.name ? product.store.name : product?.category || ''}
                                                    {typeof product?.price === 'number' ? ` - ${product.price}` : ''}
                                                </div>
                                            </div>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="px-4 py-3 text-sm text-gray-500">
                            {isLoading ? 'Loading...' : 'No products found'}
                        </div>
                    )}
                </div>
            )}

            {isLoading && query.trim().length >= 1 && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    Loading...
                </div>
            )}
        </div>
    );
};

export default ProductSearchBar;
