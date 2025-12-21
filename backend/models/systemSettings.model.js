const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema(
    {
        rateLimiting: {
            windowMs: {
                type: Number,
                default: 15 * 60 * 1000, // 15 minutes
            },
            max: {
                type: Number,
                default: 100, // limit each IP to 100 requests per windowMs
            },
            message: {
                type: String,
                default: 'Too many requests from this IP, please try again after 15 minutes',
            },
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

// Singleton pattern: ensure only one settings document exists
systemSettingsSchema.statics.getSettings = async function () {
    const settings = await this.findOne();
    if (settings) {
        return settings;
    }
    return await this.create({});
};

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
