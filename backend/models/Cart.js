const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                    default: 1,
                },
                variant: {
                    type: Map,
                    of: String,
                },
                addedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Remove duplicate products with same variant
cartSchema.index({ customer: 1, 'items.product': 1 });

module.exports = mongoose.model('Cart', cartSchema);
