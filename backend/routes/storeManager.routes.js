const express = require('express');
const router = express.Router();
const {
    getDashboard,
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    deleteProductImage,
    getOrders,
    updateOrderStatus,
    getAnalytics,
} = require('../controllers/storeManager.controller');
const { listCoupons, createCoupon, updateCoupon, deleteCoupon } = require('../controllers/coupon.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { upload } = require('../utils/fileUpload');

// All routes require store_manager or store_admin role
router.use(protect, authorize('store_manager', 'store_admin'));

router.get('/dashboard', getDashboard);
router.get('/products', getProducts);
router.post('/products', upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 5 },
]), createProduct);
router.put('/products/:productId', upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 5 },
]), updateProduct);
router.delete('/products/:productId/images/:fileId', deleteProductImage);
router.delete('/products/:productId', deleteProduct);

router.get('/orders', getOrders);
router.put('/orders/:orderId/status', updateOrderStatus);

router.get('/analytics', getAnalytics);

router.get('/coupons', listCoupons);
router.post('/coupons', createCoupon);
router.put('/coupons/:couponId', updateCoupon);
router.delete('/coupons/:couponId', deleteCoupon);

module.exports = router;
