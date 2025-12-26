const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a store name'],
            trim: true,
            unique: true,
        },
        description: {
            type: String,
            required: [true, 'Please provide a store description'],
        },
        logo: {
            type: String,
            default: null,
        },
        banner: {
            type: String,
            default: null,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        // Store registration status
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'suspended'],
            default: 'pending',
        },
        rejectionReason: {
            type: String,
            default: null,
        },
        // Store contact information
        email: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        address: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: String,
        },
        // Business information
        businessLicense: {
            type: String,
            default: null,
        },
        taxId: {
            type: String,
            default: null,
        },
        // Store managers
        managers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        // Store settings
        settings: {
            isActive: {
                type: Boolean,
                default: true,
            },
            acceptOrders: {
                type: Boolean,
                default: true,
            },
            minOrderAmount: {
                type: Number,
                default: 0,
            },
            shippingMethod: {
                type: String,
                enum: ['flat', 'per_item'],
                default: 'flat',
            },
            shippingFee: {
                type: Number,
                default: 0,
            },
            shippingPerItemFee: {
                type: Number,
                default: 0,
            },
            shippingMaxFee: {
                type: Number,
                default: 0,
            },
            freeShippingThreshold: {
                type: Number,
                default: 0,
            },
        },
        // Analytics data (cached for performance)
        analytics: {
            totalProducts: {
                type: Number,
                default: 0,
            },
            totalOrders: {
                type: Number,
                default: 0,
            },
            totalRevenue: {
                type: Number,
                default: 0,
            },
            averageRating: {
                type: Number,
                default: 0,
            },
            totalReviews: {
                type: Number,
                default: 0,
            },
        },
        // Payment information for store
        paymentInfo: {
            bankName: String,
            accountNumber: String,
            accountName: String,
            // For digital wallets
            esewaId: String,
            khaltiId: String,
        },
    },
    {
        timestamps: true,
    }
);

// Index for searching stores
storeSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Store', storeSchema);
