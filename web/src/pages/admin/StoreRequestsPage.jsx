import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { superAdminService } from '../../services';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import { FiCheck, FiX, FiInfo } from 'react-icons/fi';
import { toast } from 'react-toastify';

const StoreRequestsPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await superAdminService.getStoreRequests({ status: 'pending' });
            if (response.success) {
                setRequests(response.data);
            }
        } catch (error) {
            toast.error('Failed to load store requests');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (storeId) => {
        if (!window.confirm('Are you sure you want to approve this store?')) return;

        try {
            setActionLoading(storeId);
            await superAdminService.approveStore(storeId);
            toast.success('Store approved successfully');
            fetchRequests();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to approve store');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (storeId) => {
        const reason = window.prompt('Please provide a reason for rejection:');
        if (reason === null) return; // Cancelled

        try {
            setActionLoading(storeId);
            await superAdminService.rejectStore(storeId, reason || 'No reason provided');
            toast.success('Store rejected');
            fetchRequests();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reject store');
        } finally {
            setActionLoading(null);
        }
    };

    const [selectedRequest, setSelectedRequest] = useState(null);

    return (
        <SuperAdminLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Store Registration Requests</h1>
                <p className="text-gray-500">Review and approve new store applications.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                                <th className="px-6 py-3 font-semibold">Store Name</th>
                                <th className="px-6 py-3 font-semibold">Owner</th>
                                <th className="px-6 py-3 font-semibold">Contact</th>
                                <th className="px-6 py-3 font-semibold">Business Info</th>
                                <th className="px-6 py-3 font-semibold">Date</th>
                                <th className="px-6 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-400">Loading requests...</td>
                                </tr>
                            ) : requests.length > 0 ? (
                                requests.map((store) => (
                                    <tr key={store._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{store.name}</p>
                                            <p className="text-xs text-gray-500 truncate max-w-[200px]">{store.description}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <p className="font-medium text-gray-900">{store.owner?.name}</p>
                                            <p className="text-xs">{store.owner?.email}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {store.phone}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <p>Tax ID: {store.taxId || 'N/A'}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(store.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedRequest(store)}
                                                    className="p-2 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <FiInfo />
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(store._id)}
                                                    disabled={actionLoading === store._id}
                                                    className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Approve"
                                                >
                                                    <FiCheck />
                                                </button>
                                                <button
                                                    onClick={() => handleReject(store._id)}
                                                    disabled={actionLoading === store._id}
                                                    className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Reject"
                                                >
                                                    <FiX />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 flex flex-col items-center justify-center">
                                        <div className="bg-gray-50 p-4 rounded-full mb-3">
                                            <FiInfo className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <p>No pending store requests found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Request Detail Modal */}
            {selectedRequest && createPortal(
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
                            <h3 className="text-xl font-bold text-gray-900">Request Details</h3>
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">Store Information</label>
                                <div className="mt-2 space-y-2">
                                    <p><span className="font-medium">Name:</span> {selectedRequest.name}</p>
                                    <p><span className="font-medium">Description:</span> <span className="text-gray-600">{selectedRequest.description}</span></p>
                                </div>
                            </div>
                            <hr className="border-gray-100" />
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">Owner Information</label>
                                <div className="mt-2 space-y-2">
                                    <p><span className="font-medium">Name:</span> {selectedRequest.owner?.name}</p>
                                    <p><span className="font-medium">Email:</span> {selectedRequest.owner?.email}</p>
                                    <p><span className="font-medium">User ID:</span> <span className="font-mono text-xs bg-gray-100 px-1 rounded">{selectedRequest.owner?._id}</span></p>
                                </div>
                            </div>
                            <hr className="border-gray-100" />
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">Business Details</label>
                                <div className="mt-2 space-y-2">
                                    <p><span className="font-medium">Phone:</span> {selectedRequest.phone}</p>
                                    <p>
                                        <span className="font-medium">Address:</span>{' '}
                                        {typeof selectedRequest.address === 'object' && selectedRequest.address !== null
                                            ? `${selectedRequest.address.street || ''}, ${selectedRequest.address.city || ''} ${selectedRequest.address.state || ''}`
                                            : selectedRequest.address || 'N/A'}
                                    </p>
                                    <p><span className="font-medium">Tax ID:</span> {selectedRequest.taxId || 'N/A'}</p>
                                </div>
                            </div>
                            <hr className="border-gray-100" />
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">System Info</label>
                                <div className="mt-2 space-y-2">
                                    <p><span className="font-medium">Request Date:</span> {new Date(selectedRequest.createdAt).toLocaleString()}</p>
                                    <p><span className="font-medium">Status:</span> <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full uppercase font-bold">{selectedRequest.status}</span></p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
                            <button
                                onClick={() => setSelectedRequest(null)}
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

export default StoreRequestsPage;
