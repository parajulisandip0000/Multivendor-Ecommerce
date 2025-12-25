import { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiPhone, FiEdit2, FiSave, FiX, FiLock, FiCamera } from 'react-icons/fi';
import DashboardLayout from '../../components/DashboardLayout';
import { authService } from '../../services';
import { logout, setUser, updateUserAvatar } from '../../redux/slices/authSlice';

const ProfilePage = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate type
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
            const data = await authService.updateProfilePicture(formData);
            dispatch(updateUserAvatar(data.data.avatar));
            toast.success('Profile picture updated successfully');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to update profile picture');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = await authService.updateMe(formData);
            dispatch(setUser(data.data));
            toast.success('Profile updated successfully!');
            setIsEditing(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || ''
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
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                        <p className="text-gray-600 mt-1">Manage your personal information</p>
                    </div>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            <FiEdit2 className="w-4 h-4" />
                            Edit Profile
                        </button>
                    )}
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Profile Header */}
                    <div className="bg-gradient-to-r from-primary-600 to-secondary-600 px-8 py-12">
                        <div className="flex items-center gap-6">
                            <div
                                className="relative group cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center border-4 border-white/20 shadow-xl overflow-hidden">
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-primary-600 font-bold text-4xl">
                                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                                        </span>
                                    )}
                                </div>
                                <div className="absolute inset-0 rounded-full bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <FiCamera className="text-white w-8 h-8" />
                                </div>
                            </div>
                            <div className="text-white">
                                <h2 className="text-2xl font-bold mb-1">{user?.name || 'User'}</h2>
                                <p className="text-blue-100">{user?.role === 'customer' ? 'Customer' : 'Store Owner'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Profile Form */}
                    <form onSubmit={handleSubmit} className="p-8">
                        <div className="space-y-6">
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiUser className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className={`block w-full pl-10 pr-3 py-3 border rounded-lg transition ${isEditing
                                            ? 'border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                                            : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                                            }`}
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiMail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className={`block w-full pl-10 pr-3 py-3 border rounded-lg transition ${isEditing
                                            ? 'border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                                            : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                                            }`}
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiPhone className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className={`block w-full pl-10 pr-3 py-3 border rounded-lg transition ${isEditing
                                            ? 'border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                                            : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                                            }`}
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {isEditing && (
                                <div className="flex items-center gap-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:from-primary-700 hover:to-secondary-700 transition-all disabled:opacity-50"
                                    >
                                        <FiSave className="w-5 h-5" />
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <FiX className="w-5 h-5" />
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                {/* Change Password Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Password</h3>
                            <p className="text-gray-600 text-sm">Manage your password settings</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowPasswordForm((v) => !v)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <FiLock className="w-4 h-4" />
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
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div className="md:col-span-3 flex justify-end">
                                <button
                                    type="button"
                                    disabled={passwordLoading}
                                    onClick={submitPasswordChange}
                                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                                >
                                    {passwordLoading ? 'Saving...' : 'Update Password'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Account Info */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Account Type</p>
                            <p className="font-semibold text-gray-900">
                                {user?.role === 'customer' ? 'Customer Account' : 'Store Owner Account'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Member Since</p>
                            <p className="font-semibold text-gray-900">
                                {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ProfilePage;
