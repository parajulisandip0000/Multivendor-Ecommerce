import { useState, useEffect } from 'react';
import { superAdminService } from '../../services';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import { FiSave, FiSettings, FiServer } from 'react-icons/fi';
import { toast } from 'react-toastify';

const PlatformSettingsPage = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        rateLimiting: {
            windowMs: 900000,
            max: 100,
            message: 'Too many requests from this IP, please try again after 15 minutes'
        }
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await superAdminService.getSystemSettings();
            if (response.success) {
                setSettings(response.data);
            }
        } catch (error) {
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleRateLimitChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            rateLimiting: {
                ...prev.rateLimiting,
                [name]: name === 'message' ? value : Number(value)
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await superAdminService.updateSystemSettings({
                rateLimiting: settings.rateLimiting
            });
            toast.success('System settings updated successfully');
        } catch (error) {
            toast.error('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <SuperAdminLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
                <p className="text-gray-500">Configure global system parameters.</p>
            </div>

            {loading ? (
                <div className="flex h-64 items-center justify-center bg-white rounded-xl border border-gray-200">
                    <div className="text-gray-500">Loading settings...</div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
                    {/* API Rate Limiting Config */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                            <FiServer className="text-gray-500" />
                            <h2 className="font-semibold text-gray-900">API Rate Limiting</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Time Window (ms)
                                </label>
                                <input
                                    type="number"
                                    name="windowMs"
                                    value={settings.rateLimiting.windowMs}
                                    onChange={handleRateLimitChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-shadow"
                                />
                                <p className="text-xs text-gray-400 mt-1">Default: 900000 (15 minutes)</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Max Requests
                                </label>
                                <input
                                    type="number"
                                    name="max"
                                    value={settings.rateLimiting.max}
                                    onChange={handleRateLimitChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-shadow"
                                />
                                <p className="text-xs text-gray-400 mt-1">Requests allowed per IP per window</p>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Error Message
                                </label>
                                <input
                                    type="text"
                                    name="message"
                                    value={settings.rateLimiting.message}
                                    onChange={handleRateLimitChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-shadow"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors disabled:opacity-50"
                        >
                            <FiSave />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            )}
        </SuperAdminLayout>
    );
};

export default PlatformSettingsPage;
