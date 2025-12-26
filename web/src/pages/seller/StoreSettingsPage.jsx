import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FiSave } from 'react-icons/fi';
import SellerDashboardLayout from '../../components/SellerDashboardLayout';
import { storeAdminService } from '../../services';

const SellerStoreSettingsPage = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [store, setStore] = useState(null);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await storeAdminService.getStoreSettings();
            if (res?.success) setStore(res.data);
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to load store settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

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
            const res = await storeAdminService.updateStoreSettings(payload);
            if (res?.success) {
                setStore(res.data);
                toast.success('Store settings updated');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to update store settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <SellerDashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                </div>
            </SellerDashboardLayout>
        );
    }

    if (!store) {
        return (
            <SellerDashboardLayout>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-gray-700">Store not found.</p>
                </div>
            </SellerDashboardLayout>
        );
    }

    return (
        <SellerDashboardLayout>
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
                            checked={store.settings?.acceptOrders !== false}
                            onChange={(e) => updateSettingsField('acceptOrders', e.target.checked)}
                            className="h-5 w-5"
                        />
                    </label>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Min Order Amount</label>
                        <input
                            type="number"
                            min="0"
                            value={Number(store.settings?.minOrderAmount ?? 0)}
                            onChange={(e) => updateSettingsField('minOrderAmount', Number(e.target.value))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                        <p className="mt-1 text-xs text-gray-500">Shipping settings live in the Shipping page.</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <h2 className="font-semibold text-gray-900">Payout Info</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                            <input
                                type="text"
                                value={store.paymentInfo?.accountNumber || ''}
                                onChange={(e) => updatePaymentField('accountNumber', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
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
            </form>
        </SellerDashboardLayout>
    );
};

export default SellerStoreSettingsPage;

