import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FiSave } from 'react-icons/fi';
import StoreManagerLayout from '../../components/StoreManagerLayout';
import { storeManagerService } from '../../services';

const StoreManagerSettingsPage = () => {
    const { user } = useSelector((state) => state.auth);
    const canEditStoreProfile = user?.role === 'store_admin';

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [store, setStore] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await storeManagerService.getStoreSettings();
            if (response.success) setStore(response.data);
        } catch (error) {
            console.error('Failed to load settings:', error);
            toast.error(error.response?.data?.message || 'Failed to load store settings');
        } finally {
            setLoading(false);
        }
    };

    const updateStoreField = (key, value) => {
        setStore((prev) => ({ ...prev, [key]: value }));
    };

    const updateSettingsField = (key, value) => {
        setStore((prev) => ({ ...prev, settings: { ...(prev?.settings || {}), [key]: value } }));
    };

    const updatePaymentField = (key, value) => {
        setStore((prev) => ({ ...prev, paymentInfo: { ...(prev?.paymentInfo || {}), [key]: value } }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!store) return;

        try {
            setSaving(true);
            const payload = {
                settings: store.settings || {},
                paymentInfo: store.paymentInfo || {},
            };

            if (canEditStoreProfile) {
                payload.name = store.name;
                payload.description = store.description;
                payload.email = store.email;
                payload.phone = store.phone;
                payload.address = store.address;
            }

            const response = await storeManagerService.updateStoreSettings(payload);
            if (response.success) {
                setStore(response.data);
                toast.success('Store settings updated');
            }
        } catch (error) {
            console.error('Failed to update settings:', error);
            toast.error(error.response?.data?.message || 'Failed to update store settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <StoreManagerLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                </div>
            </StoreManagerLayout>
        );
    }

    if (!store) {
        return (
            <StoreManagerLayout>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-gray-700">Store not found.</p>
                </div>
            </StoreManagerLayout>
        );
    }

    return (
        <StoreManagerLayout>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
                    <p className="text-gray-500">Manage operational settings for your store</p>
                </div>
                <button
                    type="submit"
                    form="store-settings-form"
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                    <FiSave className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save'}
                </button>
            </div>

            <form id="store-settings-form" onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <h2 className="font-semibold text-gray-900">Operational</h2>

                    <label className="flex items-center justify-between gap-4">
                        <span className="text-sm text-gray-700">Store Active</span>
                        <input
                            type="checkbox"
                            checked={!!store.settings?.isActive}
                            onChange={(e) => updateSettingsField('isActive', e.target.checked)}
                            className="h-5 w-5"
                        />
                    </label>

                    <label className="flex items-center justify-between gap-4">
                        <span className="text-sm text-gray-700">Accept Orders</span>
                        <input
                            type="checkbox"
                            checked={!!store.settings?.acceptOrders}
                            onChange={(e) => updateSettingsField('acceptOrders', e.target.checked)}
                            className="h-5 w-5"
                        />
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Amount</label>
                            <input
                                type="number"
                                value={store.settings?.minOrderAmount ?? 0}
                                onChange={(e) => updateSettingsField('minOrderAmount', Number(e.target.value))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Fee</label>
                            <input
                                type="number"
                                value={store.settings?.shippingFee ?? 0}
                                onChange={(e) => updateSettingsField('shippingFee', Number(e.target.value))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Free Shipping Threshold</label>
                        <input
                            type="number"
                            value={store.settings?.freeShippingThreshold ?? 0}
                            onChange={(e) => updateSettingsField('freeShippingThreshold', Number(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <h2 className="font-semibold text-gray-900">Payout Info</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                            <input
                                type="text"
                                value={store.paymentInfo?.bankName || ''}
                                onChange={(e) => updatePaymentField('bankName', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                            <input
                                type="text"
                                value={store.paymentInfo?.accountName || ''}
                                onChange={(e) => updatePaymentField('accountName', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                        <input
                            type="text"
                            value={store.paymentInfo?.accountNumber || ''}
                            onChange={(e) => updatePaymentField('accountNumber', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">eSewa ID</label>
                            <input
                                type="text"
                                value={store.paymentInfo?.esewaId || ''}
                                onChange={(e) => updatePaymentField('esewaId', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Khalti ID</label>
                            <input
                                type="text"
                                value={store.paymentInfo?.khaltiId || ''}
                                onChange={(e) => updatePaymentField('khaltiId', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {canEditStoreProfile && (
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <h2 className="font-semibold text-gray-900">Store Profile</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                                <input
                                    type="text"
                                    value={store.name || ''}
                                    onChange={(e) => updateStoreField('name', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                                <input
                                    type="email"
                                    value={store.email || ''}
                                    onChange={(e) => updateStoreField('email', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                value={store.description || ''}
                                onChange={(e) => updateStoreField('description', e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                                <input
                                    type="text"
                                    value={store.phone || ''}
                                    onChange={(e) => updateStoreField('phone', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                <input
                                    type="text"
                                    value={store.address?.city || ''}
                                    onChange={(e) => updateStoreField('address', { ...(store.address || {}), city: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </StoreManagerLayout>
    );
};

export default StoreManagerSettingsPage;

