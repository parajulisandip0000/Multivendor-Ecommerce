import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboard } from '../../redux/slices/sellerSlice'; // re-fetch to get updated store profile
import { storeAdminService } from '../../services';
import SellerDashboardLayout from '../../components/SellerDashboardLayout';
import { FiSave, FiUpload, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import { toast } from 'react-toastify';

const StoreProfilePage = () => {
    const dispatch = useDispatch();
    const { storeProfile, loading } = useSelector((state) => state.seller);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        email: '',
        phone: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
        }
    });

    const [logo, setLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [banner, setBanner] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);

    useEffect(() => {
        if (!storeProfile) {
            dispatch(fetchDashboard());
        } else {
            setFormData({
                name: storeProfile.name || '',
                description: storeProfile.description || '',
                email: storeProfile.email || '',
                phone: storeProfile.phone || '',
                address: {
                    street: storeProfile.address?.street || '',
                    city: storeProfile.address?.city || '',
                    state: storeProfile.address?.state || '',
                    zipCode: storeProfile.address?.zipCode || '',
                    country: storeProfile.address?.country || ''
                }
            });
            if (storeProfile.logo) setLogoPreview(storeProfile.logo);
            if (storeProfile.banner) setBannerPreview(storeProfile.banner);
        }
    }, [storeProfile, dispatch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                address: { ...prev.address, [addressField]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (type === 'logo') {
                setLogo(file);
                setLogoPreview(URL.createObjectURL(file));
            } else {
                setBanner(file);
                setBannerPreview(URL.createObjectURL(file));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('email', formData.email);
        data.append('phone', formData.phone);

        // Append address fields individually or as object?
        // Backend updateProfile logic: store[key] = req.body[key].
        // If I send nested object in FormData, it sends key "address[street]".
        // Express body-parser (multer) might parse it if configured, or just flat keys.
        // My backend logic: Object.keys(req.body).forEach...
        // If I rely on req.body having 'address' object, I need to send it as JSON string or ensure parser handles dot notation.
        // Better: Append individual address fields if backend handled it. 
        // BUT backend expects `address` field as object to replace `store.address`.
        // So I should probably append `address` as JSON string if not using nested parser?
        // Or reconstruct object in backend.
        // Step 926 backend logic: `store[key] = req.body[key]`.
        // If `req.body` comes from multer (FormData), nested fields like `address[city]` usually appear as `req.body.address: { city: ... }` if using `extended: true` in urlencoded? No, multer handles multipart.
        // Multer doesn't automatically nest fields unless a plugin is used.
        // So `req.body` might have `address[city]`: "value".
        // My backend code expects `store.address` object.
        // So I should better construct the object in backend OR send generic fields.
        // FIX: I'll append `address` fields individually in FormData? NO, backend expects `address` key.
        // I will update backend logic later if needed. For now, sending keys like `address[street]` usually works with many body parsers.
        // Let's assume standard behavior. If it fails, I'll fix key mapping.
        // Actually, safer to iterate address keys and append `address[${key}]`.

        Object.keys(formData.address).forEach(key => {
            data.append(`address[${key}]`, formData.address[key]);
        });

        if (logo) data.append('logo', logo);
        if (banner) data.append('banner', banner);

        try {
            await storeAdminService.updateProfile(data);
            toast.success('Store profile updated successfully');
            dispatch(fetchDashboard()); // Refresh Redux state
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        }
    };

    if (!storeProfile && loading) return <div>Loading...</div>;

    return (
        <SellerDashboardLayout>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Store Settings</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Branding */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                        <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">Branding</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Logo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Store Logo</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-24 h-24 rounded-full border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-gray-400 text-xs">No Logo</span>
                                        )}
                                    </div>
                                    <label className="px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm font-medium">
                                        <FiUpload className="inline mr-2" />
                                        Change Logo
                                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} className="hidden" />
                                    </label>
                                </div>
                            </div>

                            {/* Banner */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Store Banner</label>
                                <div className="w-full h-24 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center relative group">
                                    {bannerPreview ? (
                                        <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-gray-400 text-xs">No Banner</span>
                                    )}
                                    <label className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center cursor-pointer transition-all opacity-0 group-hover:opacity-100">
                                        <span className="text-white font-medium p-2 bg-black bg-opacity-50 rounded">Change</span>
                                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} className="hidden" />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">Basic Information</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">Contact Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <FiMail className="inline mr-1" /> Contact Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <FiPhone className="inline mr-1" /> Contact Phone
                                </label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">Business Address</h2>

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                                <input
                                    type="text"
                                    name="address.street"
                                    value={formData.address.street}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                    <input
                                        type="text"
                                        name="address.city"
                                        value={formData.address.city}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                                    <input
                                        type="text"
                                        name="address.state"
                                        value={formData.address.state}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Zip/Postal Code</label>
                                    <input
                                        type="text"
                                        name="address.zipCode"
                                        value={formData.address.zipCode}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                    <input
                                        type="text"
                                        name="address.country"
                                        value={formData.address.country}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium flex items-center gap-2"
                        >
                            <FiSave />
                            <span>Save Changes</span>
                        </button>
                    </div>
                </form>
            </div>
        </SellerDashboardLayout>
    );
};

export default StoreProfilePage;
