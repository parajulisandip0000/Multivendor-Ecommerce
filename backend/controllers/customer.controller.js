const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// @desc    Get cart
// @route   GET /api/customer/cart
// @access  Private/Customer
const getCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ customer: req.user._id }).populate({
            path: 'items.product',
            select: 'name price images quantity',
        });

        res.json({
            success: true,
            data: cart || { items: [] },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add item to cart
// @route   POST /api/customer/cart
// @access  Private/Customer
const addToCart = async (req, res, next) => {
    try {
        const { productId, quantity, variant } = req.body;

        let cart = await Cart.findOne({ customer: req.user._id });

        if (!cart) {
            cart = await Cart.create({
                customer: req.user._id,
                items: [{ product: productId, quantity, variant }],
            });
        } else {
            const existingItem = cart.items.find(
                (item) => item.product.toString() === productId
            );

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.items.push({ product: productId, quantity, variant });
            }

            await cart.save();
        }

        await cart.populate('items.product', 'name price images');

        res.json({
            success: true,
            message: 'Item added to cart',
            data: cart,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update cart item
// @route   PUT /api/customer/cart/:itemId
// @access  Private/Customer
const updateCartItem = async (req, res, next) => {
    try {
        const { quantity } = req.body;

        const cart = await Cart.findOne({ customer: req.user._id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found',
            });
        }

        const item = cart.items.id(req.params.itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart',
            });
        }

        item.quantity = quantity;
        await cart.save();
        await cart.populate({
            path: 'items.product',
            select: 'name price images quantity compareAtPrice reviewStats',
        });

        res.json({
            success: true,
            message: 'Cart updated',
            data: cart,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/customer/cart/:itemId
// @access  Private/Customer
const removeFromCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ customer: req.user._id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found',
            });
        }

        cart.items = cart.items.filter(
            (item) => item._id.toString() !== req.params.itemId
        );

        await cart.save();
        await cart.populate({
            path: 'items.product',
            select: 'name price images quantity compareAtPrice reviewStats',
        });

        res.json({
            success: true,
            message: 'Item removed from cart',
            data: cart,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get wishlist
// @route   GET /api/customer/wishlist
// @access  Private/Customer
const getWishlist = async (req, res, next) => {
    try {
        const wishlist = await Wishlist.findOne({ customer: req.user._id }).populate(
            'items.product',
            'name price images reviewStats'
        );

        res.json({
            success: true,
            data: wishlist || { items: [] },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add to wishlist
// @route   POST /api/customer/wishlist
// @access  Private/Customer
const addToWishlist = async (req, res, next) => {
    try {
        const { productId } = req.body;

        let wishlist = await Wishlist.findOne({ customer: req.user._id });

        if (!wishlist) {
            wishlist = await Wishlist.create({
                customer: req.user._id,
                items: [{ product: productId }],
            });
        } else {
            const exists = wishlist.items.some(
                (item) => item.product.toString() === productId
            );

            if (exists) {
                return res.status(400).json({
                    success: false,
                    message: 'Product already in wishlist',
                });
            }

            wishlist.items.push({ product: productId });
            await wishlist.save();
        }

        await wishlist.populate('items.product', 'name price images reviewStats compareAtPrice');

        res.json({
            success: true,
            message: 'Added to wishlist',
            data: wishlist,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Remove from wishlist
// @route   DELETE /api/customer/wishlist/:itemId
// @access  Private/Customer
const removeFromWishlist = async (req, res, next) => {
    try {
        const wishlist = await Wishlist.findOne({ customer: req.user._id });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist not found',
            });
        }

        wishlist.items = wishlist.items.filter(
            (item) => item._id.toString() !== req.params.itemId
        );

        await wishlist.save();
        await wishlist.populate('items.product', 'name price images reviewStats compareAtPrice');

        res.json({
            success: true,
            message: 'Removed from wishlist',
            data: wishlist,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create order
// @route   POST /api/customer/orders
// @access  Private/Customer
const createOrder = async (req, res, next) => {
    try {
        const { items, shippingAddress, paymentMethod, customerNote } = req.body;

        // Calculate totals
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId).select('name price images store');
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product ${item.productId} not found`,
                });
            }
            if (!product.store) {
                return res.status(400).json({
                    success: false,
                    message: `Product ${item.productId} is missing a store`,
                });
            }

            const itemSubtotal = product.price * item.quantity;

            orderItems.push({
                product: product._id,
                store: product.store,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                variant: item.variant,
                image: product.images[0]?.url,
                subtotal: itemSubtotal,
            });
        }

        // Group items by store and create separate orders
        const ordersByStore = {};
        orderItems.forEach((item) => {
            const storeId = item.store?.toString();
            if (!storeId) return;
            if (!ordersByStore[storeId]) {
                ordersByStore[storeId] = [];
            }
            ordersByStore[storeId].push(item);
        });

        const createdOrders = [];

        for (const [storeId, storeItems] of Object.entries(ordersByStore)) {
            const cleanItems = storeItems.map(({ store, ...rest }) => rest);
            const storeSubtotal = cleanItems.reduce((sum, item) => sum + item.subtotal, 0);
            const shippingFee = 0; // Calculate based on store settings
            const tax = 0; // Calculate if needed
            const total = storeSubtotal + shippingFee + tax;

            const order = await Order.create({
                customer: req.user._id,
                store: storeId,
                items: cleanItems,
                subtotal: storeSubtotal,
                shippingFee,
                tax,
                total,
                shippingAddress,
                paymentMethod,
                customerNote,
            });

            createdOrders.push(order);
        }

        // Clear cart after order
        await Cart.findOneAndUpdate(
            { customer: req.user._id },
            { $set: { items: [] } }
        );

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: createdOrders,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get a single customer order
// @route   GET /api/customer/orders/:id
// @access  Private/Customer
const getOrder = async (req, res, next) => {
    try {
        const id = String(req.params.id || '').trim();

        const baseQuery = { customer: req.user._id };
        let order = null;

        if (mongoose.isValidObjectId(id)) {
            order = await Order.findOne({ ...baseQuery, _id: id }).populate('store', 'name logo');
        }

        if (!order) {
            order = await Order.findOne({ ...baseQuery, orderNumber: id }).populate('store', 'name logo');
        }

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

// @desc    Get customer orders
// @route   GET /api/customer/orders
// @access  Private/Customer
const getOrders = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;

        const query = { customer: req.user._id };

        if (status) {
            const statuses = String(status)
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
            if (statuses.length > 0) {
                query.status = { $in: statuses };
            }
        }

        if (search) {
            const q = String(search).trim();
            if (q) {
                const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
                query.$or = [{ orderNumber: re }, { 'items.name': re }];
            }
        }

        const orders = await Order.find(query)
            .populate('store', 'name logo')
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

// @desc    Create product review
// @route   POST /api/customer/reviews
// @access  Private/Customer
const createReview = async (req, res, next) => {
    try {
        const { productId, rating, title, comment } = req.body;

        // Check if user has purchased the product
        const hasPurchased = await Order.findOne({
            customer: req.user._id,
            'items.product': productId,
            paymentStatus: 'paid',
        });

        const review = await Review.create({
            product: productId,
            customer: req.user._id,
            rating,
            title,
            comment,
            isVerifiedPurchase: !!hasPurchased,
        });

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            data: review,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    createOrder,
    getOrder,
    getOrders,
    createReview,
};
