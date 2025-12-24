const Conversation = require('../models/Conversation');
const ChatMessage = require('../models/ChatMessage');
const Store = require('../models/Store');
const User = require('../models/User');
const { getIO, userHasAccessToConversation } = require('../utils/socket');

const makeDirectKey = (a, b, prefix) => {
    const ids = [a.toString(), b.toString()].sort();
    return `${prefix}:${ids.join(':')}`;
};

const makeStoreCustomerKey = (storeId, customerId) =>
    `store_customer:${storeId.toString()}:${customerId.toString()}`;

const resolveStoreIdForStaff = (user) => user.storeId?.toString();

// GET /api/chat/conversations
const listConversations = async (req, res, next) => {
    try {
        const { kind } = req.query;
        const user = req.user;
        const filters = [];

        if (user.role === 'customer') {
            filters.push({ kind: 'store_customer', customer: user._id });
        }

        if (user.role === 'store_admin' || user.role === 'store_manager') {
            const storeId = resolveStoreIdForStaff(user);
            if (storeId) {
                filters.push({ kind: 'store_customer', store: storeId });
            }
            filters.push({ kind: 'storeadmin_manager', participants: user._id });
            if (user.role === 'store_admin') {
                filters.push({ kind: 'superadmin_storeadmin', participants: user._id });
            }
        }

        if (user.role === 'superadmin') {
            filters.push({ kind: 'superadmin_storeadmin', participants: user._id });
        }

        const baseQuery = filters.length ? { $or: filters } : { _id: null };
        if (kind) baseQuery.kind = kind;

        const conversations = await Conversation.find(baseQuery)
            .sort({ lastMessageAt: -1, updatedAt: -1 })
            .populate('store', 'name logo status settings')
            .populate('customer', 'name email avatar')
            .populate('participants', 'name email role avatar storeId')
            .populate('lastMessageSender', 'name email role avatar')
            .limit(200);

        res.json({ success: true, data: conversations });
    } catch (err) {
        next(err);
    }
};

// GET /api/chat/conversations/:id
const getConversation = async (req, res, next) => {
    try {
        const conversation = await Conversation.findById(req.params.id)
            .populate('store', 'name logo status settings')
            .populate('customer', 'name email avatar')
            .populate('participants', 'name email role avatar storeId')
            .populate('lastMessageSender', 'name email role avatar');

        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        const hasAccess = await userHasAccessToConversation(req.user, conversation);
        if (!hasAccess) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        res.json({ success: true, data: conversation });
    } catch (err) {
        next(err);
    }
};

// GET /api/chat/conversations/:id/messages
const listMessages = async (req, res, next) => {
    try {
        const { before, limit = 50 } = req.query;

        const conversation = await Conversation.findById(req.params.id);
        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }
        const hasAccess = await userHasAccessToConversation(req.user, conversation);
        if (!hasAccess) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const query = { conversation: conversation._id };
        if (before) {
            const beforeDate = new Date(before);
            if (!Number.isNaN(beforeDate.valueOf())) query.createdAt = { $lt: beforeDate };
        }

        const messages = await ChatMessage.find(query)
            .sort({ createdAt: -1 })
            .limit(Math.min(parseInt(limit, 10) || 50, 100))
            .populate('sender', 'name email role avatar storeId');

        res.json({ success: true, data: messages.reverse() });
    } catch (err) {
        next(err);
    }
};

