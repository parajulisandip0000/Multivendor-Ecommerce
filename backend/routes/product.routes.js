const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProduct,
    getProductReviews,
} = require('../controllers/product.controller');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);
router.get('/:id/reviews', getProductReviews);

module.exports = router;
