const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a product name'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Please provide a product description'],
        },
        store: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Store',
            required: true,
        },
        category: {
            type: String,
            required: [true, 'Please provide a category'],
            enum: [
                'Electronics',
                'Fashion',
                'Home & Garden',
                'Sports & Outdoors',
                'Books',
                'Toys & Games',
                'Health & Beauty',
                'Food & Beverages',
                'Automotive',
                'Other',
            ],
        },
        subCategory: {
            type: String,
            default: null,
        },
        brand: {
            type: String,
            default: null,
        },
        // Pricing
        price: {
            type: Number,
            required: [true, 'Please provide a price'],
            min: 0,
        },
        compareAtPrice: {
            type: Number,
            default: null,
            min: 0,
        },
        costPerItem: {
            type: Number,
            default: null,
            min: 0,
        },
        // Inventory
        sku: {
            type: String,
            unique: true,
            sparse: true,
        },
        barcode: {
            type: String,
            default: null,
        },
        quantity: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
        trackInventory: {
            type: Boolean,
            default: true,
        },
        lowStockThreshold: {
            type: Number,
            default: 10,
        },
        // Images stored as GridFS file IDs
        thumbnail: {
            fileId: {
                type: mongoose.Schema.Types.ObjectId,
                default: null,
            },
            url: {
                type: String,
                default: null,
            },
        },
        images: [
            {
                fileId: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                },
                url: String, // Generated URL to access the image
                isDefault: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
        // Product variants (e.g., size, color)
        variants: [
            {
                name: String, // e.g., "Size", "Color"
                options: [String], // e.g., ["Small", "Medium", "Large"]
            },
        ],
        // Variant combinations with specific pricing/inventory
        variantCombinations: [
            {
                attributes: {
                    type: Map,
                    of: String,
                }, // e.g., { "Size": "Large", "Color": "Red" }
                price: Number,
                quantity: Number,
                sku: String,
            },
        ],
        // Product specifications
        specifications: {
            type: Map,
            of: String,
        },
        // Shipping
        weight: {
            value: Number,
            unit: {
                type: String,
                enum: ['kg', 'g', 'lb', 'oz'],
                default: 'kg',
            },
        },
        dimensions: {
            length: Number,
            width: Number,
            height: Number,
            unit: {
                type: String,
                enum: ['cm', 'm', 'in', 'ft'],
                default: 'cm',
            },
        },
        // SEO
        seoTitle: String,
        seoDescription: String,
        tags: [String],
        // Status
        status: {
            type: String,
            enum: ['draft', 'active', 'archived'],
            default: 'active',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        // Analytics
        views: {
            type: Number,
            default: 0,
        },
        sales: {
            type: Number,
            default: 0,
        },
        // Reviews summary (cached for performance)
        reviewStats: {
            averageRating: {
                type: Number,
                default: 0,
            },
            totalReviews: {
                type: Number,
                default: 0,
            },
            ratingDistribution: {
                5: { type: Number, default: 0 },
                4: { type: Number, default: 0 },
                3: { type: Number, default: 0 },
                2: { type: Number, default: 0 },
                1: { type: Number, default: 0 },
            },
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for search and filtering
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ store: 1, status: 1 });
productSchema.index({ category: 1, subCategory: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'reviewStats.averageRating': -1 });

module.exports = mongoose.model('Product', productSchema);
