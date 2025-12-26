import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { FiSave } from 'react-icons/fi';
import { storeAdminService } from '../services';

const ShippingSettingsManager = ({ Layout, title = 'Shipping' }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [store, setStore] = useState(null);

    const settings = store?.settings || {};

    const shippingMethod = String(settings.shippingMethod || 'flat');

    const explanation = useMemo(() => {
        if (shippingMethod === 'per_item') {
            return 'Per-item shipping charges a fee for each item, optionally capped with a maximum shipping fee.';
        }
        return 'Flat shipping charges one fixed fee per order (per store).';
    }, [shippingMethod]);

    const Wrapper = Layout || (({ children }) => <>{children}</>);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateSettingsField = (key, value) => {
        setStore((prev) => ({ ...prev, settings: { ...(prev?.settings || {}), [key]: value } }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!store) return;

        const payload = {
            settings: {
                shippingMethod: String(settings.shippingMethod || 'flat'),
                shippingFee: Math.max(0, Number(settings.shippingFee || 0)),
                shippingPerItemFee: Math.max(0, Number(settings.shippingPerItemFee || 0)),
                shippingMaxFee: Math.max(0, Number(settings.shippingMaxFee || 0)),
                freeShippingThreshold: Math.max(0, Number(settings.freeShippingThreshold || 0)),
            },
        };

        try {
            setSaving(true);
            const res = await storeAdminService.updateStoreSettings(payload);
            if (res?.success) {
                setStore(res.data);
                toast.success('Shipping settings updated');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to update shipping settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Wrapper>
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                </div>
            </Wrapper>
        );
    }

    if (!store) {
        return (
            <Wrapper>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-gray-700">Store not found.</p>
                </div>
            </Wrapper>
        );
    }

    return (
        <Wrapper>
            <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    <p className="text-gray-500">{explanation}</p>
                </div>
                <button
                    type="submit"
                    form="shipping-settings-form"
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                    <FiSave className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save'}
                </button>
            </div>

            <form id="shipping-settings-form" onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <h2 className="font-semibold text-gray-900">Mode</h2>
                    <div className="space-y-2">
                        <label className="flex items-center gap-3">
                            <input
                                type="radio"
                                name="shippingMethod"
                                checked={shippingMethod === 'flat'}
                                onChange={() => updateSettingsField('shippingMethod', 'flat')}
                            />
                            <div>
                                <div className="font-medium text-gray-900">Simple: Flat fee</div>
                                <div className="text-sm text-gray-500">Charge one shipping fee per order.</div>
                            </div>
                        </label>
                        <label className="flex items-center gap-3">
                            <input
                                type="radio"
                                name="shippingMethod"
                                checked={shippingMethod === 'per_item'}
                                onChange={() => updateSettingsField('shippingMethod', 'per_item')}
                            />
                            <div>
                                <div className="font-medium text-gray-900">Advanced: Per item</div>
                                <div className="text-sm text-gray-500">Charge shipping per item, with optional max cap.</div>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <h2 className="font-semibold text-gray-900">Shipping</h2>

                    {shippingMethod === 'flat' ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Flat shipping fee (NRS)</label>
                            <input
                                type="number"
                                value={Number(settings.shippingFee ?? 0)}
                                onChange={(e) => updateSettingsField('shippingFee', Number(e.target.value))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                min="0"
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Per item fee (NRS)</label>
                                <input
                                    type="number"
                                    value={Number(settings.shippingPerItemFee ?? 0)}
                                    onChange={(e) => updateSettingsField('shippingPerItemFee', Number(e.target.value))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Max shipping fee (NRS)</label>
                                <input
                                    type="number"
                                    value={Number(settings.shippingMaxFee ?? 0)}
                                    onChange={(e) => updateSettingsField('shippingMaxFee', Number(e.target.value))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    min="0"
                                />
                                <p className="mt-1 text-xs text-gray-500">Set 0 for no cap.</p>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Free shipping threshold (NRS)</label>
                        <input
                            type="number"
                            value={Number(settings.freeShippingThreshold ?? 0)}
                            onChange={(e) => updateSettingsField('freeShippingThreshold', Number(e.target.value))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            min="0"
                        />
                        <p className="mt-1 text-xs text-gray-500">If order subtotal is equal or above this, shipping becomes 0.</p>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-sm text-gray-500">Shipping applies per store order (cart is split by store).</div>
                </div>
            </form>
        </Wrapper>
    );
};

export default ShippingSettingsManager;
