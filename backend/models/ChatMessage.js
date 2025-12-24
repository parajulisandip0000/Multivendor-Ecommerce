const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
    {
        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true,
            index: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        text: {
            type: String,
            required: [true, 'Message text is required'],
            trim: true,
            maxlength: 4000,
        },
        readBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    { timestamps: true }
);

chatMessageSchema.index({ conversation: 1, createdAt: -1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);

