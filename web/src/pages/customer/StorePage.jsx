import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { storeService } from '../../services';
import { useSelector } from 'react-redux';

const StorePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((s) => s.auth);
    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const storeRes = await storeService.getStore(id);
                if (storeRes.success) setStore(storeRes.data);

                const prodRes = await storeService.getStoreProducts(id, { limit: 12 });
                if (prodRes.success) setProducts(prodRes.data);
            } catch (e) {
                setError(e.response?.data?.message || 'Failed to load store');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const onMessageStore = () => {
        if (!isAuthenticated) return navigate('/login');
        navigate(`/chat?storeId=${id}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="text-gray-500">Loading store...</div>
                ) : error ? (
                    <div className="text-red-600">{error}</div>
                ) : (
                    <>
                        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{store?.name}</h1>
                                <p className="text-gray-600 mt-2">{store?.description}</p>
                            </div>
                            <button
                                type="button"
                                onClick={onMessageStore}
                                className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
                            >
                                Message Store
                            </button>
                        </div>

                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">Products</h2>
                            <Link to="/products" className="text-primary-600 hover:underline text-sm">
                                Browse all products
                            </Link>
                        </div>

                        {products.length === 0 ? (
                            <div className="text-gray-500">No products available.</div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {products.map((p) => (
                                    <Link
                                        key={p._id}
                                        to={`/products/${p._id}`}
                                        className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow"
                                    >
                                        <div className="font-semibold text-gray-900 line-clamp-1">{p.name}</div>
                                        <div className="text-sm text-gray-600 line-clamp-2 mt-1">{p.description}</div>
                                        <div className="mt-3 font-bold text-gray-900">Rs. {p.price?.toLocaleString?.() ?? p.price}</div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default StorePage;

