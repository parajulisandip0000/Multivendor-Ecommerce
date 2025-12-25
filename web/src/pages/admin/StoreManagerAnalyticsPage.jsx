import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { FiTrendingUp, FiBox } from 'react-icons/fi';
import StoreManagerLayout from '../../components/StoreManagerLayout';
import { storeManagerService } from '../../services';

const StoreManagerAnalyticsPage = () => {
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);
    const [data, setData] = useState({ sales: [], topProducts: [], totals: {} });

    useEffect(() => {
        fetchAnalytics();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [days]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await storeManagerService.getAnalytics({ days });
            if (response.success) {
                setData(response.data);
            }
        } catch (error) {
            console.error('Failed to load analytics:', error);
            toast.error(error.response?.data?.message || 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <StoreManagerLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                </div>
            </StoreManagerLayout>
        );
    }

    return (
        <StoreManagerLayout>
            <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Store Analytics</h1>
                    <p className="text-gray-500">Performance metrics for the selected range</p>
                </div>
                <div className="bg-white p-1 rounded-lg border border-gray-200">
                    {[7, 30, 90].map((d) => (
                        <button
                            key={d}
                            onClick={() => setDays(d)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${days === d
                                ? 'bg-primary-50 text-primary-700 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Last {d} Days
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{data.totals?.totalOrders ?? 0}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500">Total Sales</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">NRS {(data.totals?.totalSales ?? 0).toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500">Paid Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">NRS {(data.totals?.totalPaidRevenue ?? 0).toLocaleString()}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                        <FiTrendingUp className="text-green-500" />
                        Sales Trend
                    </h2>
                </div>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.sales || []}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="_id"
                                tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            />
                            <YAxis />
                            <Tooltip
                                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                                formatter={(value) => [`NRS ${Number(value).toLocaleString()}`, 'Sales']}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="totalSales"
                                stroke="#4F46E5"
                                strokeWidth={2}
                                name="Revenue"
                                dot={{ r: 4 }}
                                activeDot={{ r: 8 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                        <FiBox className="text-purple-500" />
                        Top Performing Products
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                                <th className="px-6 py-3 font-semibold">Product Name</th>
                                <th className="px-6 py-3 font-semibold text-center">Units Sold</th>
                                <th className="px-6 py-3 font-semibold text-right">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {(data.topProducts || []).length > 0 ? (
                                data.topProducts.map((product) => (
                                    <tr key={product._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {product.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 text-center">
                                            {product.totalSold}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                                            NRS {Number(product.revenue || 0).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                                        No sales data available yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </StoreManagerLayout>
    );
};

export default StoreManagerAnalyticsPage;

