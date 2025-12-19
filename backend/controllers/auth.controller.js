const User = require('../models/User');
const {
    generateToken,
    generateRefreshToken,
    verifyRefreshToken,
} = require('../utils/jwt');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
    try {
        const { name, email, password, phone, role } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email',
            });
        }

        // Prevent direct superadmin registration
        if (role === 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot register as superadmin',
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            phone,
            role: role || 'customer',
        });

        // Generate tokens
        const token = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Save refresh token
        user.refreshToken = refreshToken;
        await user.save();

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user,
                token,
                refreshToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check for user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated',
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Generate tokens
        const token = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Save refresh token
        user.refreshToken = refreshToken;
        await user.save();

        // Remove password from response
        user.password = undefined;

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user,
                token,
                refreshToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshAccessToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required',
            });
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token',
            });
        }

        // Find user and check if refresh token matches
        const user = await User.findById(decoded.id).select('+refreshToken');
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token',
            });
        }

        // Generate new access token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
    try {
        // Clear refresh token
        req.user.refreshToken = null;
        await req.user.save();

        res.json({
            success: true,
            message: 'Logout successful',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate('storeId');

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

// Exports moved to end

// @desc    Update profile picture
// @route   POST /api/auth/profile-picture
// @access  Private
const updateProfilePicture = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image file',
            });
        }

        const { uploadToGridFS, deleteFromGridFS } = require('../utils/fileUpload');

        // Upload new file
        const fileData = await uploadToGridFS(req.file);

        // Construct the file URL
        const fileUrl = `http://localhost:5000/api/files/name/${fileData.filename}`;

        // Get current user to check for old avatar
        const user = await User.findById(req.user._id);

        // Optional: Delete old avatar if it exists and is a local file
        // (This logic depends on how we store the avatar URL. If it's a full URL, we need to extract the filename)
        // For now, we'll just update the reference.

        user.avatar = fileUrl;
        await user.save();

        res.json({
            success: true,
            message: 'Profile picture updated successfully',
            data: {
                avatar: user.avatar
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    refreshAccessToken,
    logout,
    getMe,
    updateProfilePicture,
};
