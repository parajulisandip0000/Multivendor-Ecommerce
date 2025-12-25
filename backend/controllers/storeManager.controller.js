const Product = require('../models/Product');
const Order = require('../models/Order');
const Store = require('../models/Store');
const { uploadToGridFS, deleteFromGridFS } = require('../utils/fileUpload');
const { getFileUrl } = require('../utils/url');

// @desc    Get store manager dashboard stats
// @route   GET /api/store-manager/dashboard
// @access  Private/StoreManager
const getDashboard = async (req, res, next) => {
    try {
        const storeId = req.user.storeId;

        if (!storeId) {
            return res.status(400).json({
                success: false,
                message: 'User is not assigned to a store',
            });
        }

        // Parallel fetch for potential performance boost
        const [
            totalProducts,
            totalOrders,
            pendingOrders,
            totalRevenuePaid,
            recentOrders,
            store,
            lowStockProducts
        ] = await Promise.all([
            Product.countDocuments({ store: storeId }),
            Order.countDocuments({ store: storeId }),
            Order.countDocuments({ store: storeId, status: 'processing' }), // Assuming 'processing' as pending
            Order.aggregate([
                { $match: { store: storeId, paymentStatus: 'paid' } },
                { $group: { _id: null, total: { $sum: '$total' } } },
            ]),
            Order.find({ store: storeId })
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('customer', 'name email'),
            Store.findById(storeId).select('name logo banner status settings'),
            Product.find({ store: storeId, quantity: { $lte: 5 } }) // Simple low stock check
                .limit(5)
                .select('name quantity images')
        ]);

        res.json({
            success: true,
            data: {
                store,
                stats: {
                    totalProducts,
                    totalOrders,
                    pendingOrders,
                    totalRevenue: totalRevenuePaid?.[0]?.total || 0,
                },
                recentOrders,
                lowStockProducts
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all products for manager's store
// @route   GET /api/store-manager/products
// @access  Private/StoreManager
const getProducts = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status } = req.query;

        const query = { store: req.user.storeId };
        if (status) query.status = status;

        const products = await Product.find(query)
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

// @desc    Create new product
// @route   POST /api/store-manager/products
// @access  Private/StoreManager
const createProduct = async (req, res, next) => {
    try {
        const productData = {
            ...req.body,
            store: req.user.storeId,
        };

        // Images are managed via file uploads only (prevent invalid body payloads from breaking validation)
        delete productData.images;

        // Handle image uploads if files are present
        if (req.files && req.files.length > 0) {
            const imagePromises = req.files.map((file) => uploadToGridFS(file));
            const uploadedImages = await Promise.all(imagePromises);

            productData.images = uploadedImages.map((img, index) => ({
                fileId: img.fileId,
                url: getFileUrl(req, img.fileId),
                isDefault: index === 0,
            }));
        }

        const product = await Product.create(productData);

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update product
// @route   PUT /api/store-manager/products/:productId
// @access  Private/StoreManager
const updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findOne({
            _id: req.params.productId,
            store: req.user.storeId,
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        Object.keys(req.body).forEach((key) => {
            if (key === 'images' || key === 'store') return;
            product[key] = req.body[key];
        });

        // Handle new image uploads
        if (req.files && req.files.length > 0) {
            const imagePromises = req.files.map((file) => uploadToGridFS(file));
            const uploadedImages = await Promise.all(imagePromises);

            const newImages = uploadedImages.map((img) => ({
                fileId: img.fileId,
                url: getFileUrl(req, img.fileId),
                isDefault: false,
            }));

            product.images.push(...newImages);
        }

        await product.save();

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: product,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete product
// @route   DELETE /api/store-manager/products/:productId
// @access  Private/StoreManager
const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findOne({
            _id: req.params.productId,
            store: req.user.storeId,
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        // Delete associated images from GridFS
        if (product.images && product.images.length > 0) {
            const deletePromises = product.images.map((img) =>
                deleteFromGridFS(img.fileId)
            );
            await Promise.all(deletePromises);
        }

        await product.deleteOne();

        res.json({
            success: true,
            message: 'Product deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all orders for manager's store
// @route   GET /api/store-manager/orders
// @access  Private/StoreManager
const getOrders = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status } = req.query;

        const query = { store: req.user.storeId };
        if (status) query.status = status;

        const orders = await Order.find(query)
            .populate('customer', 'name email phone')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Order.countDocuments(query);

        res.json({
            success: true,
            data: orders,
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

// @desc    Update order status
// @route   PUT /api/store-manager/orders/:orderId/status
// @access  Private/StoreManager
const updateOrderStatus = async (req, res, next) => {
    try {
        const { status, note } = req.body;

        const order = await Order.findOne({
            _id: req.params.orderId,
            store: req.user.storeId,
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        order.status = status;
        order.statusHistory.push({
            status,
            note,
            updatedBy: req.user._id,
        });

        if (status === 'cancelled') {
            order.cancelledBy = req.user._id;
            order.cancelledAt = new Date();
            order.cancellationReason = note;
        }

        await order.save();

        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: order,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get analytics for manager's store
// @route   GET /api/store-manager/analytics
// @access  Private/StoreManager
const getAnalytics = async (req, res, next) => {
    try {
        const storeId = req.user.storeId;
        if (!storeId) {
            return res.status(400).json({
                success: false,
                message: 'User is not assigned to a store',
            });
        }

        const daysRaw = Number(req.query.days ?? 30);
        const days = Number.isFinite(daysRaw) ? Math.max(1, Math.min(365, Math.floor(daysRaw))) : 30;

        const since = new Date();
        since.setDate(since.getDate() - days);

        const [salesData, topProducts, totals] = await Promise.all([
            Order.aggregate([
                { $match: { store: storeId, createdAt: { $gte: since } } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        totalSales: { $sum: '$total' },
                        orderCount: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
            Order.aggregate([
                { $match: { store: storeId } },
                { $unwind: '$items' },
                {
                    $group: {
                        _id: '$items.product',
                        name: { $first: '$items.name' },
                        totalSold: { $sum: '$items.quantity' },
                        revenue: { $sum: '$items.subtotal' },
                    },
                },
                { $sort: { totalSold: -1 } },
                { $limit: 5 },
            ]),
            Order.aggregate([
                { $match: { store: storeId } },
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        totalSales: { $sum: '$total' },
                        totalPaidRevenue: {
                            $sum: {
                                $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$total', 0],
                            },
                        },
                    },
                },
            ]),
        ]);

        res.json({
            success: true,
            data: {
                rangeDays: days,
                totals: {
                    totalOrders: totals?.[0]?.totalOrders || 0,
                    totalSales: totals?.[0]?.totalSales || 0,
                    totalPaidRevenue: totals?.[0]?.totalPaidRevenue || 0,
                },
                sales: salesData,
                topProducts,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get store settings for manager's store
// @route   GET /api/store-manager/settings
// @access  Private/StoreManager
const getStoreSettings = async (req, res, next) => {
    try {
        const storeId = req.user.storeId;
        if (!storeId) {
            return res.status(400).json({
                success: false,
                message: 'User is not assigned to a store',
            });
        }

        const store = await Store.findById(storeId).select(
            'name description email phone address logo banner settings paymentInfo status'
        );

        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found',
            });
        }

        res.json({
            success: true,
            data: store,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update store settings for manager's store
// @route   PUT /api/store-manager/settings
// @access  Private/StoreManager
const updateStoreSettings = async (req, res, next) => {
    try {
        const storeId = req.user.storeId;
        if (!storeId) {
            return res.status(400).json({
                success: false,
                message: 'User is not assigned to a store',
            });
        }

        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found',
            });
        }

        const allowedSettingsKeys = [
            'isActive',
            'acceptOrders',
            'minOrderAmount',
            'shippingFee',
            'freeShippingThreshold',
        ];
        const allowedPaymentKeys = [
            'bankName',
            'accountNumber',
            'accountName',
            'esewaId',
            'khaltiId',
        ];

        if (req.body.settings && typeof req.body.settings === 'object') {
            allowedSettingsKeys.forEach((key) => {
                if (req.body.settings[key] !== undefined) {
                    store.settings[key] = req.body.settings[key];
                }
            });
        }

        if (req.body.paymentInfo && typeof req.body.paymentInfo === 'object') {
            allowedPaymentKeys.forEach((key) => {
                if (req.body.paymentInfo[key] !== undefined) {
                    store.paymentInfo[key] = req.body.paymentInfo[key];
                }
            });
        }

        // Allow store_admin to update store profile fields from the manager panel
        if (req.user.role === 'store_admin') {
            const allowedStoreKeys = ['name', 'description', 'email', 'phone', 'address'];
            allowedStoreKeys.forEach((key) => {
                if (req.body[key] !== undefined) {
                    store[key] = req.body[key];
                }
            });
        }

        await store.save();

        res.json({
            success: true,
            message: 'Store settings updated successfully',
            data: store,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboard,
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getOrders,
    updateOrderStatus,
    getAnalytics,
    getStoreSettings,
    updateStoreSettings,
};
