const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema(
    {
        action: {
            type: String,
            required: true,
            trim: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        details: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        ip: {
            type: String,
            default: '',
        },
        level: {
            type: String,
            enum: ['info', 'warning', 'danger'],
            default: 'info',
        }
    },
    {
        timestamps: true,
    }
);

// Index for searching logs
systemLogSchema.index({ action: 'text', 'user.name': 'text' });
systemLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SystemLog', systemLogSchema);
