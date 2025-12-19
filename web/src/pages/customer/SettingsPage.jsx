import { useState } from 'react';
import { toast } from 'react-toastify';
import { FiBell, FiMail, FiShield, FiTrash2 } from 'react-icons/fi';
import DashboardLayout from '../../components/DashboardLayout';

const SettingsPage = () => {
    const [settings, setSettings] = useState({
        emailNotifications: true,
        orderUpdates: true,
        promotions: false,
        newsletter: true
    });

    const handleToggle = (key) => {
        setSettings({ ...settings, [key]: !settings[key] });
        toast.success('Settings updated');
    };

    const handleDeleteAccount = () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            toast.error('Account deletion requested');
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-600 mt-1">Manage your account preferences</p>
                </div>

                {/* Notifications */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <FiBell className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                            <p className="text-gray-600 text-sm">Manage how you receive notifications</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <ToggleItem
                            label="Email Notifications"
                            description="Receive notifications via email"
                            checked={settings.emailNotifications}
                            onChange={() => handleToggle('emailNotifications')}
                        />
                        <ToggleItem
                            label="Order Updates"
                            description="Get updates about your orders"
                            checked={settings.orderUpdates}
                            onChange={() => handleToggle('orderUpdates')}
                        />
                        <ToggleItem
                            label="Promotions & Offers"
                            description="Receive promotional emails and offers"
                            checked={settings.promotions}
                            onChange={() => handleToggle('promotions')}
                        />
                        <ToggleItem
                            label="Newsletter"
                            description="Subscribe to our newsletter"
                            checked={settings.newsletter}
                            onChange={() => handleToggle('newsletter')}
                        />
                    </div>
                </div>

                {/* Privacy */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-green-100 p-3 rounded-lg">
                            <FiShield className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Privacy & Security</h2>
                            <p className="text-gray-600 text-sm">Control your privacy settings</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div>
                                <p className="font-semibold text-gray-900">Two-Factor Authentication</p>
                                <p className="text-sm text-gray-600">Add an extra layer of security</p>
                            </div>
                            <button className="px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors">
                                Enable
                            </button>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-red-100 p-3 rounded-lg">
                            <FiTrash2 className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Danger Zone</h2>
                            <p className="text-gray-600 text-sm">Irreversible actions</p>
                        </div>
                    </div>

                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="font-semibold text-gray-900 mb-1">Delete Account</p>
                                <p className="text-sm text-gray-600">
                                    Permanently delete your account and all associated data. This action cannot be undone.
                                </p>
                            </div>
                            <button
                                onClick={handleDeleteAccount}
                                className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

// Toggle Item Component
const ToggleItem = ({ label, description, checked, onChange }) => {
    return (
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div>
                <p className="font-semibold text-gray-900">{label}</p>
                <p className="text-sm text-gray-600">{description}</p>
            </div>
            <button
                onClick={onChange}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
                        }`}
                />
            </button>
        </div>
    );
};

export default SettingsPage;
