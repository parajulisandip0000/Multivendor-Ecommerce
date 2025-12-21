import { useState, useEffect } from 'react';
import { superAdminService } from '../../services';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { FiTrendingUp, FiUsers, FiShoppingBag, FiGlobe } from 'react-icons/fi';
import { toast } from 'react-toastify';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminAnalyticsPage = () => {
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState('7d');
    const [data, setData] = useState({
        revenue: [],
        users: [],
        topStores: [],
        categories: []
    });

    useEffect(() => {
        fetchAnalytics();
    }, [range]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await superAdminService.getPlatformAnalytics(range);
            if (response.success) {
                setData(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
            toast.error('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SuperAdminLayout>
                <div className="flex h-96 items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </SuperAdminLayout>
        );
    }

    return (
        <SuperAdminLayout>
            <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
                    <p className="text-gray-500">Comprehensive insights into platform performance</p>
                </div>
                <div className="bg-white p-1 rounded-lg border border-gray-200">
                    {['7d', '30d', '90d'].map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${range === r
                                ? 'bg-primary-50 text-primary-700 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Last {r.replace('d', ' Days')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Revenue Chart */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <FiTrendingUp className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Revenue Trends</h3>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.revenue}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="_id" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rs.${value}`} />
                                <Tooltip
                                    formatter={(value) => [`Rs. ${value.toLocaleString()}`, 'Revenue']}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* User Growth Chart */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <FiUsers className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">User Growth</h3>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.users}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="_id" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip
                                    cursor={{ fill: '#f3f4f6' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Stores */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <FiShoppingBag className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Top Stores by Revenue</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase">
                                    <th className="pb-3 font-semibold">Rank</th>
                                    <th className="pb-3 font-semibold">Store Name</th>
                                    <th className="pb-3 font-semibold text-right">Orders</th>
                                    <th className="pb-3 font-semibold text-right">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data.topStores.length > 0 ? (
                                    data.topStores.map((store, index) => (
                                        <tr key={store._id} className="hover:bg-gray-50">
                                            <td className="py-4 text-sm font-medium text-gray-500">#{index + 1}</td>
                                            <td className="py-4 text-sm font-medium text-gray-900">{store.name}</td>
                                            <td className="py-4 text-sm text-gray-600 text-right">{store.orders}</td>
                                            <td className="py-4 text-sm font-bold text-primary-600 text-right">Rs. {store.revenue.toLocaleString()}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="py-8 text-center text-gray-400">No data available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Category Distribution */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                            <FiGlobe className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Category Share</h3>
                    </div>
                    <div className="h-64 w-full relative">
                        {data.categories.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.categories}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="count"
                                        nameKey="_id"
                                    >
                                        {data.categories.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        formatter={(value) => <span className="text-xs text-gray-500 ml-1">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                                No category data
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </SuperAdminLayout>
    );
};

export default AdminAnalyticsPage;
