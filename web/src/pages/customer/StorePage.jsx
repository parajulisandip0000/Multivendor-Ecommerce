import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiMessageCircle, FiSearch } from 'react-icons/fi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { storeService } from '../../services';
import { useSelector } from 'react-redux';
import ProductCard from '../../components/ProductCard';

const StorePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((s) => s.auth);
    const requestIdRef = useRef(0);

    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
    const [filters, setFilters] = useState({ page: 1, limit: 12, sort: '-createdAt', search: '' });
    const [searchInput, setSearchInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const storeId = String(id || '').trim();

    const storeBanner = store?.banner || null;
    const storeLogo = store?.logo || null;
    const storeName = store?.name || 'Store';

    const sortOptions = useMemo(
        () => [
            { key: '-createdAt', label: 'Newest' },
            { key: '-views', label: 'Trending' },
            { key: '-reviewStats.averageRating', label: 'Top rated' },
            { key: 'price', label: 'Price: Low → High' },
            { key: '-price', label: 'Price: High → Low' },
        ],
        []
    );

    useEffect(() => {
        const load = async () => {
            if (!storeId) return;
            setLoading(true);
            setError('');
            try {
                const reqId = ++requestIdRef.current;
                const [storeRes, prodRes] = await Promise.all([
                    storeService.getStore(storeId),
                    storeService.getStoreProducts(storeId, {
                        page: filters.page,
                        limit: filters.limit,
                        sort: filters.sort,
                        search: filters.search || undefined,
                    }),
                ]);

                if (reqId !== requestIdRef.current) return;
                if (storeRes.success) setStore(storeRes.data);

                if (prodRes.success) {
                    setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
                    setPagination(prodRes.pagination || { total: 0, page: filters.page, pages: 1 });
                }
            } catch (e) {
                setError(e.response?.data?.message || 'Failed to load store');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [storeId, filters.page, filters.limit, filters.sort, filters.search]);

    const onMessageStore = () => {
        if (!isAuthenticated) return navigate('/login');
        navigate(`/chat?storeId=${storeId}`);
    };

    const onSearchSubmit = (e) => {
        e.preventDefault();
        setFilters((prev) => ({ ...prev, page: 1, search: searchInput.trim() }));
    };

    const changePage = (page) => setFilters((prev) => ({ ...prev, page }));

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="space-y-6">
                        <div className="h-56 md:h-72 rounded-2xl bg-gray-200 animate-pulse" />
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                            <div className="mt-3 h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl border border-gray-200 h-72 animate-pulse" />
                            ))}
                        </div>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
                        <div className="text-xl font-semibold text-gray-900">Unable to load store</div>
                        <div className="text-gray-600 mt-2">{error}</div>
                        <div className="mt-6">
                            <Link to="/products" className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition">
                                Browse products
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Store hero */}
                        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white mb-6">
                            <div className="h-56 md:h-72 bg-gradient-to-br from-primary-600 via-indigo-500 to-secondary-500">
                                {storeBanner ? (
                                    <img src={storeBanner} alt={storeName} className="w-full h-full object-cover" />
                                ) : null}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                            </div>
                            <div className="absolute left-6 bottom-6 right-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                                <div className="flex items-end gap-4">
                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/95 border border-white/30 overflow-hidden shadow-lg shrink-0">
                                        {storeLogo ? (
                                            <img src={storeLogo} alt={`${storeName} logo`} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-900 font-bold text-2xl">
                                                {storeName.trim().charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="inline-block rounded-2xl bg-black/35 backdrop-blur-md border border-white/15 px-4 py-3 shadow-lg">
                                            <h1 className="text-3xl md:text-4xl font-extrabold text-white truncate">{storeName}</h1>
                                            <p className="mt-1 text-white/90 line-clamp-2 max-w-2xl">{store?.description || ''}</p>
                                            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/15 text-white backdrop-blur-sm">
                                                    Products: {pagination?.total || products.length || 0}
                                                </span>
                                                {store?.settings?.freeShippingThreshold > 0 ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/15 text-white backdrop-blur-sm">
                                                        Free shipping above NRS {Number(store.settings.freeShippingThreshold).toLocaleString()}
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={onMessageStore}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-gray-900 font-semibold hover:bg-gray-100 transition"
                                    >
                                        <FiMessageCircle className="w-4 h-4" />
                                        Message store
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Products</h2>
                                    <p className="text-sm text-gray-500 mt-1">Explore all items from {storeName}</p>
                                </div>
                                <form onSubmit={onSearchSubmit} className="flex items-center gap-2 w-full md:max-w-xl">
                                    <div className="relative w-full">
                                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            value={searchInput}
                                            onChange={(e) => setSearchInput(e.target.value)}
                                            placeholder="Search in this store…"
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                        />
                                    </div>
                                    <select
                                        value={filters.sort}
                                        onChange={(e) => setFilters((prev) => ({ ...prev, page: 1, sort: e.target.value }))}
                                        className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
                                    >
                                        {sortOptions.map((opt) => (
                                            <option key={opt.key} value={opt.key}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                    <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                                        Search
                                    </button>
                                </form>
                            </div>
                        </div>

                        {products.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
                                <div className="text-xl font-semibold text-gray-900">No products found</div>
                                <div className="text-gray-600 mt-2">Try a different search or come back later.</div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {products.map((product) => (
                                    <ProductCard key={product._id} product={product} size="md" actionButtons="cart" />
                                ))}
                            </div>
                        )}

                        {!loading && pagination.pages > 1 ? (
                            <div className="flex items-center justify-between gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => changePage(Math.max(1, pagination.page - 1))}
                                    disabled={pagination.page <= 1}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FiChevronLeft />
                                    Prev
                                </button>

                                <div className="text-sm text-gray-600">
                                    Page <span className="font-semibold text-gray-900">{pagination.page}</span> of{' '}
                                    <span className="font-semibold text-gray-900">{pagination.pages}</span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => changePage(Math.min(pagination.pages, pagination.page + 1))}
                                    disabled={pagination.page >= pagination.pages}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                    <FiChevronRight />
                                </button>
                            </div>
                        ) : null}
                    </>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default StorePage;
