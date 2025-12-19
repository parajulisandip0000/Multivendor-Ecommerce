import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';
import ProductCarousel from '../../components/ProductCarousel';
import DealCard from '../../components/DealCard';
import { FiTrendingUp, FiShoppingBag, FiUsers, FiAward, FiTag, FiClock, FiSmartphone, FiHome, FiTarget, FiBook, FiGrid, FiHeart, FiPackage, FiGift, FiUser, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// Hero Slider Component
const HeroSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            title: 'Discover Amazing Products',
            subtitle: 'Shop from thousands of verified sellers. Quality products, competitive prices, fast delivery.',
            gradient: 'from-primary-600 via-primary-500 to-secondary-500',
            cta1: { text: 'Start Shopping', link: '/products' },
            cta2: { text: 'Become a Seller', link: '/register' }
        },
        {
            title: 'Exclusive Deals & Offers',
            subtitle: 'Save big on your favorite brands. Limited time offers on electronics, fashion, and more.',
            gradient: 'from-purple-600 via-pink-500 to-red-500',
            cta1: { text: 'View Deals', link: '/products?sort=deals' },
            cta2: { text: 'Shop Now', link: '/products' }
        },
        {
            title: 'Join Our Seller Community',
            subtitle: 'Start your online business today. Easy setup, powerful tools, and dedicated support.',
            gradient: 'from-green-600 via-teal-500 to-blue-500',
            cta1: { text: 'Register Store', link: '/register' },
            cta2: { text: 'Learn More', link: '/about' }
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % 3); // 3 slides
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    return (
        <section className="relative overflow-hidden">
            <div className="relative h-[500px] md:h-[600px]">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-all duration-700 ease-in-out ${index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
                            }`}
                    >
                        <div className={`h-full bg-gradient-to-br ${slide.gradient} text-white py-20`}>
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
                                <div className="max-w-2xl">
                                    <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight animate-fadeIn">
                                        {slide.title}
                                    </h1>
                                    <p className="text-xl mb-8 text-white/90 animate-fadeIn">
                                        {slide.subtitle}
                                    </p>
                                    <div className="flex flex-wrap gap-4 animate-fadeIn">
                                        <Link
                                            to={slide.cta1.link}
                                            className="bg-white text-gray-900 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition shadow-lg"
                                        >
                                            {slide.cta1.text}
                                        </Link>
                                        <Link
                                            to={slide.cta2.link}
                                            className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-gray-900 transition"
                                        >
                                            {slide.cta2.text}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition z-10"
                aria-label="Previous slide"
            >
                <FiChevronLeft className="w-6 h-6" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition z-10"
                aria-label="Next slide"
            >
                <FiChevronRight className="w-6 h-6" />
            </button>

            {/* Dots Navigation */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
};

const HomePage = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [trendingProducts, setTrendingProducts] = useState([]);
    const [newArrivals, setNewArrivals] = useState([]);
    const [dealsProducts, setDealsProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllProducts();
    }, []);

    const fetchAllProducts = async () => {
        try {
            const [featured, trending, newItems, deals] = await Promise.all([
                productService.getProducts({ limit: 8, sort: '-createdAt' }),
                productService.getProducts({ limit: 12, sort: '-averageRating' }),
                productService.getProducts({ limit: 12, sort: '-createdAt' }),
                productService.getProducts({ limit: 6, sort: '-discount' })
            ]);

            setFeaturedProducts(featured.data || []);
            setTrendingProducts(trending.data || []);
            setNewArrivals(newItems.data || []);
            setDealsProducts(deals.data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        { name: 'Electronics', icon: FiSmartphone, color: 'bg-slate-100 hover:bg-slate-200', textColor: 'text-slate-700' },
        { name: 'Fashion', icon: FiShoppingBag, color: 'bg-slate-100 hover:bg-slate-200', textColor: 'text-slate-700' },
        { name: 'Home & Garden', icon: FiHome, color: 'bg-slate-100 hover:bg-slate-200', textColor: 'text-slate-700' },
        { name: 'Sports', icon: FiTarget, color: 'bg-slate-100 hover:bg-slate-200', textColor: 'text-slate-700' },
        { name: 'Books', icon: FiBook, color: 'bg-slate-100 hover:bg-slate-200', textColor: 'text-slate-700' },
        { name: 'Toys & Games', icon: FiGrid, color: 'bg-slate-100 hover:bg-slate-200', textColor: 'text-slate-700' },
        { name: 'Health & Beauty', icon: FiHeart, color: 'bg-slate-100 hover:bg-slate-200', textColor: 'text-slate-700' },
        { name: 'More', icon: FiPackage, color: 'bg-slate-100 hover:bg-slate-200', textColor: 'text-slate-700' },
    ];



    const stats = [
        { icon: FiShoppingBag, label: 'Products', value: '10,000+' },
        { icon: FiUsers, label: 'Customers', value: '50,000+' },
        { icon: FiAward, label: 'Verified Sellers', value: '500+' },
        { icon: FiTrendingUp, label: 'Daily Orders', value: '1,000+' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Hero Slider Section */}
            <HeroSlider />

            {/* Stats Section */}
            <section className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <stat.icon className="w-12 h-12 mx-auto mb-3 text-primary-600" />
                                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                                <div className="text-gray-600">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            {/* Trending Products Carousel */}
            {!loading && trendingProducts.length > 0 && (
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <ProductCarousel
                            title="Trending Now"
                            products={trendingProducts}
                            viewAllLink="/products?sort=trending"
                        />
                    </div>
                </section>
            )}

            {/* Categories Section */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                        Shop by Category
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {categories.map((category, index) => (
                            <Link
                                key={index}
                                to={`/products?category=${category.name}`}
                                className="group"
                            >
                                <div className={`${category.color} ${category.textColor} rounded-xl p-8 text-center shadow-sm border border-gray-200 transition-all duration-300`}>
                                    <category.icon className="w-12 h-12 mx-auto mb-4" />
                                    <h3 className="font-semibold text-base">{category.name}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* New Arrivals Carousel */}
            {!loading && newArrivals.length > 0 && (
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <ProductCarousel
                            title="New Arrivals"
                            products={newArrivals}
                            viewAllLink="/products?sort=newest"
                        />
                    </div>
                </section>
            )}

            {/* Featured Products */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
                        <Link
                            to="/products"
                            className="text-primary-600 hover:text-primary-700 font-semibold"
                        >
                            View All →
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-gray-200 rounded-xl h-96 animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {featuredProducts.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold mb-6">Ready to Start Selling?</h2>
                    <p className="text-xl mb-8 text-blue-100">
                        Join thousands of successful sellers on our platform. Easy setup, powerful tools, and dedicated support.
                    </p>
                    <Link
                        to="/register"
                        className="inline-block bg-white text-primary-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition shadow-lg"
                    >
                        Register Your Store
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default HomePage;
