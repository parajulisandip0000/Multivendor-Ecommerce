import { useState, useEffect } from 'react';
import { storeManagerService } from '../../services';
import StoreManagerLayout from '../../components/StoreManagerLayout';
import ProductForm from '../../components/ProductForm';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiX, FiEye, FiBox } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { getPrimaryProductImageUrl, getFileIdFromImage, resolveFileUrl } from '../../utils/media';

const ProductManagementPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list', 'create', 'edit', 'detail'
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [detailImageSrc, setDetailImageSrc] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchProducts();
    }, [page]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await storeManagerService.getProducts({ page, limit: 10 });
            setProducts(response.data);
            if (response.pagination) {
                setTotalPages(response.pagination.pages);
            }
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (formData) => {
        try {
            await storeManagerService.createProduct(formData);
            toast.success('Product created successfully');
            setViewMode('list');
            fetchProducts();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create product');
        }
    };

    const handleUpdate = async (formData) => {
        try {
            await storeManagerService.updateProduct(selectedProduct._id, formData);
            toast.success('Product updated successfully');
            setViewMode('list');
            setSelectedProduct(null);
            fetchProducts();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update product');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await storeManagerService.deleteProduct(id);
                toast.success('Product deleted successfully');
                fetchProducts();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to delete product');
            }
        }
    };

    const startEdit = (product) => {
        setSelectedProduct(product);
        setViewMode('edit');
    };

    const startDetail = (product) => {
        setSelectedProduct(product);
        setDetailImageSrc(getPrimaryProductImageUrl(product));
        setViewMode('detail');
    };

    const deleteExistingImage = async (img) => {
        const fileId = getFileIdFromImage(img);
        if (!fileId || !selectedProduct?._id) throw new Error('Missing image id');

        const response = await storeManagerService.deleteProductImage(selectedProduct._id, fileId);
        setSelectedProduct(response.data.product);
        setProducts((prev) => prev.map((p) => (p._id === response.data.product._id ? response.data.product : p)));

        const nextPrimary = getPrimaryProductImageUrl(response.data.product);
        setDetailImageSrc((current) => {
            if (!current) return nextPrimary;
            return current.includes(fileId) ? nextPrimary : current;
        });
    };

    if (viewMode === 'create') {
        return (
            <StoreManagerLayout>
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
                        <button
                            onClick={() => setViewMode('list')}
                            className="p-2 hover:bg-gray-200 rounded-full"
                        >
                            <FiX className="w-6 h-6" />
                        </button>
                    </div>
                    <ProductForm onSubmit={handleCreate} loading={false} />
                </div>
            </StoreManagerLayout>
        );
    }

    if (viewMode === 'edit') {
        return (
            <StoreManagerLayout>
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
                        <button
                            onClick={() => {
                                setViewMode('list');
                                setSelectedProduct(null);
                            }}
                            className="p-2 hover:bg-gray-200 rounded-full"
                        >
                            <FiX className="w-6 h-6" />
                        </button>
                    </div>
                    <ProductForm
                        initialData={selectedProduct}
                        onSubmit={handleUpdate}
                        loading={false}
                        isEdit={true}
                        onDeleteExistingImage={deleteExistingImage}
                    />
                </div>
            </StoreManagerLayout>
        );
    }

    if (viewMode === 'detail') {
        return (
            <StoreManagerLayout>
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Product Details</h1>
                            <p className="text-gray-500">View product information</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setViewMode('list')}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Back
                            </button>
                            {selectedProduct && (
                                <button
                                    onClick={() => startEdit(selectedProduct)}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                >
                                    Edit
                                </button>
                            )}
                        </div>
                    </div>

                    {selectedProduct ? (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div className="w-full aspect-square rounded-xl bg-gray-100 border border-gray-200 overflow-hidden">
                                        {detailImageSrc ? (
                                            <img
                                                src={detailImageSrc}
                                                alt={selectedProduct.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <FiBox className="w-10 h-10" />
                                            </div>
                                        )}
                                    </div>

                                    {(selectedProduct.images || []).length > 1 && (
                                        <div className="grid grid-cols-5 gap-2">
                                            {selectedProduct.images.slice(0, 5).map((img) => (
                                                <button
                                                    key={img.fileId || img.url}
                                                    type="button"
                                                    onClick={() => setDetailImageSrc(resolveFileUrl(img.url || img.fileId))}
                                                    className={`aspect-square rounded-lg bg-gray-100 border overflow-hidden ${detailImageSrc === resolveFileUrl(img.url || img.fileId)
                                                        ? 'border-primary-600 ring-2 ring-primary-200'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                    title="Preview"
                                                >
                                                    {resolveFileUrl(img.url || img.fileId) ? (
                                                        <img
                                                            src={resolveFileUrl(img.url || img.fileId)}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : null}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{selectedProduct.name}</h2>
                                        <p className="text-sm text-gray-500">{selectedProduct.category}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                            <p className="text-xs text-gray-500">Price</p>
                                            <p className="text-lg font-bold text-gray-900">NRS {Number(selectedProduct.price || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                            <p className="text-xs text-gray-500">Stock</p>
                                            <p className="text-lg font-bold text-gray-900">{selectedProduct.quantity}</p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        <p className="text-xs text-gray-500 mb-1">Description</p>
                                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedProduct.description}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                            <p className="text-xs text-gray-500">SKU</p>
                                            <p className="text-sm font-medium text-gray-900">{selectedProduct.sku || 'N/A'}</p>
                                        </div>
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                            <p className="text-xs text-gray-500">Status</p>
                                            <p className="text-sm font-medium text-gray-900">{selectedProduct.status}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <p className="text-gray-700">No product selected.</p>
                        </div>
                    )}
                </div>
            </StoreManagerLayout>
        );
    }

    return (
        <StoreManagerLayout>
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                        <p className="text-gray-500">Manage your store inventory</p>
                    </div>
                    <button
                        onClick={() => setViewMode('create')}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium flex items-center gap-2"
                    >
                        <FiPlus /> Add Product
                    </button>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                    <th className="px-6 py-3 font-semibold">Product</th>
                                    <th className="px-6 py-3 font-semibold">Category</th>
                                    <th className="px-6 py-3 font-semibold">Price</th>
                                    <th className="px-6 py-3 font-semibold">Stock</th>
                                    <th className="px-6 py-3 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {products.length > 0 ? (
                                    products.map((product) => (
                                        <tr key={product._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                                            {getPrimaryProductImageUrl(product) ? (
                                                                <img src={getPrimaryProductImageUrl(product)} alt={product.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                    <FiBox className="w-4 h-4" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
                                                            <p className="text-xs text-gray-500">{product.sku || 'No SKU'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">NRS {product.price}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full
                                                    ${product.quantity > 10 ? 'bg-green-100 text-green-700' :
                                                        product.quantity > 0 ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'}`}>
                                                    {product.quantity} in stock
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button
                                                    onClick={() => startDetail(product)}
                                                    className="p-1 text-gray-700 hover:bg-gray-100 rounded"
                                                    title="View"
                                                >
                                                    <FiEye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => startEdit(product)}
                                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                    title="Edit"
                                                >
                                                    <FiEdit2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product._id)}
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                            No products found. Start by adding one!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Simple Pagination */}
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="px-3 py-1">Page {page} of {totalPages}</span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </StoreManagerLayout>
    );
};

export default ProductManagementPage;
