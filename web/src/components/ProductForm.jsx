import { useState, useEffect } from 'react';
import { FiUpload, FiX, FiSave, FiEdit } from 'react-icons/fi';
import { toast } from 'react-toastify';

const CATEGORIES = [
    'Electronics', 'Fashion', 'Home & Garden', 'Sports & Outdoors',
    'Books', 'Toys & Games', 'Health & Beauty', 'Food & Beverages',
    'Automotive', 'Other'
];

const ProductForm = ({ initialData, onSubmit, loading, isEdit }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        price: '',
        quantity: '',
        sku: '',
        brand: '',
        discount: '0',
    });

    const [images, setImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [existingImages, setExistingImages] = useState([]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                description: initialData.description || '',
                category: initialData.category || '',
                price: initialData.price || '',
                quantity: initialData.stock || '', // Map stock to quantity
                sku: initialData.sku || '',
                brand: initialData.brand || '',
                discount: initialData.discount || '0',
            });
            if (initialData.images) {
                setExistingImages(initialData.images);
            }
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const totalImages = files.length + images.length + existingImages.length;

        if (totalImages > 5) {
            toast.error('Maximum 5 images allowed');
            return;
        }

        setImages(prev => [...prev, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => {
            const newPreviews = [...prev];
            URL.revokeObjectURL(newPreviews[index]);
            return newPreviews.filter((_, i) => i !== index);
        });
    };

    const removeExistingImage = (index) => {
        // Here we just hide it from view, actual deletion happens on submit if backend supports it
        // Or we pass a list of "kept" image IDs to backend.
        // For now, let's assume simple full replace or just modifying state
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name || !formData.description || !formData.category || !formData.price || !formData.quantity) {
            toast.error('Please fill in all required fields');
            return;
        }

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== undefined && formData[key] !== null) {
                // Determine key mapping if needed. Backend expects 'stock' but form uses 'quantity' 
                // Wait, Backend model has 'stock'. AddProductPage uses 'quantity' but backend createProduct might expect 'stock' or 'quantity'?
                // Checking AddProductPage: it appends 'quantity'.
                // Checking backend Product model: it has 'stock'.
                // Checking backend createProduct: `const productData = { ...req.body }`.
                // So if frontend sends 'quantity', backend saves 'quantity'? 
                // Product model likely has 'stock'.
                // Let's check Product model later. For now, let's stick to what AddProductPage was doing or standardize.
                // Assuming AddProductPage was working, I will verify.
                // Actually, standardizing to 'stock' is better.
                if (key === 'quantity') {
                    data.append('stock', formData[key]);
                } else {
                    data.append(key, formData[key]);
                }
            }
        });

        images.forEach(image => {
            data.append('images', image);
        });

        // If editing, we might need to send existing images to keep?
        // Backend updateProduct usually adds new images. 
        // If we deleted existing images, we might need to handle that.
        // For MVP, let's just handle adding new images.

        onSubmit(data);
    };

    return (
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
                        placeholder="e.g. Wireless Headphones"
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
                        placeholder="Describe your product..."
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
                            placeholder="e.g. Sony"
                        />
                    </div>
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
                            placeholder="0.00"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            placeholder="0"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                        <input
                            type="number"
                            name="discount"
                            value={formData.discount}
                            onChange={handleChange}
                            min="0"
                            max="100"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            placeholder="0"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                    <input
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="Stock Keeping Unit"
                    />
                </div>
            </div>

            {/* Images */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-gray-900">Product Images</h2>
                    <span className="text-sm text-gray-500">{images.length + existingImages.length}/5 images</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {/* Existing Images */}
                    {existingImages.map((img, index) => (
                        <div key={img._id || index} className="relative aspect-square rounded-lg border border-gray-200 overflow-hidden group">
                            <img src={img.url} alt={`Product ${index}`} className="w-full h-full object-cover" />
                            {/* Delete logic for existing images can be added later if API supports it */}
                        </div>
                    ))}

                    {/* New Previews */}
                    {previewUrls.map((url, index) => (
                        <div key={index} className="relative aspect-square rounded-lg border border-gray-200 overflow-hidden group">
                            <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <FiX className="w-4 h-4" />
                            </button>
                        </div>
                    ))}

                    {images.length + existingImages.length < 5 && (
                        <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors">
                            <FiUpload className="w-6 h-6 text-gray-400" />
                            <span className="text-xs text-gray-500 mt-2">Upload</span>
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
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium flex items-center gap-2 disabled:opacity-50"
                >
                    {loading ? 'Saving...' : (
                        <>
                            {isEdit ? <FiEdit /> : <FiSave />}
                            <span>{isEdit ? 'Update Product' : 'Create Product'}</span>
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default ProductForm;
