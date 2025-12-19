const express = require('express');
const router = express.Router();
const {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getOrders,
    updateOrderStatus,
} = require('../controllers/storeManager.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { upload } = require('../utils/fileUpload');

// All routes require store_manager or store_admin role
router.use(protect, authorize('store_manager', 'store_admin'));

router.get('/products', getProducts);
router.post('/products', upload.array('images', 5), createProduct);
router.put('/products/:productId', upload.array('images', 5), updateProduct);
router.delete('/products/:productId', deleteProduct);

router.get('/orders', getOrders);
router.put('/orders/:orderId/status', updateOrderStatus);

module.exports = router;
