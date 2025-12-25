const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    register,
    login,
    refreshAccessToken,
    logout,
    getMe,
    updateMe,
    changePassword,
    updateProfilePicture,
} = require('../controllers/auth.controller');
const { upload } = require('../utils/fileUpload');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');

// Validation rules
const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('role')
        .optional()
        .isIn(['customer', 'store_admin'])
        .withMessage('Invalid role'),
];

const loginValidation = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
];

// Routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/refresh', refreshAccessToken);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put(
    '/me',
    protect,
    [
        body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
        body('email').optional().isEmail().withMessage('Please provide a valid email'),
        body('phone').optional().trim().notEmpty().withMessage('Phone cannot be empty'),
        body('password')
            .optional()
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters'),
    ],
    validate,
    updateMe
);
router.post(
    '/change-password',
    protect,
    [
        body('currentPassword').notEmpty().withMessage('Current password is required'),
        body('newPassword')
            .isLength({ min: 6 })
            .withMessage('New password must be at least 6 characters'),
    ],
    validate,
    changePassword
);
router.post('/profile-picture', protect, upload.single('image'), updateProfilePicture);

module.exports = router;
