import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiGift, FiSearch, FiTag, FiTruck, FiX } from 'react-icons/fi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';
import { productService } from '../../services';

const CATEGORY_OPTIONS = [
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Sports & Outdoors',
    'Books',
    'Toys & Games',
    'Health & Beauty',
    'Food & Beverages',
    'Automotive',
    'Other',
];

const SORT_OPTIONS = [
    { key: 'newest', label: 'Newest' },
    { key: 'trending', label: 'Trending' },
    { key: 'top_rated', label: 'Top rated' },
    { key: 'price_asc', label: 'Price: Low → High' },
    { key: 'price_desc', label: 'Price: High → Low' },
];

const normalizePositiveInt = (value, fallback) => {
    const n = Number.parseInt(String(value || ''), 10);
    if (!Number.isFinite(n) || n <= 0) return fallback;
    return n;
};

const clampNumber = (value, min, max) => Math.max(min, Math.min(max, value));

const toBackendSort = (sortKey) => {
    const raw = String(sortKey || '').trim();
    if (!raw) return '-createdAt';

    if (raw.startsWith('-') || raw === 'createdAt' || raw === 'price' || raw === 'views' || raw === 'sales') return raw;
    if (raw === 'newest') return '-createdAt';
    if (raw === 'trending') return '-views';
    if (raw === 'top_rated') return '-reviewStats.averageRating';
    if (raw === 'price_asc') return 'price';
    if (raw === 'price_desc') return '-price';
    if (raw === 'deals') return '-createdAt';

    return '-createdAt';
};

const ProductListPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const requestIdRef = useRef(0);

    const [priceBounds, setPriceBounds] = useState({ min: 0, max: 100000 });
    const sliderMin = priceBounds.min;
    const sliderMax = priceBounds.max;

    const urlFilters = useMemo(() => {
        const page = normalizePositiveInt(searchParams.get('page'), 1);
        const limit = normalizePositiveInt(searchParams.get('limit'), 12);
        const category = (searchParams.get('category') || '').trim();
        const sortKey = (searchParams.get('sort') || 'newest').trim();
        const search = (searchParams.get('search') || '').trim();
        const minPrice = (searchParams.get('minPrice') || '').trim();
        const maxPrice = (searchParams.get('maxPrice') || '').trim();

        return { page, limit, category, sortKey, search, minPrice, maxPrice };
    }, [searchParams]);

    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: urlFilters.page, pages: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchInput, setSearchInput] = useState(urlFilters.search);
    const [minPriceSlider, setMinPriceSlider] = useState(priceBounds.min);
    const [maxPriceSlider, setMaxPriceSlider] = useState(priceBounds.max);

    const shopPromos = [
        {
            title: 'Limited-time offers',
            subtitle: 'Save more today',
            icon: FiTag,
            gradient: 'from-rose-600 to-pink-500',
            to: '/products?sort=deals',
        },
        {
            title: 'Fast delivery picks',
            subtitle: 'Shop popular items',
            icon: FiTruck,
            gradient: 'from-sky-600 to-cyan-500',
            to: '/products?sort=trending',
        },
        {
            title: 'Gift ideas',
            subtitle: 'Curated collections',
            icon: FiGift,
            gradient: 'from-purple-600 to-fuchsia-500',
            to: '/products',
        },
    ];

    useEffect(() => {
        const loadMaxPrice = async () => {
            try {
                const res = await productService.getProducts({ limit: 1, sort: '-price' });
                const items = Array.isArray(res?.data) ? res.data : [];
                const top = items[0];
                const max = typeof top?.price === 'number' ? top.price : Number.parseFloat(top?.price);
                if (!Number.isFinite(max) || max <= 0) return;
                setPriceBounds((prev) => {
                    const safeMax = Math.max(prev.min, max);
                    return { ...prev, max: safeMax };
                });
            } catch {
                // ignore; keep defaults
            }
        };

        loadMaxPrice();
    }, []);

    useEffect(() => {
        setSearchInput(urlFilters.search);

        const nMin = Number.parseFloat(urlFilters.minPrice);
        const nMax = Number.parseFloat(urlFilters.maxPrice);
        setMinPriceSlider(Number.isFinite(nMin) ? clampNumber(nMin, priceBounds.min, priceBounds.max) : priceBounds.min);
        setMaxPriceSlider(Number.isFinite(nMax) ? clampNumber(nMax, priceBounds.min, priceBounds.max) : priceBounds.max);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [priceBounds.max, priceBounds.min, urlFilters.maxPrice, urlFilters.minPrice, urlFilters.search]);

    const updateQuery = (patch, { resetPage = false } = {}) => {
        const next = new URLSearchParams(searchParams);

        Object.entries(patch).forEach(([key, value]) => {
            const v = value === null || value === undefined ? '' : String(value);
            if (!v.trim()) next.delete(key);
            else next.set(key, v);
        });

        if (resetPage) next.delete('page');
        setSearchParams(next, { replace: false });
    };

    useEffect(() => {
        const nextValue = searchInput.trim();
        if (nextValue === urlFilters.search) return;

        const timer = setTimeout(() => updateQuery({ search: nextValue || null }, { resetPage: true }), 300);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchInput, urlFilters.search]);

    useEffect(() => {
        const safeMin = clampNumber(minPriceSlider, priceBounds.min, priceBounds.max);
        const safeMax = clampNumber(maxPriceSlider, priceBounds.min, priceBounds.max);
        const effectiveMin = Math.min(safeMin, safeMax);
        const effectiveMax = Math.max(safeMin, safeMax);

        const nextMin = effectiveMin <= priceBounds.min ? '' : String(Math.round(effectiveMin));
        const nextMax = effectiveMax >= priceBounds.max ? '' : String(Math.round(effectiveMax));

        if (nextMin === urlFilters.minPrice && nextMax === urlFilters.maxPrice) return;

        const timer = setTimeout(() => {
            updateQuery(
                {
                    minPrice: nextMin || null,
                    maxPrice: nextMax || null,
                },
                { resetPage: true }
            );
        }, 250);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [maxPriceSlider, minPriceSlider, priceBounds.max, priceBounds.min, urlFilters.maxPrice, urlFilters.minPrice]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError('');
            const requestId = ++requestIdRef.current;

            try {
                const params = {
                    page: urlFilters.page,
                    limit: urlFilters.limit,
                    sort: toBackendSort(urlFilters.sortKey),
                };

                if (urlFilters.category) params.category = urlFilters.category;
                if (urlFilters.search) params.search = urlFilters.search;
                if (urlFilters.minPrice) params.minPrice = urlFilters.minPrice;
                if (urlFilters.maxPrice) params.maxPrice = urlFilters.maxPrice;

                const res = await productService.getProducts(params);
                if (requestIdRef.current !== requestId) return;

                const items = Array.isArray(res?.data) ? res.data : [];
                const pg = res?.pagination || { total: items.length, page: urlFilters.page, pages: 1 };

                setProducts(items);
                setPagination({
                    total: typeof pg.total === 'number' ? pg.total : items.length,
                    page: typeof pg.page === 'number' ? pg.page : urlFilters.page,
                    pages: typeof pg.pages === 'number' ? pg.pages : 1,
                });
            } catch (e) {
                if (requestIdRef.current !== requestId) return;
                setProducts([]);
                setPagination({ total: 0, page: urlFilters.page, pages: 1 });
                setError(e?.response?.data?.message || 'Failed to load products');
            } finally {
                if (requestIdRef.current === requestId) setLoading(false);
            }
        };

        fetchProducts();
    }, [urlFilters.category, urlFilters.limit, urlFilters.maxPrice, urlFilters.minPrice, urlFilters.page, urlFilters.search, urlFilters.sortKey]);

    const hasActiveFilters = Boolean(
        urlFilters.search ||
        urlFilters.category ||
        urlFilters.minPrice ||
        urlFilters.maxPrice ||
        (urlFilters.sortKey && urlFilters.sortKey !== 'newest')
    );

    const sliderRange = sliderMax - sliderMin;
    const effectiveMinForUi = Math.min(minPriceSlider, maxPriceSlider);
    const effectiveMaxForUi = Math.max(minPriceSlider, maxPriceSlider);
    const minPct = sliderRange === 0 ? 0 : ((effectiveMinForUi - sliderMin) / sliderRange) * 100;
    const maxPct = sliderRange === 0 ? 100 : ((effectiveMaxForUi - sliderMin) / sliderRange) * 100;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-6">
                    <aside className="lg:w-80 shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 lg:sticky lg:top-20">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="text-xl font-bold text-gray-900">Filters</div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        {loading ? 'Loading...' : `${pagination.total.toLocaleString()} item${pagination.total === 1 ? '' : 's'}`}
                                    </div>
                                </div>
                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchInput('');
                                            setMinPriceSlider(sliderMin);
                                            setMaxPriceSlider(sliderMax);
                                            setSearchParams(new URLSearchParams(), { replace: false });
                                        }}
                                        className="px-3 py-1.5 rounded-full border border-gray-200 text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>

                            <div className="mt-5 flex flex-col gap-6">
                                <div>
                                    <div className="text-sm font-semibold text-gray-900">Search</div>
                                    <div className="relative mt-2">
                                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            value={searchInput}
                                            onChange={(e) => setSearchInput(e.target.value)}
                                            placeholder="Search products..."
                                            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                        {searchInput.trim().length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setSearchInput('')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                aria-label="Clear search"
                                            >
                                                <FiX />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-semibold text-gray-900">Price range</div>
                                    </div>
                                    <div className="mt-1 text-xs text-gray-600">
                                        NRS {sliderMin.toLocaleString()} – {sliderMax.toLocaleString()}
                                    </div>

                                    <div className="mt-3">
                                        <div
                                            className="relative h-9 flex items-center"
                                            style={{
                                                '--range-bg': `linear-gradient(to right, #e5e7eb ${minPct}%, #0284c7 ${minPct}%, #0284c7 ${maxPct}%, #e5e7eb ${maxPct}%)`,
                                            }}
                                        >
                                            <div className="absolute left-0 right-0 h-1.5 rounded-full" style={{ background: 'var(--range-bg)' }} />
                                            <input
                                                type="range"
                                                min={sliderMin}
                                                max={sliderMax}
                                                value={effectiveMinForUi}
                                                onChange={(e) => {
                                                    const n = Number.parseInt(e.target.value, 10);
                                                    const next = clampNumber(Number.isFinite(n) ? n : sliderMin, sliderMin, sliderMax);
                                                    setMinPriceSlider(Math.min(next, effectiveMaxForUi));
                                                }}
                                                className="absolute left-0 right-0 w-full h-9 bg-transparent appearance-none cursor-pointer"
                                                style={{ WebkitAppearance: 'none' }}
                                                aria-label="Minimum price"
                                            />
                                            <input
                                                type="range"
                                                min={sliderMin}
                                                max={sliderMax}
                                                value={effectiveMaxForUi}
                                                onChange={(e) => {
                                                    const n = Number.parseInt(e.target.value, 10);
                                                    const next = clampNumber(Number.isFinite(n) ? n : sliderMax, sliderMin, sliderMax);
                                                    setMaxPriceSlider(Math.max(next, effectiveMinForUi));
                                                }}
                                                className="absolute left-0 right-0 w-full h-9 bg-transparent appearance-none cursor-pointer"
                                                style={{ WebkitAppearance: 'none' }}
                                                aria-label="Maximum price"
                                            />
                                        </div>

                                        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                                            <span>NRS {sliderMin.toLocaleString()}</span>
                                            <span>NRS {sliderMax.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm font-semibold text-gray-900">Sort</div>
                                    <select
                                        value={urlFilters.sortKey || 'newest'}
                                        onChange={(e) => updateQuery({ sort: e.target.value || null }, { resetPage: true })}
                                        className="mt-2 w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        aria-label="Sort products"
                                    >
                                        {SORT_OPTIONS.map((opt) => (
                                            <option key={opt.key} value={opt.key}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <div className="text-sm font-semibold text-gray-900">Category</div>
                                    <div className="mt-2 flex flex-col gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => updateQuery({ category: null }, { resetPage: true })}
                                            className={`w-full text-left px-3 py-2 rounded-xl border transition ${
                                                !urlFilters.category
                                                    ? 'bg-gray-900 text-white border-gray-900'
                                                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            All
                                        </button>
                                        {CATEGORY_OPTIONS.map((c) => {
                                            const active = urlFilters.category === c;
                                            return (
                                                <button
                                                    key={c}
                                                    type="button"
                                                    onClick={() => updateQuery({ category: c }, { resetPage: true })}
                                                    className={`w-full text-left px-3 py-2 rounded-xl border transition ${
                                                        active
                                                            ? 'bg-primary-600 text-white border-primary-600'
                                                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {c}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {error && (
                                    <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                                        {error}
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>

                    <section className="flex-1 min-w-0">
                        <div className="mb-4">
                            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                {loading ? 'Loading products...' : `${pagination.total.toLocaleString()} item${pagination.total === 1 ? '' : 's'}`}
                            </p>
                        </div>

                        <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {shopPromos.map((p) => (
                                <Link
                                    key={p.title}
                                    to={p.to}
                                    className={`group rounded-2xl bg-gradient-to-r ${p.gradient} text-white p-4 shadow-sm hover:shadow-md transition`}
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="min-w-0">
                                            <div className="font-bold">{p.title}</div>
                                            <div className="text-sm text-white/90 mt-1">{p.subtitle}</div>
                                            <div className="text-sm font-semibold mt-3 inline-flex items-center gap-2">
                                                Explore <span aria-hidden="true">›</span>
                                            </div>
                                        </div>
                                        <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                                            <p.icon className="w-5 h-5" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-xl border border-gray-200 h-72 animate-pulse" />
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                                {products.map((product) => (
                                    <ProductCard key={product._id} product={product} size="sm" actionButtons="cart" />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
                                <div className="text-xl font-semibold text-gray-900">No products found</div>
                                <div className="text-gray-600 mt-2">Try changing your search or filters.</div>
                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchParams(new URLSearchParams(), { replace: false })}
                                        className="mt-6 inline-flex items-center justify-center px-6 py-3 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition"
                                    >
                                        Reset filters
                                    </button>
                                )}
                            </div>
                        )}

                        {!loading && pagination.pages > 1 && (
                            <div className="flex items-center justify-between gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => updateQuery({ page: Math.max(1, urlFilters.page - 1) })}
                                    disabled={urlFilters.page <= 1}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FiChevronLeft />
                                    Prev
                                </button>

                                <div className="text-sm text-gray-600">
                                    Page <span className="font-semibold text-gray-900">{urlFilters.page}</span> of{' '}
                                    <span className="font-semibold text-gray-900">{pagination.pages}</span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => updateQuery({ page: Math.min(pagination.pages, urlFilters.page + 1) })}
                                    disabled={urlFilters.page >= pagination.pages}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                    <FiChevronRight />
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ProductListPage;
