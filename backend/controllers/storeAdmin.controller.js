const Store = require('../models/Store');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { uploadToGridFS, deleteFromGridFS } = require('../utils/fileUpload');
const { getFileUrl } = require('../utils/url');

const resolveStoreForAdmin = async (user) => {
    if (user.storeId) {
        const storeById = await Store.findById(user.storeId);
        if (storeById) return storeById;
    }

    const storeByOwner = await Store.findOne({ owner: user._id });
    if (storeByOwner) {
        if (!user.storeId || user.storeId.toString() !== storeByOwner._id.toString()) {
            user.storeId = storeByOwner._id;
            await user.save();
        }
        return storeByOwner;
    }

    if (user.storeId) {
        user.storeId = null;
        await user.save();
    }

    return null;
};

// @desc    Register a new store
// @route   POST /api/store-admin/register
// @access  Private/StoreAdmin
const registerStore = async (req, res, next) => {
    try {
        const {
            name,
            description,
            email,
            phone,
            address,
            businessLicense,
            taxId,
        } = req.body;

        // Check if user already has a store
        const existingStore = await Store.findOne({ owner: req.user._id });
        if (existingStore) {
            return res.status(400).json({
                success: false,
                message: 'You already have a registered store',
            });
        }

        const store = await Store.create({
            name,
            description,
            email,
            phone,
            address,
            businessLicense,
            taxId,
            owner: req.user._id,
        });

        // Update user's storeId
        req.user.storeId = store._id;
        await req.user.save();

        res.status(201).json({
            success: true,
            message: 'Store registration submitted successfully',
            data: store,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get store dashboard
// @route   GET /api/store-admin/dashboard
// @access  Private/StoreAdmin
const getDashboard = async (req, res, next) => {
    try {
        console.log('Dashboard Request User:', req.user._id);
        const store = await resolveStoreForAdmin(req.user);

        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found',
            });
        }

        const totalProducts = await Product.countDocuments({ store: store._id });
        const totalOrders = await Order.countDocuments({ store: store._id });

        const revenueData = await Order.aggregate([
            { $match: { store: store._id, paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$total' } } },
        ]);

        const recentOrders = await Order.find({ store: store._id })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('customer', 'name email');

        res.json({
            success: true,
            data: {
                store,
                stats: {
                    totalProducts,
                    totalOrders,
                    totalRevenue: revenueData[0]?.total || 0,
                    averageRating: store.analytics?.averageRating ?? 0,
                },
                recentOrders,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update store profile
// @route   PUT /api/store-admin/profile
// @access  Private/StoreAdmin
const updateProfile = async (req, res, next) => {
    try {
        const store = await resolveStoreForAdmin(req.user);

        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found',
            });
        }

        const allowedUpdates = [
            'name',
            'description',
            'email',
            'phone',
            'address',
            'settings',
            'paymentInfo',
        ];

        Object.keys(req.body).forEach((key) => {
            if (allowedUpdates.includes(key)) {
                store[key] = req.body[key];
            }
        });

        // Handle logo upload
        if (req.files && req.files.logo) {
            const logoFile = req.files.logo[0];
            const uploadedLogo = await uploadToGridFS(logoFile);
            store.logo = getFileUrl(req, uploadedLogo.fileId);
        }

        // Handle banner upload
        if (req.files && req.files.banner) {
            const bannerFile = req.files.banner[0];
            const uploadedBanner = await uploadToGridFS(bannerFile);
            store.banner = getFileUrl(req, uploadedBanner.fileId);
        }

        await store.save();

        res.json({
            success: true,
            message: 'Store profile updated successfully',
            data: store,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add store manager
// @route   POST /api/store-admin/managers
// @access  Private/StoreAdmin
const addManager = async (req, res, next) => {
    try {
        const { email, name, phone, password } = req.body;

        const store = await resolveStoreForAdmin(req.user);

        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found',
            });
        }

        // Create manager user
        const manager = await User.create({
            name,
            email,
            phone,
            password,
            role: 'store_manager',
            storeId: store._id,
            assignedBy: req.user._id,
        });

        // Add to store's managers array
        store.managers.push(manager._id);
        await store.save();

        res.status(201).json({
            success: true,
            message: 'Manager added successfully',
            data: manager,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all managers
// @route   GET /api/store-admin/managers
// @access  Private/StoreAdmin
const getManagers = async (req, res, next) => {
    try {
        const store = await resolveStoreForAdmin(req.user);

        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found',
            });
        }

        await store.populate('managers', 'name email phone isActive');

        res.json({
            success: true,
            data: store.managers,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a product
// @route   POST /api/store-admin/products
// @access  Private/StoreAdmin
const createProduct = async (req, res, next) => {
    try {
        const store = await resolveStoreForAdmin(req.user);
        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found',
            });
        }

        const productData = {
            ...req.body,
            store: store._id,
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
            data: product,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all store products
// @route   GET /api/store-admin/products
// @access  Private/StoreAdmin
const getProducts = async (req, res, next) => {
    try {
        const store = await resolveStoreForAdmin(req.user);
        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found',
            });
        }

        const products = await Product.find({ store: store._id })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: products.length,
            data: products,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single store product
// @route   GET /api/store-admin/products/:id
// @access  Private/StoreAdmin
const getProduct = async (req, res, next) => {
    try {
        const store = await resolveStoreForAdmin(req.user);
        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found',
            });
        }

        const product = await Product.findOne({
            _id: req.params.id,
            store: store._id,
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        res.json({
            success: true,
            data: product,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update product
// @route   PUT /api/store-admin/products/:id
// @access  Private/StoreAdmin
const updateProduct = async (req, res, next) => {
    try {
        const store = await resolveStoreForAdmin(req.user);
        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found',
            });
        }

        const product = await Product.findOne({
            _id: req.params.id,
            store: store._id,
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
            data: product,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete product
// @route   DELETE /api/store-admin/products/:id
// @access  Private/StoreAdmin
const deleteProduct = async (req, res, next) => {
    try {
        const store = await resolveStoreForAdmin(req.user);
        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found',
            });
        }

        const product = await Product.findOne({
            _id: req.params.id,
            store: store._id,
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
            data: {},
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get store orders
// @route   GET /api/store-admin/orders
// @access  Private/StoreAdmin
const getOrders = async (req, res, next) => {
    try {
        const store = await resolveStoreForAdmin(req.user);
        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found',
            });
        }

        const orders = await Order.find({ store: store._id })
            .populate('customer', 'name email avatar')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: orders.length,
            data: orders,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single order
// @route   GET /api/store-admin/orders/:id
// @access  Private/StoreAdmin
const getOrder = async (req, res, next) => {
    try {
        const store = await resolveStoreForAdmin(req.user);
        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found',
            });
        }

        const order = await Order.findOne({
            _id: req.params.id,
            store: store._id,
        })
            .populate('customer', 'name email avatar phone')
            .populate('items.product', 'name price images');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        res.json({
            success: true,
            data: order,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update order status
// @route   PATCH /api/store-admin/orders/:id/status
// @access  Private/StoreAdmin
const updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        const store = await resolveStoreForAdmin(req.user);
        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found',
            });
        }

        let order = await Order.findOne({
            _id: req.params.id,
            store: store._id,
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        order.status = status;

        // If delivered, update delivery date
        if (status === 'delivered') {
            order.deliveredAt = Date.now();
            order.paymentStatus = 'paid'; // Assume paid on delivery if COD, or redundant
        }

        await order.save();

        res.json({
            success: true,
            data: order,
        });
    } catch (error) {
        next(error);
    }
};

const getAnalytics = async (req, res, next) => {
    try {
        const store = await resolveStoreForAdmin(req.user);
        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found',
            });
        }

        const storeId = store._id;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Daily Sales
        const salesData = await Order.aggregate([
            { $match: { store: storeId, createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalSales: { $sum: "$total" },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Top Products
        const topProducts = await Order.aggregate([
            { $match: { store: storeId } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.product",
                    name: { $first: "$items.name" },
                    totalSold: { $sum: "$items.quantity" },
                    revenue: { $sum: "$items.subtotal" }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);

        res.json({
            success: true,
            data: {
                sales: salesData,
                topProducts: topProducts
            }
        });


    } catch (error) {
        next(error);
    }
};

// @desc    Update store manager
// @route   PUT /api/store-admin/managers/:id
// @access  Private/StoreAdmin
const updateManager = async (req, res, next) => {
    try {
        const { name, email, phone, password } = req.body;
        const managerId = req.params.id;

        const store = await resolveStoreForAdmin(req.user);
        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found',
            });
        }

        // Verify manager belongs to this store
        if (!store.managers.includes(managerId)) {
            return res.status(404).json({
                success: false,
                message: 'Manager not found in this store',
            });
        }

        const manager = await User.findById(managerId);
        if (!manager) {
            return res.status(404).json({
                success: false,
                message: 'Manager user not found',
            });
        }

        manager.name = name || manager.name;
        manager.email = email || manager.email;
        manager.phone = phone || manager.phone;
        if (password) {
            manager.password = password;
        }

        await manager.save();

        res.json({
            success: true,
            message: 'Manager updated successfully',
            data: manager,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete store manager
// @route   DELETE /api/store-admin/managers/:id
// @access  Private/StoreAdmin
const deleteManager = async (req, res, next) => {
    try {
        const managerId = req.params.id;

        const store = await resolveStoreForAdmin(req.user);
        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found',
            });
        }

        // Verify manager belongs to this store
        if (!store.managers.includes(managerId)) {
            return res.status(404).json({
                success: false,
                message: 'Manager not found in this store',
            });
        }

        // Remove from store's managers array
        store.managers = store.managers.filter(id => id.toString() !== managerId);
        await store.save();

        // Delete the user
        await User.findByIdAndDelete(managerId);

        res.json({
            success: true,
            message: 'Manager deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle manager status (active/inactive)
// @route   PATCH /api/store-admin/managers/:id/status
// @access  Private/StoreAdmin
const toggleManagerStatus = async (req, res, next) => {
    try {
        const managerId = req.params.id;
        const { isActive } = req.body; // Expect boolean

        const store = await resolveStoreForAdmin(req.user);
        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found',
            });
        }

        // Verify manager belongs to this store
        if (!store.managers.includes(managerId)) {
            return res.status(404).json({
                success: false,
                message: 'Manager not found in this store',
            });
        }

        const manager = await User.findById(managerId);
        if (!manager) {
            return res.status(404).json({
                success: false,
                message: 'Manager user not found',
            });
        }

        manager.isActive = isActive;
        await manager.save();

        res.json({
            success: true,
            message: `Manager ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: manager,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerStore,
    getDashboard,
    updateProfile,
    addManager,
    getManagers,
    updateManager,
    deleteManager,
    toggleManagerStatus,
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    getOrders,
    getOrder,
    updateOrderStatus,
    getAnalytics,
};
