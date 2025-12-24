const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Store = require('../models/Store');

let io;

const getTokenFromSocket = (socket) => {
    const authToken = socket.handshake?.auth?.token;
    if (authToken) return authToken;

    const header = socket.handshake?.headers?.authorization;
    if (header && header.startsWith('Bearer ')) return header.split(' ')[1];

    return null;
};

const initSocket = (httpServer) => {
    const allowedOrigins = [process.env.WEB_URL, process.env.MOBILE_URL].filter(Boolean);
    io = new Server(httpServer, {
        cors: {
            origin: allowedOrigins.length ? allowedOrigins : true,
            credentials: true,
        },
    });

    io.use(async (socket, next) => {
        try {
            const token = getTokenFromSocket(socket);
            if (!token) return next(new Error('Missing token'));

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            if (!user || !user.isActive) return next(new Error('Unauthorized'));

            if (user.role === 'store_admin' && !user.storeId) {
                const store = await Store.findOne({ owner: user._id }).select('_id');
                if (store) user.storeId = store._id;
            }

            socket.user = user;
            return next();
        } catch (err) {
            return next(new Error('Unauthorized'));
        }
    });

    io.on('connection', (socket) => {
        const user = socket.user;
        socket.join(`user:${user._id.toString()}`);

        if (
            (user.role === 'store_admin' || user.role === 'store_manager') &&
            user.storeId
        ) {
            socket.join(`store:${user.storeId.toString()}`);
        }

        socket.on('join_conversation', async (conversationId, cb) => {
            try {
                const conv = await Conversation.findById(conversationId);
                if (!conv) throw new Error('Conversation not found');

                const hasAccess = await userHasAccessToConversation(user, conv);
                if (!hasAccess) throw new Error('Forbidden');

                socket.join(`conv:${conversationId}`);
                cb && cb({ success: true });
            } catch (err) {
                cb && cb({ success: false, message: err.message || 'Error' });
            }
        });
    });

    return io;
};

const getIO = () => io;

const userHasAccessToConversation = async (user, conv) => {
    const userId = user._id.toString();

    if (conv.kind === 'store_customer') {
        if (user.role === 'customer') return conv.customer?.toString() === userId;
        if (user.role === 'store_admin' || user.role === 'store_manager') {
            return conv.store?.toString() === user.storeId?.toString();
        }
        return false;
    }

    if (conv.kind === 'storeadmin_manager') {
        return (
            (user.role === 'store_admin' || user.role === 'store_manager') &&
            conv.participants?.some((p) => p.toString() === userId)
        );
    }

    if (conv.kind === 'superadmin_storeadmin') {
        return (
            (user.role === 'superadmin' || user.role === 'store_admin') &&
            conv.participants?.some((p) => p.toString() === userId)
        );
    }

    return false;
};

module.exports = { initSocket, getIO, userHasAccessToConversation };
