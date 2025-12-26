const Coupon = require('../models/Coupon');

const normalizeCode = (code) => String(code || '').trim().toUpperCase();

// @desc    List coupons for manager's store
// @route   GET /api/store-manager/coupons
// @access  Private/StoreManager
const listCoupons = async (req, res, next) => {
    try {
        const storeId = req.user.storeId;
        if (!storeId) {
            return res.status(400).json({ success: false, message: 'User is not assigned to a store' });
        }

        const { page = 1, limit = 20, search, active } = req.query;
        const query = { store: storeId };

        if (active !== undefined && active !== '') {
            query.isActive = String(active) === 'true';
        }
        if (search) {
            const q = String(search).trim();
            if (q) query.code = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        }

        const coupons = await Coupon.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Coupon.countDocuments(query);

        res.json({
            success: true,
            data: coupons,
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

// @desc    Create a coupon for manager's store
// @route   POST /api/store-manager/coupons
// @access  Private/StoreManager
const createCoupon = async (req, res, next) => {
    try {
        const storeId = req.user.storeId;
        if (!storeId) {
            return res.status(400).json({ success: false, message: 'User is not assigned to a store' });
        }

        const code = normalizeCode(req.body.code);
        if (!code) {
            return res.status(400).json({ success: false, message: 'Coupon code is required' });
        }

        const coupon = await Coupon.create({
            store: storeId,
            createdBy: req.user._id,
            code,
            description: req.body.description,
            discountType: req.body.discountType,
            value: req.body.value,
            maxDiscountAmount: req.body.maxDiscountAmount,
            minOrderAmount: req.body.minOrderAmount,
            startsAt: req.body.startsAt || null,
            expiresAt: req.body.expiresAt || null,
            usageLimit: req.body.usageLimit,
            isActive: req.body.isActive !== undefined ? !!req.body.isActive : true,
        });

        res.status(201).json({
            success: true,
            message: 'Coupon created successfully',
            data: coupon,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a coupon
// @route   PUT /api/store-manager/coupons/:couponId
// @access  Private/StoreManager
const updateCoupon = async (req, res, next) => {
    try {
        const storeId = req.user.storeId;
        if (!storeId) {
            return res.status(400).json({ success: false, message: 'User is not assigned to a store' });
        }

        const coupon = await Coupon.findOne({ _id: req.params.couponId, store: storeId });
        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found' });
        }

        const updatable = [
            'description',
            'discountType',
            'value',
            'maxDiscountAmount',
            'minOrderAmount',
            'startsAt',
            'expiresAt',
            'usageLimit',
            'isActive',
        ];

        updatable.forEach((key) => {
            if (req.body[key] !== undefined) coupon[key] = req.body[key];
        });

        if (req.body.code !== undefined) {
            coupon.code = normalizeCode(req.body.code);
        }

        await coupon.save();

        res.json({
            success: true,
            message: 'Coupon updated successfully',
            data: coupon,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a coupon
// @route   DELETE /api/store-manager/coupons/:couponId
// @access  Private/StoreManager
const deleteCoupon = async (req, res, next) => {
    try {
        const storeId = req.user.storeId;
        if (!storeId) {
            return res.status(400).json({ success: false, message: 'User is not assigned to a store' });
        }

        const coupon = await Coupon.findOneAndDelete({ _id: req.params.couponId, store: storeId });
        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found' });
        }

        res.json({ success: true, message: 'Coupon deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = { listCoupons, createCoupon, updateCoupon, deleteCoupon };

