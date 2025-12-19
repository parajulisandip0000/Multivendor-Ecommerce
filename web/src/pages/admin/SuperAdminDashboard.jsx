const SuperAdminDashboard = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-3xl font-bold mb-6">SuperAdmin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-600">Total Stores</h3>
                    <p className="text-3xl font-bold mt-2">0</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-600">Pending Requests</h3>
                    <p className="text-3xl font-bold mt-2">0</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-600">Total Users</h3>
                    <p className="text-3xl font-bold mt-2">0</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-600">Total Revenue</h3>
                    <p className="text-3xl font-bold mt-2">Rs. 0</p>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
