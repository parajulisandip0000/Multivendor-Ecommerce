import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { superAdminService } from '../../services';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import { FiSearch, FiActivity, FiAlertCircle, FiInfo, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

const AdminLogsPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [levelFilter, setLevelFilter] = useState('');

    useEffect(() => {
        fetchLogs();
    }, [page, search, levelFilter]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await superAdminService.getSystemLogs({ page, limit: 20, search, level: levelFilter });
            if (response.success) {
                setLogs(response.data);
                setTotalPages(response.pagination.pages);
            }
        } catch (error) {
            toast.error('Failed to load logs');
        } finally {
            setLoading(false);
        }
    };

    const getLevelIcon = (level) => {
        switch (level) {
            case 'danger': return <FiAlertCircle className="text-red-500" />;
            case 'warning': return <FiActivity className="text-orange-500" />;
            default: return <FiInfo className="text-blue-500" />;
        }
    };

    const [selectedLog, setSelectedLog] = useState(null);

    return (
        <SuperAdminLayout>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">System Logs</h1>
                    <p className="text-gray-500">Audit trail of administrative actions.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <select
                        value={levelFilter}
                        onChange={(e) => setLevelFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                        <option value="">All Levels</option>
                        <option value="info">Info</option>
                        <option value="warning">Warning</option>
                        <option value="danger">Danger</option>
                    </select>
                    <div className="relative w-full md:w-64">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                                <th className="px-6 py-3 font-semibold">Action</th>
                                <th className="px-6 py-3 font-semibold">User</th>
                                <th className="px-6 py-3 font-semibold">Details</th>
                                <th className="px-6 py-3 font-semibold">IP</th>
                                <th className="px-6 py-3 font-semibold">Time</th>
                                <th className="px-6 py-3 font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-400">Loading logs...</td>
                                </tr>
                            ) : logs.length > 0 ? (
                                logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2">
                                                {getLevelIcon(log.level)}
                                                <span className="font-medium text-gray-900">{log.action}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-gray-600">
                                            {log.user?.email || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-3 text-gray-500 max-w-xs truncate">
                                            {JSON.stringify(log.details)}
                                        </td>
                                        <td className="px-6 py-3 text-gray-500 font-mono text-xs">
                                            {log.ip}
                                        </td>
                                        <td className="px-6 py-3 text-gray-500">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <button
                                                onClick={() => setSelectedLog(log)}
                                                className="text-primary-600 hover:text-primary-800 text-xs font-semibold"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">No logs found.</td>
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

            {/* Log Detail Modal */}
            {selectedLog && createPortal(
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                {getLevelIcon(selectedLog.level)}
                                {selectedLog.action}
                            </h3>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">User</p>
                                    <p className="text-gray-900">{selectedLog.user?.email} ({selectedLog.user?.role})</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Timestamp</p>
                                    <p className="text-gray-900">{new Date(selectedLog.createdAt).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">IP Address</p>
                                    <p className="text-gray-900 font-mono">{selectedLog.ip}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Log Level</p>
                                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mt-1
                                        ${selectedLog.level === 'danger' ? 'bg-red-100 text-red-700' :
                                            selectedLog.level === 'warning' ? 'bg-orange-100 text-orange-700' :
                                                'bg-blue-100 text-blue-700'}`}>
                                        {selectedLog.level.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 font-medium mb-2">Change Details</p>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 font-mono text-sm overflow-x-auto">
                                    <pre className="text-gray-800 wrap-words whitespace-pre-wrap">
                                        {JSON.stringify(selectedLog.details, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={() => setSelectedLog(null)}
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

export default AdminLogsPage;
