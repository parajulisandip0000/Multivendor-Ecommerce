const Store = require('../models/Store');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const SystemLog = require('../models/SystemLog');

// Helper to create log
const createLog = async (action, user, details, req, level = 'info') => {
    try {
        await SystemLog.create({
            action,
            user,
            details,
            ip: req.ip,
            level
        });
    } catch (error) {
        console.error('Failed to create system log:', error);
    }
};

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

        await createLog('APPROVE_STORE', req.user._id, { storeId: store._id, storeName: store.name }, req, 'info');

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

        await createLog('REJECT_STORE', req.user._id, { storeId: store._id, storeName: store.name, reason }, req, 'warning');

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
        const { page = 1, limit = 10, status, search } = req.query;

        let query = {};

        if (status) {
            query.status = status;
        }

        if (search) {
            query.$text = { $search: search };
        }

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

// @desc    Update store status (Suspend/Activate)
// @route   PUT /api/superadmin/stores/:storeId/status
// @access  Private/SuperAdmin
const updateStoreStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!['approved', 'suspended'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Use approved or suspended.',
            });
        }

        const store = await Store.findById(req.params.storeId);

        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found',
            });
        }

        const oldStatus = store.status;
        store.status = status;
        await store.save();

        const logAction = status === 'suspended' ? 'SUSPEND_STORE' : 'ACTIVATE_STORE';
        const logLevel = status === 'suspended' ? 'danger' : 'info';

        await createLog(logAction, req.user._id, {
            storeId: store._id,
            storeName: store.name,
            oldStatus,
            newStatus: status
        }, req, logLevel);

        res.json({
            success: true,
            message: `Store ${status === 'suspended' ? 'suspended' : 'activated'} successfully`,
            data: store,
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
        const { page = 1, limit = 10, role, search } = req.query;

        let query = {};

        if (role) {
            query.role = role;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

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

// @desc    Update user status (Ban/Unban)
// @route   PUT /api/superadmin/users/:userId/status
// @access  Private/SuperAdmin
const updateUserStatus = async (req, res, next) => {
    try {
        const { isActive } = req.body;
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Prevent banning superadmin himself or other superadmins (optional but good practice)
        if (user.role === 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot change status of a SuperAdmin',
            });
        }

        user.isActive = isActive;
        await user.save();

        const logAction = isActive ? 'UNBAN_USER' : 'BAN_USER';
        const logLevel = isActive ? 'info' : 'danger';

        await createLog(logAction, req.user._id, {
            targetUserId: user._id,
            targetUserEmail: user.email,
            newStatus: isActive ? 'active' : 'banned'
        }, req, logLevel);

        res.json({
            success: true,
            message: `User ${isActive ? 'activated' : 'banned'} successfully`,
            data: { _id: user._id, isActive: user.isActive },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all products
// @route   GET /api/superadmin/products
// @access  Private/SuperAdmin
const getAllProducts = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search } = req.query;

        let query = {};

        if (search) {
            query.$text = { $search: search };
        }

        const products = await Product.find(query)
            .populate('store', 'name')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Product.countDocuments(query);

        res.json({
            success: true,
            data: products,
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

// @desc    Delete product (Force delete)
// @route   DELETE /api/superadmin/products/:productId
// @access  Private/SuperAdmin
const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        await product.deleteOne();

        await createLog('DELETE_PRODUCT', req.user._id, {
            productId: product._id,
            productName: product.name,
            storeId: product.store
        }, req, 'warning');

        res.json({
            success: true,
            message: 'Product deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get system logs
// @route   GET /api/superadmin/logs
// @access  Private/SuperAdmin
const getSystemLogs = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, level, search } = req.query;

        let query = {};
        if (level) query.level = level;

        // Basic search in action string or details
        if (search) {
            query.$or = [
                { action: { $regex: search, $options: 'i' } },
            ];
        }

        const logs = await SystemLog.find(query)
            .populate('user', 'name email role')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await SystemLog.countDocuments(query);

        res.json({
            success: true,
            data: logs,
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

        await createLog('UPDATE_SETTINGS', req.user._id, { updatedFields: req.body }, req, 'warning');

        res.json({
            success: true,
            data: settings,
            message: 'System settings updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get platform analytics (charts data)
// @route   GET /api/superadmin/analytics
// @access  Private/SuperAdmin
const getPlatformAnalytics = async (req, res, next) => {
    try {
        const { range = '7d' } = req.query; // 7d, 30d, 90d

        // Calculate start date based on range
        const startDate = new Date();
        if (range === '30d') startDate.setDate(startDate.getDate() - 30);
        else if (range === '90d') startDate.setDate(startDate.getDate() - 90);
        else startDate.setDate(startDate.getDate() - 7);

        // 1. Revenue & Orders Over Time
        const revenueData = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    paymentStatus: 'paid'
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$total" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 2. User Growth Over Time
        const userGrowth = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    users: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 3. Top Performing Stores (by Revenue) in the selected range
        const topStores = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    paymentStatus: 'paid'
                }
            },
            {
                $group: {
                    _id: "$store",
                    revenue: { $sum: "$total" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "stores",
                    localField: "_id",
                    foreignField: "_id",
                    as: "storeDetails"
                }
            },
            {
                $project: {
                    name: { $arrayElemAt: ["$storeDetails.name", 0] },
                    revenue: 1,
                    orders: 1
                }
            }
        ]);

        // 4. Category Distribution (Product Count - All Time)
        // Using all time data for categories as it's a structural metric
        const categoryDist = await Product.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.json({
            success: true,
            data: {
                revenue: revenueData,
                users: userGrowth,
                topStores,
                categories: categoryDist
            }
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
    updateStoreStatus,
    getAllUsers,
    updateUserStatus,
    getAllProducts,
    deleteProduct,
    getSystemLogs,
    getSystemSettings,
    updateSystemSettings,
    getPlatformAnalytics
};
