import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { superAdminService } from '../../services';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import { FiSearch, FiTrash2, FiBox, FiAlertTriangle } from 'react-icons/fi';
import { toast } from 'react-toastify';

const AdminProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, [page, search]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await superAdminService.getAllProducts({ page, limit: 10, search });
            if (response.success) {
                setProducts(response.data);
                setTotalPages(response.pagination.pages);
            }
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (productId) => {
        if (!window.confirm('Are you sure you want to force delete this product? This action cannot be undone.')) return;

        try {
            setActionLoading(productId);
            await superAdminService.deleteProduct(productId);
            toast.success('Product deleted successfully');
            setProducts(products.filter(p => p._id !== productId));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete product');
        } finally {
            setActionLoading(null);
        }
    };

    const [selectedProduct, setSelectedProduct] = useState(null);

    return (
        <SuperAdminLayout>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
                    <p className="text-gray-500">Oversee all products listed on the platform.</p>
                </div>
                <div className="relative w-full md:w-64">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                                <th className="px-6 py-3 font-semibold">Product</th>
                                <th className="px-6 py-3 font-semibold">Store</th>
                                <th className="px-6 py-3 font-semibold">Price</th>
                                <th className="px-6 py-3 font-semibold">Stock</th>
                                <th className="px-6 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-400">Loading products...</td>
                                </tr>
                            ) : products.length > 0 ? (
                                products.map((product) => (
                                    <tr key={product._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200 overflow-hidden">
                                                    {product.images?.[0] ?
                                                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                                        : <FiBox />
                                                    }
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 truncate max-w-[200px]">{product.name}</p>
                                                    <p className="text-xs text-gray-500 capitalize">{product.category}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {product.store?.name || 'Unknown Store'}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            Rs. {product.price?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full
                                                ${product.stock > 10 ? 'bg-green-100 text-green-700' :
                                                    product.stock > 0 ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'}`}>
                                                {product.stock} in stock
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedProduct(product)}
                                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <FiBox />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product._id)}
                                                    disabled={actionLoading === product._id}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Force Delete"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">No products found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex justify-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="px-3 py-1">Page {page} of {totalPages}</span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Product Detail Modal */}
            {selectedProduct && createPortal(
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
                            <h3 className="text-xl font-bold text-gray-900">Product Details</h3>
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-6">
                            <div className="flex gap-4">
                                <div className="w-32 h-32 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200 flex-shrink-0 overflow-hidden">
                                    {selectedProduct.images?.[0] ?
                                        <img src={selectedProduct.images[0]} alt={selectedProduct.name} className="w-full h-full object-cover" />
                                        : <FiBox className="w-10 h-10 text-gray-400" />
                                    }
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-xl font-bold text-gray-900">{selectedProduct.name}</h4>
                                    <p className="text-sm text-gray-500 mb-2">{selectedProduct.category}</p>
                                    <p className="text-gray-600 mb-4">{selectedProduct.description || 'No description provided.'}</p>
                                    <div className="flex gap-2 text-sm">
                                        <span className="bg-gray-100 px-2 py-1 rounded">Brand: {selectedProduct.brand || 'N/A'}</span>
                                        <span className="bg-gray-100 px-2 py-1 rounded">Stock: {selectedProduct.stock}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h5 className="font-semibold text-gray-900 mb-2 text-sm uppercase">Pricing</h5>
                                    <div className="space-y-1 text-sm">
                                        <p className="text-2xl font-bold text-primary-600">Rs. {selectedProduct.price?.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h5 className="font-semibold text-gray-900 mb-2 text-sm uppercase">Store Info</h5>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="text-gray-500">Store:</span> {selectedProduct.store?.name || 'Unknown'}</p>
                                        <p><span className="text-gray-500">Store ID:</span> <span className="font-mono text-xs">{selectedProduct.store?._id || selectedProduct.store}</span></p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h5 className="font-semibold text-gray-900 mb-2">Attributes</h5>
                                <div className="flex flex-wrap gap-2">
                                    {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                                        <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-sm">
                                            <span className="text-gray-500">Colors:</span>
                                            {selectedProduct.colors.join(', ')}
                                        </div>
                                    )}
                                    {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                                        <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-sm">
                                            <span className="text-gray-500">Sizes:</span>
                                            {selectedProduct.sizes.join(', ')}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400">Product ID: {selectedProduct._id}</p>
                                <p className="text-xs text-gray-400">Created: {new Date(selectedProduct.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </SuperAdminLayout>
    );
};

export default AdminProductsPage;
