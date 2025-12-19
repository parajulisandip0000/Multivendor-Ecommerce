const Store = require('../models/Store');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Get platform dashboard analytics
// @route   GET /api/superadmin/dashboard
// @access  Private/SuperAdmin
const getDashboard = async (req, res, next) => {
    try {
        const totalStores = await Store.countDocuments();
        const pendingStores = await Store.countDocuments({ status: 'pending' });
        const approvedStores = await Store.countDocuments({ status: 'approved' });
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();

        const totalRevenue = await Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$total' } } },
        ]);

        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('customer', 'name email')
            .populate('store', 'name');

        res.json({
            success: true,
            data: {
                stats: {
                    totalStores,
                    pendingStores,
                    approvedStores,
                    totalUsers,
                    totalProducts,
                    totalOrders,
                    totalRevenue: totalRevenue[0]?.total || 0,
                },
                recentOrders,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all store registration requests
// @route   GET /api/superadmin/stores/requests
// @access  Private/SuperAdmin
const getStoreRequests = async (req, res, next) => {
    try {
        const { status = 'pending' } = req.query;

        const stores = await Store.find({ status })
            .populate('owner', 'name email phone')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: stores,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Approve store registration
// @route   PUT /api/superadmin/stores/:storeId/approve
// @access  Private/SuperAdmin
const approveStore = async (req, res, next) => {
    try {
        const store = await Store.findById(req.params.storeId);

        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found',
            });
        }

        store.status = 'approved';
        await store.save();

        res.json({
            success: true,
            message: 'Store approved successfully',
            data: store,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Reject store registration
// @route   PUT /api/superadmin/stores/:storeId/reject
// @access  Private/SuperAdmin
const rejectStore = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const store = await Store.findById(req.params.storeId);

        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found',
            });
        }

        store.status = 'rejected';
        store.rejectionReason = reason;
        await store.save();

        res.json({
            success: true,
            message: 'Store rejected',
            data: store,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all stores
// @route   GET /api/superadmin/stores
// @access  Private/SuperAdmin
const getAllStores = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status } = req.query;

        const query = status ? { status } : {};

        const stores = await Store.find(query)
            .populate('owner', 'name email')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Store.countDocuments(query);

        res.json({
            success: true,
            data: stores,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit),
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users
// @route   GET /api/superadmin/users
// @access  Private/SuperAdmin
const getAllUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, role } = req.query;

        const query = role ? { role } : {};

        const users = await User.find(query)
            .select('-password')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await User.countDocuments(query);

        res.json({
            success: true,
            data: users,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit),
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get system settings
// @route   GET /api/superadmin/settings
// @access  Private/SuperAdmin
const getSystemSettings = async (req, res, next) => {
    try {
        const SystemSettings = require('../models/systemSettings.model');
        const settings = await SystemSettings.getSettings();

        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update system settings
// @route   PUT /api/superadmin/settings
// @access  Private/SuperAdmin
const updateSystemSettings = async (req, res, next) => {
    try {
        const SystemSettings = require('../models/systemSettings.model');
        const { rateLimiting } = req.body;

        let settings = await SystemSettings.getSettings();

        if (rateLimiting) {
            settings.rateLimiting = { ...settings.rateLimiting, ...rateLimiting };
        }

        settings.updatedBy = req.user._id;
        await settings.save();

        // Update global cache
        global.systemSettings = settings;
        console.log('System settings updated via API:', settings.rateLimiting);

        res.json({
            success: true,
            data: settings,
            message: 'System settings updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboard,
    getStoreRequests,
    approveStore,
    rejectStore,
    getAllStores,
    getAllUsers,
    getSystemSettings,
    updateSystemSettings
};
