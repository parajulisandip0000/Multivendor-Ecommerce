import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { superAdminService } from '../../services';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import { FiSearch, FiSlash, FiCheckCircle, FiShoppingBag, FiInfo } from 'react-icons/fi';
import { toast } from 'react-toastify';

const AdminStoresPage = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [actionLoading, setActionLoading] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchStores();
    }, [page, search, statusFilter]);

    const fetchStores = async () => {
        try {
            setLoading(true);
            const response = await superAdminService.getAllStores({ page, limit: 10, search, status: statusFilter });
            if (response.success) {
                setStores(response.data);
                setTotalPages(response.pagination.pages);
            }
        } catch (error) {
            toast.error('Failed to load stores');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (storeId, newStatus) => {
        const action = newStatus === 'suspended' ? 'suspend' : 'activate';
        if (!window.confirm(`Are you sure you want to ${action} this store?`)) return;

        try {
            setActionLoading(storeId);
            await superAdminService.updateStoreStatus(storeId, newStatus);
            toast.success(`Store ${action}d successfully`);
            setStores(stores.map(s => s._id === storeId ? { ...s, status: newStatus } : s));
        } catch (error) {
            toast.error(error.response?.data?.message || `Failed to ${action} store`);
        } finally {
            setActionLoading(null);
        }
    };

    const [selectedStore, setSelectedStore] = useState(null);

    return (
        <SuperAdminLayout>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Store Management</h1>
                    <p className="text-gray-500">Monitor and manage all stores on the platform.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                        <option value="">All Status</option>
                        <option value="approved">Approved</option>
                        <option value="suspended">Suspended</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <div className="relative w-full md:w-64">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search stores..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                                <th className="px-6 py-3 font-semibold">Store</th>
                                <th className="px-6 py-3 font-semibold">Owner</th>
                                <th className="px-6 py-3 font-semibold">Status</th>
                                <th className="px-6 py-3 font-semibold">Created</th>
                                <th className="px-6 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-400">Loading stores...</td>
                                </tr>
                            ) : stores.length > 0 ? (
                                stores.map((store) => (
                                    <tr key={store._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                                                    {store.logo ? <img src={store.logo} alt={store.name} className="w-full h-full object-cover rounded-lg" /> : <FiShoppingBag />}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{store.name}</p>
                                                    <p className="text-xs text-gray-500 truncate max-w-[200px]">{store.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <p className="font-medium text-gray-900">{store.owner?.name}</p>
                                            <p className="text-xs">{store.owner?.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full
                                                ${store.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                    store.status === 'suspended' ? 'bg-red-100 text-red-700' :
                                                        store.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-gray-100 text-gray-700'}`}>
                                                {store.status.charAt(0).toUpperCase() + store.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(store.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedStore(store)}
                                                    className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
                                                >
                                                    <FiInfo className="w-3 h-3" /> View
                                                </button>
                                                {store.status === 'approved' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(store._id, 'suspended')}
                                                        disabled={actionLoading === store._id}
                                                        className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1"
                                                    >
                                                        <FiSlash className="w-3 h-3" /> Suspend
                                                    </button>
                                                )}
                                                {store.status === 'suspended' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(store._id, 'approved')}
                                                        disabled={actionLoading === store._id}
                                                        className="px-3 py-1 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors flex items-center gap-1"
                                                    >
                                                        <FiCheckCircle className="w-3 h-3" /> Activate
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">No stores found.</td>
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

            {/* Store Detail Modal */}
            {selectedStore && createPortal(
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
                            <h3 className="text-xl font-bold text-gray-900">Store Details</h3>
                            <button
                                onClick={() => setSelectedStore(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200 flex-shrink-0">
                                    {selectedStore.logo ? <img src={selectedStore.logo} alt={selectedStore.name} className="w-full h-full object-cover rounded-xl" /> : <FiShoppingBag className="w-8 h-8" />}
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900">{selectedStore.name}</h4>
                                    <p className="text-sm text-gray-500 line-clamp-2">{selectedStore.description || 'No description provided.'}</p>
                                    <div className="mt-2">
                                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full
                                            ${selectedStore.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                selectedStore.status === 'suspended' ? 'bg-red-100 text-red-700' :
                                                    selectedStore.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-gray-100 text-gray-700'}`}>
                                            {selectedStore.status?.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h5 className="font-semibold text-gray-900 mb-2 text-sm uppercase">Owner Info</h5>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="text-gray-500">Name:</span> {selectedStore.owner?.name}</p>
                                        <p><span className="text-gray-500">Email:</span> {selectedStore.owner?.email}</p>
                                        <p><span className="text-gray-500">ID:</span> <span className="font-mono text-xs">{selectedStore.owner?._id}</span></p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h5 className="font-semibold text-gray-900 mb-2 text-sm uppercase">Contact Info</h5>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="text-gray-500">Phone:</span> {selectedStore.phone || 'N/A'}</p>
                                        <p>
                                            <span className="text-gray-500">Address:</span>{' '}
                                            {typeof selectedStore.address === 'object' && selectedStore.address !== null
                                                ? `${selectedStore.address.street || ''}, ${selectedStore.address.city || ''} ${selectedStore.address.state || ''}`
                                                : selectedStore.address || 'N/A'}
                                        </p>
                                        <p><span className="text-gray-500">Tax ID:</span> {selectedStore.taxId || 'N/A'}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Store ID: {selectedStore._id}</p>
                                    <p className="text-xs text-gray-400">Registered: {new Date(selectedStore.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
                            <button
                                onClick={() => setSelectedStore(null)}
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

export default AdminStoresPage;