// POST /api/chat/conversations/:id/messages
const sendMessage = async (req, res, next) => {
    try {
        const { text } = req.body;
        if (!text || !text.trim()) {
            return res.status(400).json({ success: false, message: 'Message text is required' });
        }

        const conversation = await Conversation.findById(req.params.id);
        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }
        const hasAccess = await userHasAccessToConversation(req.user, conversation);
        if (!hasAccess) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const message = await ChatMessage.create({
            conversation: conversation._id,
            sender: req.user._id,
            text: text.trim(),
            readBy: [req.user._id],
        });

        conversation.lastMessageAt = message.createdAt;
        conversation.lastMessageText = message.text;
        conversation.lastMessageSender = req.user._id;
        await conversation.save();

        const populated = await ChatMessage.findById(message._id).populate(
            'sender',
            'name email role avatar storeId'
        );

        const io = getIO();
        if (io) {
            io.to(`conv:${conversation._id.toString()}`).emit('chat:new_message', {
                conversationId: conversation._id.toString(),
                message: populated,
            });

            if (conversation.kind === 'store_customer') {
                if (conversation.store) io.to(`store:${conversation.store.toString()}`).emit('chat:new_message', { conversationId: conversation._id.toString(), message: populated });
                if (conversation.customer) io.to(`user:${conversation.customer.toString()}`).emit('chat:new_message', { conversationId: conversation._id.toString(), message: populated });
            } else {
                (conversation.participants || []).forEach((p) => {
                    io.to(`user:${p.toString()}`).emit('chat:new_message', { conversationId: conversation._id.toString(), message: populated });
                });
            }
        }

        res.status(201).json({ success: true, data: populated });
    } catch (err) {
        next(err);
    }
};

// POST /api/chat/conversations/:id/read
const markRead = async (req, res, next) => {
    try {
        const conversation = await Conversation.findById(req.params.id);
        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        const hasAccess = await userHasAccessToConversation(req.user, conversation);
        if (!hasAccess) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        await ChatMessage.updateMany(
            { conversation: conversation._id, readBy: { $ne: req.user._id } },
            { $addToSet: { readBy: req.user._id } }
        );

        res.json({ success: true });
    } catch (err) {
        next(err);
    }
};

// POST /api/chat/support/store-admin/:storeAdminId
const createOrGetSupportConversation = async (req, res, next) => {
    try {
        if (req.user.role !== 'superadmin') {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const storeAdmin = await User.findById(req.params.storeAdminId);
        if (!storeAdmin || storeAdmin.role !== 'store_admin') {
            return res.status(404).json({ success: false, message: 'Store admin not found' });
        }

        const key = makeDirectKey(req.user._id, storeAdmin._id, 'superadmin_storeadmin');
        let conversation = await Conversation.findOne({ key });
        if (!conversation) {
            conversation = await Conversation.create({
                kind: 'superadmin_storeadmin',
                key,
                participants: [req.user._id, storeAdmin._id],
                store: storeAdmin.storeId || null,
                lastMessageAt: null,
            });
        }

        conversation = await Conversation.findById(conversation._id)
            .populate('participants', 'name email role avatar storeId')
            .populate('store', 'name logo status settings');

        res.status(201).json({ success: true, data: conversation });
    } catch (err) {
        next(err);
    }
};

// POST /api/chat/internal/manager/:managerId
const createOrGetInternalConversationWithManager = async (req, res, next) => {
    try {
        if (req.user.role !== 'store_admin') {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const manager = await User.findById(req.params.managerId);
        if (!manager || manager.role !== 'store_manager') {
            return res.status(404).json({ success: false, message: 'Store manager not found' });
        }

        const adminStoreId = resolveStoreIdForStaff(req.user);
        if (!adminStoreId || !manager.storeId || manager.storeId.toString() !== adminStoreId) {
            return res.status(403).json({ success: false, message: 'Manager is not in your store' });
        }

        const key = makeDirectKey(req.user._id, manager._id, `storeadmin_manager:${adminStoreId}`);
        let conversation = await Conversation.findOne({ key });
        if (!conversation) {
            conversation = await Conversation.create({
                kind: 'storeadmin_manager',
                key,
                participants: [req.user._id, manager._id],
                store: adminStoreId,
                lastMessageAt: null,
            });
        }

        conversation = await Conversation.findById(conversation._id)
            .populate('participants', 'name email role avatar storeId')
            .populate('store', 'name logo status settings');

        res.status(201).json({ success: true, data: conversation });
    } catch (err) {
        next(err);
    }
};

// POST /api/chat/internal/store-admin (manager starts)
const createOrGetInternalConversationWithStoreAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== 'store_manager') {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const storeId = resolveStoreIdForStaff(req.user);
        if (!storeId) {
            return res.status(400).json({ success: false, message: 'Store not found for user' });
        }

        const store = await Store.findById(storeId).select('owner');
        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        const adminId = store.owner;
        const key = makeDirectKey(adminId, req.user._id, `storeadmin_manager:${storeId}`);

        let conversation = await Conversation.findOne({ key });
        if (!conversation) {
            conversation = await Conversation.create({
                kind: 'storeadmin_manager',
                key,
                participants: [adminId, req.user._id],
                store: storeId,
                lastMessageAt: null,
            });
        }

        conversation = await Conversation.findById(conversation._id)
            .populate('participants', 'name email role avatar storeId')
            .populate('store', 'name logo status settings');

        res.status(201).json({ success: true, data: conversation });
    } catch (err) {
        next(err);
    }
};

