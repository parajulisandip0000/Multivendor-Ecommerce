const Product = require('../models/Product');
const Review = require('../models/Review');

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc    Get all products (public)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 12,
            category,
            minPrice,
            maxPrice,
            search,
            sort = '-createdAt',
        } = req.query;

        // Build query
        const query = { status: 'active', isActive: true };

        if (category) query.category = category;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }
        if (search) {
            const q = String(search).trim();
            if (q) {
                const safe = escapeRegex(q);
                query.$or = [
                    { name: { $regex: safe, $options: 'i' } },
                    { description: { $regex: safe, $options: 'i' } },
                    { tags: { $regex: safe, $options: 'i' } },
                ];
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
    } catch (error) {
        next(error);
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id).populate(
            'store',
            'name logo email phone'
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        // Increment views
        product.views += 1;
        await product.save();

        res.json({
            success: true,
            data: product,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get product reviews
// @route   GET /api/products/:id/reviews
// @access  Public
const getProductReviews = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const reviews = await Review.find({
            product: req.params.id,
            status: 'approved',
        })
            .populate('customer', 'name avatar')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Review.countDocuments({
            product: req.params.id,
            status: 'approved',
        });

        res.json({
            success: true,
            data: reviews,
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

module.exports = {
    getProducts,
    getProduct,
    getProductReviews,
};
