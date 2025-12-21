import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { superAdminService } from '../../services';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import { FiSearch, FiSlash, FiCheckCircle, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';

const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, [page, search]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await superAdminService.getAllUsers({ page, limit: 10, search });
            if (response.success) {
                setUsers(response.data);
                setTotalPages(response.pagination.pages);
            }
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusToggle = async (userId, currentStatus) => {
        const action = currentStatus ? 'ban' : 'unban';
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

        try {
            setActionLoading(userId);
            await superAdminService.updateUserStatus(userId, !currentStatus);
            toast.success(`User ${action}ned successfully`);
            setUsers(users.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u));
        } catch (error) {
            toast.error(error.response?.data?.message || `Failed to ${action} user`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1); // Reset to page 1 on search
        fetchUsers();
    };

    const [selectedUser, setSelectedUser] = useState(null);

    return (
        <SuperAdminLayout>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500">Manage customer and staff accounts.</p>
                </div>
                <form onSubmit={handleSearch} className="relative w-full md:w-64">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                </form>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                                <th className="px-6 py-3 font-semibold">User</th>
                                <th className="px-6 py-3 font-semibold">Role</th>
                                <th className="px-6 py-3 font-semibold">Status</th>
                                <th className="px-6 py-3 font-semibold">Date Joined</th>
                                <th className="px-6 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-400">Loading users...</td>
                                </tr>
                            ) : users.length > 0 ? (
                                users.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                                    {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" /> : <FiUser />}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{user.name}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full
                                                ${user.role === 'superadmin' ? 'bg-purple-100 text-purple-700' :
                                                    user.role === 'store_admin' ? 'bg-blue-100 text-blue-700' :
                                                        user.role === 'store_manager' ? 'bg-orange-100 text-orange-700' :
                                                            'bg-gray-100 text-gray-700'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full
                                                ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {user.isActive ? 'Active' : 'Banned'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedUser(user)}
                                                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                                    title="View Details"
                                                >
                                                    <FiUser />
                                                </button>
                                                {user.role !== 'superadmin' && (
                                                    <button
                                                        onClick={() => handleStatusToggle(user._id, user.isActive)}
                                                        disabled={actionLoading === user._id}
                                                        className={`p-2 rounded-lg transition-colors font-medium text-sm flex items-center gap-1
                                                            ${user.isActive
                                                                ? 'text-red-600 hover:bg-red-50'
                                                                : 'text-green-600 hover:bg-green-50'}`}
                                                    >
                                                        {user.isActive ? <><FiSlash /> Ban</> : <><FiCheckCircle /> Unban</>}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex justify-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="px-3 py-1">Page {page} of {totalPages}</span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* User Detail Modal */}
            {selectedUser && createPortal(
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
                            <h3 className="text-xl font-bold text-gray-900">User Details</h3>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200 overflow-hidden">
                                    {selectedUser.avatar ? <img src={selectedUser.avatar} alt={selectedUser.name} className="w-full h-full object-cover" /> : <FiUser className="w-10 h-10" />}
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900">{selectedUser.name}</h4>
                                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                                    <div className="mt-2 flex gap-2">
                                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full
                                                ${selectedUser.role === 'superadmin' ? 'bg-purple-100 text-purple-700' :
                                                selectedUser.role === 'store_admin' ? 'bg-blue-100 text-blue-700' :
                                                    selectedUser.role === 'store_manager' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-gray-100 text-gray-700'}`}>
                                            {selectedUser.role}
                                        </span>
                                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full
                                                ${selectedUser.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {selectedUser.isActive ? 'Active' : 'Banned'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h5 className="font-semibold text-gray-900 mb-2 text-sm uppercase">Account Info</h5>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="text-gray-500">User ID:</span> <span className="font-mono text-xs">{selectedUser._id}</span></p>
                                        <p><span className="text-gray-500">Joined:</span> {new Date(selectedUser.createdAt).toLocaleString()}</p>
                                        <p><span className="text-gray-500">Last Updated:</span> {new Date(selectedUser.updatedAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </SuperAdminLayout>
    );
};

export default AdminUsersPage;
