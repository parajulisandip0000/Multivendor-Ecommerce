const Store = require('../models/Store');
const Product = require('../models/Product');

// @desc    Get public store profile
// @route   GET /api/stores/:id
// @access  Public
const getStorePublic = async (req, res, next) => {
    try {
        const store = await Store.findById(req.params.id).select(
            'name description logo banner email phone address status settings'
        );

        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }
        if (store.status === 'rejected' || store.status === 'suspended' || store.settings?.isActive === false) {
            return res.status(403).json({ success: false, message: 'Store is not available' });
        }

        res.json({ success: true, data: store });
    } catch (err) {
        next(err);
    }
};

// @desc    Get public products for a store
// @route   GET /api/stores/:id/products
// @access  Public
const getStoreProductsPublic = async (req, res, next) => {
    try {
        const { page = 1, limit = 12, sort = '-createdAt', search } = req.query;

        const store = await Store.findById(req.params.id).select('status settings');
        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }
        if (store.status === 'rejected' || store.status === 'suspended' || store.settings?.isActive === false) {
            return res.status(403).json({ success: false, message: 'Store is not available' });
        }

        const query = { store: req.params.id, status: 'active', isActive: true };

        if (search) {
            const q = String(search).trim();
            if (q) {
                const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
                query.$or = [{ name: re }, { description: re }];
            }
        }

        const products = await Product.find(query)
            .populate('store', 'name logo')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(sort);

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
    } catch (err) {
        next(err);
    }
};

module.exports = { getStorePublic, getStoreProductsPublic };
