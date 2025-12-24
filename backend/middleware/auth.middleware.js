const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Store = require('../models/Store');

// Verify JWT token
const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found',
                });
            }

            if (!req.user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'User account is deactivated',
                });
            }

            // Ensure store_admin has storeId hydrated (some flows rely on it)
            if (req.user.role === 'store_admin' && !req.user.storeId) {
                const store = await Store.findOne({ owner: req.user._id }).select('_id');
                if (store) req.user.storeId = store._id;
            }

            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({
                success: false,
                message: 'Not authorized, token failed',
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token',
        });
    }
};

// Role-based authorization
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user.role}' is not authorized to access this route`,
            });
        }
        next();
    };
};

// Check if user owns the store or is a manager
const checkStoreAccess = async (req, res, next) => {
    try {
        const storeId = req.params.storeId || req.body.storeId;

        if (!storeId) {
            return res.status(400).json({
                success: false,
                message: 'Store ID is required',
            });
        }

        const Store = require('../models/Store');
        const store = await Store.findById(storeId);

        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found',
            });
        }

        // SuperAdmin has access to all stores
        if (req.user.role === 'superadmin') {
            req.store = store;
            return next();
        }

        // Check if user is the store owner
        if (store.owner.toString() === req.user._id.toString()) {
            req.store = store;
            return next();
        }

        // Check if user is a store manager
        const isManager = store.managers.some(
            (managerId) => managerId.toString() === req.user._id.toString()
        );

        if (isManager) {
            req.store = store;
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'You do not have access to this store',
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
};

module.exports = { protect, authorize, checkStoreAccess };
