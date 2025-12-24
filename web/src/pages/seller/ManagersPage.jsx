import { useState, useEffect } from 'react';
import { storeAdminService } from '../../services';
import SellerDashboardLayout from '../../components/SellerDashboardLayout';
import { FiUsers, FiPlus, FiTrash2, FiX, FiCheck, FiEdit2, FiAlertTriangle, FiMessageCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ManagersPage = () => {
    const navigate = useNavigate();
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedManager, setSelectedManager] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
    });
    const [submitting, setSubmitting] = useState(false);

    // Confirmation Modal State
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null); // 'delete' or 'deactivate' or 'activate'
    const [managerToActOn, setManagerToActOn] = useState(null);

    useEffect(() => {
        fetchManagers();
    }, []);

    const fetchManagers = async () => {
        try {
            setLoading(true);
            const response = await storeAdminService.getManagers();
            if (response.success) {
                setManagers(response.data);
            }
        } catch (error) {
            toast.error('Failed to load managers');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openAddModal = () => {
        setEditMode(false);
        setFormData({ name: '', email: '', phone: '', password: '' });
        setSelectedManager(null);
        setShowModal(true);
    };

    const openEditModal = (manager) => {
        setEditMode(true);
        setFormData({
            name: manager.name,
            email: manager.email,
            phone: manager.phone || '',
            password: '', // Don't fill password
        });
        setSelectedManager(manager);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editMode) {
                await storeAdminService.updateManager(selectedManager._id, formData);
                toast.success('Manager updated successfully');
            } else {
                await storeAdminService.addManager(formData);
                toast.success('Manager added successfully');
            }
            setShowModal(false);
            fetchManagers();
        } catch (error) {
            toast.error(error.response?.data?.message || `Failed to ${editMode ? 'update' : 'add'} manager`);
        } finally {
            setSubmitting(false);
        }
    };

    const promptDelete = (manager) => {
        setManagerToActOn(manager);
        setConfirmAction('delete');
        setShowConfirmModal(true);
    };

    const promptStatusChange = (manager) => {
        setManagerToActOn(manager);
        setConfirmAction(manager.isActive !== false ? 'deactivate' : 'activate');
        setShowConfirmModal(true);
    };

    const handleConfirmAction = async () => {
        try {
            if (confirmAction === 'delete') {
                await storeAdminService.deleteManager(managerToActOn._id);
                toast.success('Manager deleted successfully');
            } else if (confirmAction === 'deactivate') {
                await storeAdminService.toggleManagerStatus(managerToActOn._id, false);
                toast.success('Manager deactivated successfully');
            } else if (confirmAction === 'activate') {
                await storeAdminService.toggleManagerStatus(managerToActOn._id, true);
                toast.success('Manager activated successfully');
            }
            fetchManagers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        } finally {
            setShowConfirmModal(false);
            setManagerToActOn(null);
            setConfirmAction(null);
        }
    };

    const openChatWithManager = (manager) => {
        navigate(`/seller/chat?managerId=${manager._id}`);
    };

    return (
        <SellerDashboardLayout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Store Managers</h1>
                    <p className="text-gray-500">Manage access to your store dashboard</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium flex items-center gap-2"
                >
                    <FiPlus />
                    Add Manager
                </button>
            </div>

            {/* Managers List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                                <th className="px-6 py-3 font-semibold">Name</th>
                                <th className="px-6 py-3 font-semibold">Email</th>
                                <th className="px-6 py-3 font-semibold">Phone</th>
                                <th className="px-6 py-3 font-semibold text-center">Status</th>
                                <th className="px-6 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-400">Loading...</td>
                                </tr>
                            ) : managers.length > 0 ? (
                                managers.map((manager) => (
                                    <tr key={manager._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {manager.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {manager.email}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {manager.phone || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => promptStatusChange(manager)}
                                                className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors
                                                    ${manager.isActive !== false
                                                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                                        : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'}`}
                                                title={manager.isActive !== false ? 'Click to Deactivate' : 'Click to Activate'}
                                            >
                                                {manager.isActive !== false ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                            <button
                                                onClick={() => openChatWithManager(manager)}
                                                className="text-primary-600 hover:text-primary-800 p-2 hover:bg-primary-50 rounded-lg transition-colors"
                                                title="Message Manager"
                                            >
                                                <FiMessageCircle className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openEditModal(manager)}
                                                className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit Manager"
                                            >
                                                <FiEdit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => promptDelete(manager)}
                                                className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete Manager"
                                            >
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No managers found. Add one to help manage your store.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Manager Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-900">{editMode ? 'Edit Manager' : 'Add New Manager'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    disabled={editMode} // Disable email edit to keep ID consistent or simplify logic
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none ${editMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {editMode ? 'New Password (leave blank to keep current)' : 'Password'}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    required={!editMode}
                                    minLength="6"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium flex items-center gap-2"
                                >
                                    {submitting ? 'Saving...' : (editMode ? 'Update Manager' : 'Add Manager')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-sm overflow-hidden p-6 text-center">
                        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4
                            ${confirmAction === 'activate' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            <FiAlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {confirmAction === 'delete' ? 'Delete Manager?' :
                                confirmAction === 'deactivate' ? 'Deactivate Manager?' : 'Activate Manager?'}
                        </h3>
                        <p className="text-gray-500 mb-6 text-sm">
                            {confirmAction === 'delete'
                                ? `Are you sure you want to delete ${managerToActOn?.name}? This action cannot be undone.`
                                : confirmAction === 'deactivate'
                                    ? `Are you sure you want to deactivate ${managerToActOn?.name}? They will not be able to log in.`
                                    : `Are you sure you want to activate ${managerToActOn?.name}?`}
                        </p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmAction}
                                className={`px-4 py-2 text-white rounded-lg font-medium
                                    ${confirmAction === 'activate' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </SellerDashboardLayout>
    );
};

export default ManagersPage;
