const express = require('express');
const router = express.Router();
const {
    registerStore,
    getDashboard,
    updateProfile,
    addManager,
    getManagers,
    updateManager,
    deleteManager,
    toggleManagerStatus,
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    getOrders,
    getOrder,
    updateOrderStatus,
    getAnalytics,
} = require('../controllers/storeAdmin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { upload } = require('../utils/fileUpload');

// All routes require store_admin role
router.use(protect, authorize('store_admin'));

router.post('/register', registerStore);
router.get('/dashboard', getDashboard);
router.put('/profile', upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
]), updateProfile);
router.post('/managers', addManager);
router.get('/managers', getManagers);
router.put('/managers/:id', updateManager);
router.delete('/managers/:id', deleteManager);
router.patch('/managers/:id/status', toggleManagerStatus);

// Product Management
router.post('/products', upload.array('images', 5), createProduct);
router.get('/products', getProducts);
router.get('/products/:id', getProduct);
router.put('/products/:id', upload.array('images', 5), updateProduct);
router.delete('/products/:id', deleteProduct);

// Order Management
router.get('/orders', getOrders);
router.get('/orders/:id', getOrder);
router.patch('/orders/:id/status', updateOrderStatus);

// Analytics
router.get('/analytics', getAnalytics);

module.exports = router;
