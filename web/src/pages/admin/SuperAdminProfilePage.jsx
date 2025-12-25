import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FiEdit2, FiSave, FiX } from 'react-icons/fi';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import { authService } from '../../services';
import { logout, setUser, updateUserAvatar } from '../../redux/slices/authSlice';

const SuperAdminProfilePage = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
    const fileInputRef = useRef(null);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
        });
    }, [user]);

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        const fd = new FormData();
        fd.append('image', file);

        try {
            const response = await authService.updateProfilePicture(fd);
            dispatch(updateUserAvatar(response.data.avatar));
            toast.success('Profile picture updated');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to update profile picture');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const response = await authService.updateMe(formData);
            if (response.success) {
                dispatch(setUser(response.data));
                toast.success('Profile updated');
                setIsEditing(false);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
        });
        setIsEditing(false);
    };

    const handlePasswordChange = (e) => {
        setPasswordData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const submitPasswordChange = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword) {
            toast.error('Please fill in all password fields');
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New password and confirmation do not match');
            return;
        }

        try {
            setPasswordLoading(true);
            const response = await authService.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            toast.success(response.message || 'Password changed');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setShowPasswordForm(false);

            if (response.data?.requiresReauth) {
                dispatch(logout());
                window.location.href = '/login';
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <SuperAdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
                        <p className="text-gray-500">Update your personal information</p>
                    </div>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <FiEdit2 className="w-4 h-4" />
                            Edit
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-6 border-b border-gray-100 flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden shrink-0 border border-gray-200"
                            aria-label="Change profile picture"
                        >
                            <img
                                src={user?.avatar || '/avatar-placeholder.svg'}
                                alt={user?.name || 'Profile'}
                                className="w-full h-full object-cover"
                            />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleAvatarChange}
                        />
                        <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{user?.name}</p>
                            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSave} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={`w-full px-4 py-2 border rounded-lg outline-none ${isEditing
                                    ? 'border-gray-300 focus:ring-2 focus:ring-red-500'
                                    : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                                    }`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={`w-full px-4 py-2 border rounded-lg outline-none ${isEditing
                                    ? 'border-gray-300 focus:ring-2 focus:ring-red-500'
                                    : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                                    }`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={`w-full px-4 py-2 border rounded-lg outline-none ${isEditing
                                    ? 'border-gray-300 focus:ring-2 focus:ring-red-500'
                                    : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                                    }`}
                            />
                        </div>

                        {isEditing && (
                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                >
                                    <FiSave className="w-4 h-4" />
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    <FiX className="w-4 h-4" />
                                    Cancel
                                </button>
                            </div>
                        )}
                    </form>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Security</h3>
                            <p className="text-gray-600 text-sm">Change your password</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowPasswordForm((v) => !v)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            {showPasswordForm ? 'Close' : 'Change Password'}
                        </button>
                    </div>

                    {showPasswordForm && (
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>

                            <div className="md:col-span-3 flex justify-end">
                                <button
                                    type="button"
                                    disabled={passwordLoading}
                                    onClick={submitPasswordChange}
                                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                >
                                    {passwordLoading ? 'Saving...' : 'Update Password'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </SuperAdminLayout>
    );
};

export default SuperAdminProfilePage;
