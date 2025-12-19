const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a name'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            lowercase: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email',
            ],
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: 6,
            select: false,
        },
        phone: {
            type: String,
            required: [true, 'Please provide a phone number'],
        },
        role: {
            type: String,
            enum: ['customer', 'store_manager', 'store_admin', 'superadmin'],
            default: 'customer',
        },
        avatar: {
            type: String,
            default: null,
        },
        // For store_admin and store_manager
        storeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Store',
            default: null,
        },
        // For store_manager - reference to the admin who assigned them
        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        // Customer specific fields
        addresses: [
            {
                label: String, // Home, Work, etc.
                street: String,
                city: String,
                state: String,
                zipCode: String,
                country: String,
                isDefault: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
        refreshToken: {
            type: String,
            select: false,
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive data from JSON response
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.refreshToken;
    return user;
};

module.exports = mongoose.model('User', userSchema);
