import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchSellerProductDetails, updateSellerProduct, clearCurrentProduct } from '../../redux/slices/sellerSlice';
import SellerDashboardLayout from '../../components/SellerDashboardLayout';
import { FiUpload, FiX, FiSave, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-toastify';

const CATEGORIES = [
    'Electronics', 'Fashion', 'Home & Garden', 'Sports & Outdoors',
    'Books', 'Toys & Games', 'Health & Beauty', 'Food & Beverages',
    'Automotive', 'Other'
];

const EditProductPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentProduct, loading, error } = useSelector((state) => state.seller);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        price: '',
        quantity: '',
        sku: '',
        brand: '',
        status: 'active'
    });

    const [newImages, setNewImages] = useState([]);
    const [newPreviewUrls, setNewPreviewUrls] = useState([]);
    const [existingImages, setExistingImages] = useState([]);

    useEffect(() => {
        if (id) {
            dispatch(fetchSellerProductDetails(id));
        }
        return () => {
            dispatch(clearCurrentProduct());
        };
    }, [dispatch, id]);

    useEffect(() => {
        if (currentProduct) {
            setFormData({
                name: currentProduct.name || '',
                description: currentProduct.description || '',
                category: currentProduct.category || '',
                price: currentProduct.price || '',
                quantity: currentProduct.quantity || '',
                sku: currentProduct.sku || '',
                brand: currentProduct.brand || '',
                status: currentProduct.status || 'active'
            });
            setExistingImages(currentProduct.images || []);
        }
    }, [currentProduct]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const totalImages = existingImages.length + newImages.length + files.length;

        if (totalImages > 5) {
            toast.error('Maximum 5 images allowed total');
            return;
        }

        setNewImages(prev => [...prev, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setNewPreviewUrls(prev => [...prev, ...newPreviews]);
    };

    const removeNewImage = (index) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
        setNewPreviewUrls(prev => {
            const newPreviews = [...prev];
            URL.revokeObjectURL(newPreviews[index]);
            return newPreviews.filter((_, i) => i !== index);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== undefined && formData[key] !== null) {
                data.append(key, formData[key]);
            }
        });

        // Backend only supports appending NEW images in update
        newImages.forEach(image => {
            data.append('images', image);
        });

        try {
            await dispatch(updateSellerProduct({ id, data })).unwrap();
            toast.success('Product updated successfully');
            navigate('/seller/products');
        } catch (error) {
            toast.error(error || 'Failed to update product');
        }
    };

    if (loading && !currentProduct) {
        return (
            <SellerDashboardLayout>
                <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                </div>
            </SellerDashboardLayout>
        );
    }

    if (error) {
        return (
            <SellerDashboardLayout>
                <div className="text-center py-12">
                    <p className="text-red-500 text-lg mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/seller/products')}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                    >
                        Go Back
                    </button>
                </div>
            </SellerDashboardLayout>
        );
    }

    return (
        <SellerDashboardLayout>
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate('/seller/products')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <FiArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <h2 className="font-semibold text-gray-900 mb-4">Basic Information</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                                >
                                    <option value="">Select Category</option>
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                                <input
                                    type="text"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                            >
                                <option value="active">Active</option>
                                <option value="draft">Draft</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                    </div>

                    {/* Pricing & Inventory */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <h2 className="font-semibold text-gray-900 mb-4">Pricing & Inventory</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price (NRS) *</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                                <input
                                    type="text"
                                    name="sku"
                                    value={formData.sku}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Images */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="font-semibold text-gray-900">Product Images</h2>
                            <span className="text-sm text-gray-500">
                                {existingImages.length + newImages.length}/5 images
                            </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {/* Existing Images */}
                            {existingImages.map((img, index) => (
                                <div key={img._id || index} className="relative aspect-square rounded-lg border border-gray-200 overflow-hidden group">
                                    <img src={img.url} alt={`Existing ${index}`} className="w-full h-full object-cover" />
                                    {/* No delete yet */}
                                </div>
                            ))}

                            {/* New Images */}
                            {newPreviewUrls.map((url, index) => (
                                <div key={index} className="relative aspect-square rounded-lg border border-gray-200 overflow-hidden group">
                                    <img src={url} alt={`New Preview ${index}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeNewImage(index)}
                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <FiX className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            {(existingImages.length + newImages.length < 5) && (
                                <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors">
                                    <FiUpload className="w-6 h-6 text-gray-400" />
                                    <span className="text-xs text-gray-500 mt-2">Add New</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                        <p className="text-xs text-gray-500">Note: You can add new images. Deleting existing images is not supported yet.</p>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/seller/products')}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : (
                                <>
                                    <FiSave />
                                    <span>Update Product</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </SellerDashboardLayout>
    );
};

export default EditProductPage;
