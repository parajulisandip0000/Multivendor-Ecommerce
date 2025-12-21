const express = require('express');
const router = express.Router();
const {
    getDashboard,
    getStoreRequests,
    approveStore,
    rejectStore,
    getAllStores,
    updateStoreStatus,
    getAllUsers,
    updateUserStatus,
    getAllProducts,
    deleteProduct,
    getSystemLogs,
    getSystemSettings,
    updateSystemSettings,
    getPlatformAnalytics
} = require('../controllers/superadmin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// All routes require superadmin role
router.use(protect, authorize('superadmin'));

router.get('/dashboard', getDashboard);
router.get('/analytics', getPlatformAnalytics);

// Store Management
router.get('/stores/requests', getStoreRequests);
router.put('/stores/:storeId/approve', approveStore);
router.put('/stores/:storeId/reject', rejectStore);
router.get('/stores', getAllStores);
router.put('/stores/:storeId/status', updateStoreStatus);

// User Management
router.get('/users', getAllUsers);
router.put('/users/:userId/status', updateUserStatus);

// Product Management
router.get('/products', getAllProducts);
router.delete('/products/:productId', deleteProduct);

// System Logs
router.get('/logs', getSystemLogs);

// System Settings
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);

module.exports = router;
