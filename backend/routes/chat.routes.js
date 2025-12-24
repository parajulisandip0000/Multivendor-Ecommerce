const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
    listConversations,
    getConversation,
    listMessages,
    sendMessage,
    markRead,
    createOrGetSupportConversation,
    createOrGetInternalConversationWithManager,
    createOrGetInternalConversationWithStoreAdmin,
    createOrGetStoreCustomerConversationForCustomer,
    createOrGetStoreCustomerConversationForStaff,
    searchStoresForChat,
} = require('../controllers/chat.controller');

router.use(protect);

router.get('/conversations', listConversations);
router.get('/conversations/:id', getConversation);
router.get('/conversations/:id/messages', listMessages);
router.post('/conversations/:id/messages', sendMessage);
router.post('/conversations/:id/read', markRead);

// Conversation creation helpers
router.post('/support/store-admin/:storeAdminId', createOrGetSupportConversation);
router.post('/internal/manager/:managerId', createOrGetInternalConversationWithManager);
router.post('/internal/store-admin', createOrGetInternalConversationWithStoreAdmin);
router.post('/store/:storeId/message', createOrGetStoreCustomerConversationForCustomer);
router.post('/store/:storeId/customer/:customerId/message', createOrGetStoreCustomerConversationForStaff);

// Customer-only store search for starting chats
router.get('/stores/search', searchStoresForChat);

module.exports = router;
