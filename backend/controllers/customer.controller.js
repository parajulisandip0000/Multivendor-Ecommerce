const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Store = require('../models/Store');
const Coupon = require('../models/Coupon');
const mongoose = require('mongoose');

const normalizeCouponCode = (code) => String(code || '').trim().toUpperCase();

const computeShippingFee = ({ storeSubtotal, settings, items }) => {
    const threshold = Math.max(0, Number(settings?.freeShippingThreshold || 0));
    if (threshold > 0 && storeSubtotal >= threshold) return 0;

    const method = String(settings?.shippingMethod || 'flat');
    if (method === 'per_item') {
        const perItemFee = Math.max(0, Number(settings?.shippingPerItemFee || 0));
        const qty = Array.isArray(items)
            ? items.reduce((sum, item) => sum + Math.max(0, Number(item?.quantity || 0)), 0)
            : 0;
        let fee = perItemFee * qty;
        const maxFee = Math.max(0, Number(settings?.shippingMaxFee || 0));
        if (maxFee > 0) fee = Math.min(fee, maxFee);
        return fee;
    }

    const flatFee = Math.max(0, Number(settings?.shippingFee || 0));
    return flatFee;
};

const computeCouponDiscount = ({ subtotal, coupon }) => {
    if (!coupon) return 0;
    const discountType = coupon.discountType;
    const value = Number(coupon.value || 0);
    if (subtotal <= 0 || value <= 0) return 0;

    if (discountType === 'fixed') {
        return Math.min(subtotal, value);
    }

    if (discountType === 'percentage') {
        const raw = subtotal * (value / 100);
        const cap = Math.max(0, Number(coupon.maxDiscountAmount || 0));
        return cap > 0 ? Math.min(raw, cap) : raw;
    }

    return 0;
};

// @desc    Get cart
// @route   GET /api/customer/cart
// @access  Private/Customer
const getCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ customer: req.user._id }).populate({
            path: 'items.product',
            select: 'name price images quantity store',
            populate: { path: 'store', select: 'name status settings' },
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

        await cart.populate({
            path: 'items.product',
            select: 'name price images store',
            populate: { path: 'store', select: 'name status settings' },
        });

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
            select: 'name price images quantity compareAtPrice reviewStats store',
            populate: { path: 'store', select: 'name status settings' },
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
            select: 'name price images quantity compareAtPrice reviewStats store',
            populate: { path: 'store', select: 'name status settings' },
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
        const { items, shippingAddress, paymentMethod, customerNote, couponCode } = req.body;
        const normalizedCouponCode = normalizeCouponCode(couponCode);

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

        if (normalizedCouponCode) {
            const storeIds = Object.keys(ordersByStore);
            const match = await Coupon.findOne({
                store: { $in: storeIds },
                code: normalizedCouponCode,
                isActive: true,
            }).select('_id');

            if (!match) {
                return res.status(400).json({ success: false, message: 'Coupon code is not valid for these items' });
            }
        }

        for (const [storeId, storeItems] of Object.entries(ordersByStore)) {
            const cleanItems = storeItems.map(({ store, ...rest }) => rest);
            const storeSubtotal = cleanItems.reduce((sum, item) => sum + item.subtotal, 0);

            const store = await Store.findById(storeId).select('status settings');
            if (!store) {
                return res.status(404).json({ success: false, message: 'Store not found' });
            }
            if (store.status === 'rejected' || store.status === 'suspended' || store.settings?.isActive === false) {
                return res.status(403).json({ success: false, message: 'Store is not available' });
            }
            if (store.settings?.acceptOrders === false) {
                return res.status(400).json({ success: false, message: 'Store is not accepting orders' });
            }
            const minOrderAmount = Math.max(0, Number(store.settings?.minOrderAmount || 0));
            if (minOrderAmount > 0 && storeSubtotal < minOrderAmount) {
                return res.status(400).json({
                    success: false,
                    message: `Minimum order amount for this store is NRS ${minOrderAmount}`,
                });
            }

            const shippingFee = computeShippingFee({ storeSubtotal, settings: store.settings, items: cleanItems });
            const tax = 0; // Calculate if needed
            let discount = 0;
            let appliedCoupon = null;

            if (normalizedCouponCode) {
                const coupon = await Coupon.findOne({
                    store: storeId,
                    code: normalizedCouponCode,
                    isActive: true,
                });

                if (coupon) {
                    const now = new Date();
                    if (coupon.startsAt && now < coupon.startsAt) {
                        return res.status(400).json({ success: false, message: 'Coupon is not active yet' });
                    }
                    if (coupon.expiresAt && now > coupon.expiresAt) {
                        return res.status(400).json({ success: false, message: 'Coupon has expired' });
                    }
                    const couponMin = Math.max(0, Number(coupon.minOrderAmount || 0));
                    if (couponMin > 0 && storeSubtotal < couponMin) {
                        return res.status(400).json({
                            success: false,
                            message: `Minimum order amount for this coupon is NRS ${couponMin}`,
                        });
                    }
                    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
                        return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
                    }

                    discount = computeCouponDiscount({ subtotal: storeSubtotal, coupon });
                    if (discount > 0) {
                        const query = { _id: coupon._id, isActive: true };
                        if (coupon.usageLimit > 0) query.usedCount = { $lt: coupon.usageLimit };
                        const updated = await Coupon.findOneAndUpdate(query, { $inc: { usedCount: 1 } }, { new: true });
                        if (!updated) {
                            return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
                        }

                        appliedCoupon = {
                            couponId: coupon._id,
                            code: coupon.code,
                            discountType: coupon.discountType,
                            value: coupon.value,
                            amount: discount,
                        };
                    }
                }
            }

            const total = Math.max(0, storeSubtotal - discount) + shippingFee + tax;

            const order = await Order.create({
                customer: req.user._id,
                store: storeId,
                items: cleanItems,
                subtotal: storeSubtotal,
                shippingFee,
                tax,
                discount,
                appliedCoupon,
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