// POST /api/chat/store/:storeId/message (customer starts)
const createOrGetStoreCustomerConversationForCustomer = async (req, res, next) => {
    try {
        if (req.user.role !== 'customer') {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const store = await Store.findById(req.params.storeId);
        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }
        if (store.status !== 'approved' || store.settings?.isActive === false) {
            return res.status(403).json({ success: false, message: 'Store is not available' });
        }

        const key = makeStoreCustomerKey(store._id, req.user._id);
        let conversation = await Conversation.findOne({ key });
        if (!conversation) {
            conversation = await Conversation.create({
                kind: 'store_customer',
                key,
                store: store._id,
                customer: req.user._id,
                participants: [req.user._id],
                lastMessageAt: null,
            });
        }

        conversation = await Conversation.findById(conversation._id)
            .populate('store', 'name logo status settings')
            .populate('customer', 'name email avatar');

        res.status(201).json({ success: true, data: conversation });
    } catch (err) {
        next(err);
    }
};

// POST /api/chat/store/:storeId/customer/:customerId/message (store starts)
const createOrGetStoreCustomerConversationForStaff = async (req, res, next) => {
    try {
        if (req.user.role !== 'store_admin' && req.user.role !== 'store_manager') {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const staffStoreId = resolveStoreIdForStaff(req.user);
        if (!staffStoreId || staffStoreId !== req.params.storeId) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const store = await Store.findById(req.params.storeId);
        if (!store) return res.status(404).json({ success: false, message: 'Store not found' });

        const customer = await User.findById(req.params.customerId);
        if (!customer || customer.role !== 'customer') {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        const key = makeStoreCustomerKey(store._id, customer._id);
        let conversation = await Conversation.findOne({ key });
        if (!conversation) {
            conversation = await Conversation.create({
                kind: 'store_customer',
                key,
                store: store._id,
                customer: customer._id,
                participants: [customer._id],
                lastMessageAt: null,
            });
        }

        conversation = await Conversation.findById(conversation._id)
            .populate('store', 'name logo status settings')
            .populate('customer', 'name email avatar');

        res.status(201).json({ success: true, data: conversation });
    } catch (err) {
        next(err);
    }
};

// GET /api/chat/stores/search?q=...
const searchStoresForChat = async (req, res, next) => {
    try {
        if (req.user.role !== 'customer') {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const q = (req.query.q || '').trim();
        if (!q) return res.json({ success: true, data: [] });

        const stores = await Store.find(
            {
                $text: { $search: q },
                status: 'approved',
                'settings.isActive': true,
            },
            { score: { $meta: 'textScore' } }
        )
            .sort({ score: { $meta: 'textScore' } })
            .limit(20)
            .select('name logo description');

        res.json({ success: true, data: stores });
    } catch (err) {
        next(err);
    }
};

module.exports = {
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
};
