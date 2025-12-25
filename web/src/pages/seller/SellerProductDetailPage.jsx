import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiEdit2, FiBox } from 'react-icons/fi';
import SellerDashboardLayout from '../../components/SellerDashboardLayout';
import ZoomableImage from '../../components/ZoomableImage';
import { storeAdminService } from '../../services';
import { getPrimaryProductImageUrl, resolveFileUrl } from '../../utils/media';

const SellerProductDetailPage = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState(null);
    const [selectedImageSrc, setSelectedImageSrc] = useState(null);

    useEffect(() => {
        const run = async () => {
            try {
                setLoading(true);
                const response = await storeAdminService.getProduct(id);
                if (response.success) {
                    setProduct(response.data);
                    setSelectedImageSrc(getPrimaryProductImageUrl(response.data));
                }
            } catch (error) {
                console.error(error);
                toast.error(error.response?.data?.message || 'Failed to load product');
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [id]);

    if (loading) {
        return (
            <SellerDashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                </div>
            </SellerDashboardLayout>
        );
    }

    if (!product) {
        return (
            <SellerDashboardLayout>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-gray-700">Product not found.</p>
                    <Link to="/seller/products" className="inline-flex items-center gap-2 mt-4 text-primary-600 hover:underline">
                        <FiArrowLeft /> Back to products
                    </Link>
                </div>
            </SellerDashboardLayout>
        );
    }

    return (
        <SellerDashboardLayout>
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <Link to="/seller/products" className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900">
                        <FiArrowLeft /> Back
                    </Link>
                    <Link
                        to={`/seller/products/edit/${product._id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                        <FiEdit2 /> Edit
                    </Link>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <div className="w-full aspect-square rounded-xl bg-gray-100 border border-gray-200 overflow-hidden">
                                {selectedImageSrc ? (
                                    <ZoomableImage
                                        src={selectedImageSrc}
                                        alt={product.name}
                                        zoom={2.2}
                                        className="w-full h-full"
                                        imgClassName="select-none"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <FiBox className="w-10 h-10" />
                                    </div>
                                )}
                            </div>

                            {(product.images || []).length > 1 && (
                                <div className="grid grid-cols-5 gap-2">
                                    {product.images.slice(0, 10).map((img) => {
                                        const src = resolveFileUrl(img.url || img.fileId);
                                        return (
                                            <button
                                                key={img.fileId || img.url}
                                                type="button"
                                                onClick={() => setSelectedImageSrc(src)}
                                                className={`aspect-square rounded-lg bg-gray-100 border overflow-hidden ${selectedImageSrc === src
                                                    ? 'border-primary-600 ring-2 ring-primary-200'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                title="Preview"
                                            >
                                                {src ? <img src={src} alt="" className="w-full h-full object-cover" /> : null}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                                <p className="text-sm text-gray-500">{product.category}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <p className="text-xs text-gray-500">Price</p>
                                    <p className="text-lg font-bold text-gray-900">NRS {Number(product.price || 0).toLocaleString()}</p>
                                </div>
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <p className="text-xs text-gray-500">Stock</p>
                                    <p className="text-lg font-bold text-gray-900">{product.quantity}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <p className="text-xs text-gray-500 mb-1">Description</p>
                                <p className="text-sm text-gray-800 whitespace-pre-wrap">{product.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <p className="text-xs text-gray-500">SKU</p>
                                    <p className="text-sm font-medium text-gray-900">{product.sku || 'N/A'}</p>
                                </div>
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <p className="text-xs text-gray-500">Status</p>
                                    <p className="text-sm font-medium text-gray-900">{product.status}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SellerDashboardLayout>
    );
};

export default SellerProductDetailPage;
