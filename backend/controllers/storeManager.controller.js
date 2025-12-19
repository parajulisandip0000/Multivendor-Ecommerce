const Product = require('../models/Product');
const Order = require('../models/Order');
const { uploadToGridFS, deleteFromGridFS } = require('../utils/fileUpload');

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

        // Handle image uploads if files are present
        if (req.files && req.files.length > 0) {
            const imagePromises = req.files.map((file) => uploadToGridFS(file));
            const uploadedImages = await Promise.all(imagePromises);

            productData.images = uploadedImages.map((img, index) => ({
                fileId: img.fileId,
                url: `/api/files/${img.fileId}`,
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
            product[key] = req.body[key];
        });

        // Handle new image uploads
        if (req.files && req.files.length > 0) {
            const imagePromises = req.files.map((file) => uploadToGridFS(file));
            const uploadedImages = await Promise.all(imagePromises);

            const newImages = uploadedImages.map((img) => ({
                fileId: img.fileId,
                url: `/api/files/${img.fileId}`,
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

module.exports = {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getOrders,
    updateOrderStatus,
};
