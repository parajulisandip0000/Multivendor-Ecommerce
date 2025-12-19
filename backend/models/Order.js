const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            required: true,
            unique: true,
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        store: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Store',
            required: true,
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                name: String, // Snapshot of product name
                price: {
                    type: Number,
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                variant: {
                    type: Map,
                    of: String,
                }, // e.g., { "Size": "Large", "Color": "Red" }
                image: String, // Snapshot of product image
                subtotal: {
                    type: Number,
                    required: true,
                },
            },
        ],
        // Pricing
        subtotal: {
            type: Number,
            required: true,
        },
        shippingFee: {
            type: Number,
            default: 0,
        },
        tax: {
            type: Number,
            default: 0,
        },
        discount: {
            type: Number,
            default: 0,
        },
        total: {
            type: Number,
            required: true,
        },
        // Shipping information
        shippingAddress: {
            name: String,
            phone: String,
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: String,
        },
        // Order status
        status: {
            type: String,
            enum: [
                'pending',
                'confirmed',
                'processing',
                'shipped',
                'delivered',
                'cancelled',
                'on_hold',
                'refunded',
            ],
            default: 'pending',
        },
        statusHistory: [
            {
                status: String,
                note: String,
                updatedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        // Payment information
        paymentMethod: {
            type: String,
            enum: ['esewa', 'khalti', 'phonepe', 'cod'],
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending',
        },
        paymentDetails: {
            transactionId: String,
            paidAt: Date,
            refundedAt: Date,
            refundAmount: Number,
        },
        // Tracking
        trackingNumber: {
            type: String,
            default: null,
        },
        estimatedDelivery: {
            type: Date,
            default: null,
        },
        deliveredAt: {
            type: Date,
            default: null,
        },
        // Notes
        customerNote: {
            type: String,
            default: null,
        },
        internalNote: {
            type: String,
            default: null,
        },
        // Cancellation
        cancellationReason: {
            type: String,
            default: null,
        },
        cancelledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        cancelledAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Generate order number before saving
orderSchema.pre('save', async function (next) {
    if (!this.orderNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, '0');
        this.orderNumber = `ORD-${year}${month}-${random}`;
    }
    next();
});

// Indexes
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ store: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
