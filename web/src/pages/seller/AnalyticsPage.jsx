import { useState, useEffect } from 'react';
import { storeAdminService } from '../../services';
import SellerDashboardLayout from '../../components/SellerDashboardLayout';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from 'recharts';
import { FiTrendingUp, FiBox } from 'react-icons/fi';

const AnalyticsPage = () => {
    const [data, setData] = useState({ sales: [], topProducts: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await storeAdminService.getAnalytics();
            if (response.success) {
                setData(response.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SellerDashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                </div>
            </SellerDashboardLayout>
        );
    }

    if (error) {
        return (
            <SellerDashboardLayout>
                <div className="text-center py-12">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                        onClick={fetchAnalytics}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg"
                    >
                        Retry
                    </button>
                </div>
            </SellerDashboardLayout>
        );
    }

    return (
        <SellerDashboardLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Store Analytics</h1>
                <p className="text-gray-500">Performance metrics for the last 30 days</p>
            </div>

            {/* Sales Chart */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                        <FiTrendingUp className="text-green-500" />
                        Sales Trend
                    </h2>
                </div>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.sales}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="_id"
                                tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            />
                            <YAxis />
                            <Tooltip
                                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                                formatter={(value) => [`NRS ${value.toLocaleString()}`, 'Sales']}
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

            {/* Top Products */}
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
                            {data.topProducts.length > 0 ? (
                                data.topProducts.map((product) => (
                                    <tr key={product._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {product.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 text-center">
                                            {product.totalSold}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                                            NRS {product.revenue.toLocaleString()}
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
        </SellerDashboardLayout>
    );
};

export default AnalyticsPage;
