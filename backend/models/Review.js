const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            default: null,
        },
        rating: {
            type: Number,
            required: [true, 'Please provide a rating'],
            min: 1,
            max: 5,
        },
        title: {
            type: String,
            trim: true,
            maxlength: 100,
        },
        comment: {
            type: String,
            required: [true, 'Please provide a review comment'],
            maxlength: 1000,
        },
        images: [
            {
                fileId: mongoose.Schema.Types.ObjectId,
                url: String,
            },
        ],
        // Moderation
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'approved', // Auto-approve by default
        },
        // Helpful votes
        helpfulVotes: {
            type: Number,
            default: 0,
        },
        votedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        // Store response
        storeResponse: {
            comment: String,
            respondedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            respondedAt: Date,
        },
        // Verification
        isVerifiedPurchase: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Ensure one review per customer per product
reviewSchema.index({ product: 1, customer: 1 }, { unique: true });

// Update product review stats after save
reviewSchema.post('save', async function () {
    const Review = this.constructor;
    const Product = mongoose.model('Product');

    const stats = await Review.aggregate([
        {
            $match: {
                product: this.product,
                status: 'approved',
            },
        },
        {
            $group: {
                _id: '$product',
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 },
                rating5: {
                    $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] },
                },
                rating4: {
                    $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] },
                },
                rating3: {
                    $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] },
                },
                rating2: {
                    $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] },
                },
                rating1: {
                    $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] },
                },
            },
        },
    ]);

    if (stats.length > 0) {
        await Product.findByIdAndUpdate(this.product, {
            'reviewStats.averageRating': Math.round(stats[0].averageRating * 10) / 10,
            'reviewStats.totalReviews': stats[0].totalReviews,
            'reviewStats.ratingDistribution.5': stats[0].rating5,
            'reviewStats.ratingDistribution.4': stats[0].rating4,
            'reviewStats.ratingDistribution.3': stats[0].rating3,
            'reviewStats.ratingDistribution.2': stats[0].rating2,
            'reviewStats.ratingDistribution.1': stats[0].rating1,
        });
    }
});

module.exports = mongoose.model('Review', reviewSchema);
