const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
    {
        store: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Store',
            required: true,
            index: true,
        },
        code: {
            type: String,
            required: [true, 'Please provide a coupon code'],
            trim: true,
            uppercase: true,
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        discountType: {
            type: String,
            enum: ['percentage', 'fixed'],
            required: true,
        },
        value: {
            type: Number,
            required: true,
            min: [0, 'Value must be positive'],
        },
        maxDiscountAmount: {
            type: Number,
            default: 0,
            min: [0, 'Max discount must be positive'],
        },
        minOrderAmount: {
            type: Number,
            default: 0,
            min: [0, 'Min order must be positive'],
        },
        startsAt: {
            type: Date,
            default: null,
        },
        expiresAt: {
            type: Date,
            default: null,
        },
        usageLimit: {
            type: Number,
            default: 0,
            min: [0, 'Usage limit must be positive'],
        },
        usedCount: {
            type: Number,
            default: 0,
            min: [0, 'Used count must be positive'],
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
    },
    { timestamps: true }
);

couponSchema.index({ store: 1, code: 1 }, { unique: true });

couponSchema.pre('validate', function (next) {
    if (this.discountType === 'percentage' && this.value > 100) {
        this.invalidate('value', 'Percentage discount cannot exceed 100');
    }
    next();
});

module.exports = mongoose.model('Coupon', couponSchema);

