const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
    {
        kind: {
            type: String,
            required: true,
            enum: [
                'superadmin_storeadmin',
                'storeadmin_manager',
                'store_customer',
            ],
        },
        key: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        store: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Store',
            default: null,
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        lastMessageAt: {
            type: Date,
            default: null,
            index: true,
        },
        lastMessageText: {
            type: String,
            default: '',
        },
        lastMessageSender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
    },
    { timestamps: true }
);

conversationSchema.index({ kind: 1, store: 1, customer: 1 });
conversationSchema.index({ kind: 1, participants: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);

