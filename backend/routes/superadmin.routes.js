const express = require('express');
const router = express.Router();
const {
    getDashboard,
    getStoreRequests,
    approveStore,
    rejectStore,
    getAllStores,
    getAllUsers,
    getSystemSettings,
    updateSystemSettings,
} = require('../controllers/superadmin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// All routes require superadmin role
router.use(protect, authorize('superadmin'));

router.get('/dashboard', getDashboard);
router.get('/stores/requests', getStoreRequests);
router.put('/stores/:storeId/approve', approveStore);
router.put('/stores/:storeId/reject', rejectStore);
router.get('/stores', getAllStores);
router.get('/users', getAllUsers);
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);

module.exports = router;
