const express = require('express');
const router = express.Router();
const {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    createOrder,
    getOrders,
    createReview,
} = require('../controllers/customer.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// All routes require customer role
router.use(protect, authorize('customer'));

// Cart routes
router.get('/cart', getCart);
router.post('/cart', addToCart);
router.put('/cart/:itemId', updateCartItem);
router.delete('/cart/:itemId', removeFromCart);

// Wishlist routes
router.get('/wishlist', getWishlist);
router.post('/wishlist', addToWishlist);
router.delete('/wishlist/:itemId', removeFromWishlist);

// Order routes
router.post('/orders', createOrder);
router.get('/orders', getOrders);

// Review routes
router.post('/reviews', createReview);

module.exports = router;
