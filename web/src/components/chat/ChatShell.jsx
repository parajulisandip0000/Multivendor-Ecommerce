import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { chatService, superAdminService } from '../../services';
import { getSocket } from '../../services/socket';
import { FiSend, FiSearch, FiMessageCircle } from 'react-icons/fi';

const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (Number.isNaN(d.valueOf())) return '';
    return d.toLocaleString();
};

const getConversationTitle = (conv, me) => {
    if (!conv) return '';
    if (conv.kind === 'store_customer') {
        if (me?.role === 'customer') return conv.store?.name || 'Store';
        return conv.customer?.name || 'Customer';
    }
    const others = (conv.participants || []).filter((p) => p?._id !== me?._id);
    return others[0]?.name || 'Chat';
};

const getConversationSubtitle = (conv) => {
    if (!conv?.lastMessageAt) return 'No messages yet';
    return conv.lastMessageText || '...';
};

const getConversationKey = (conv) => conv?._id;

const ChatShell = ({ context }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, token, isAuthenticated } = useSelector((s) => s.auth);

    const [loadingList, setLoadingList] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [draft, setDraft] = useState('');

    const [storeSearch, setStoreSearch] = useState('');
    const [storeResults, setStoreResults] = useState([]);
    const [userSearch, setUserSearch] = useState('');
    const [storeAdminResults, setStoreAdminResults] = useState([]);

    const activeConversation = useMemo(
        () => conversations.find((c) => c._id === activeId) || null,
        [conversations, activeId]
    );

    const socketRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const bottomRef = useRef(null);
    const messageIdsRef = useRef(new Set());
    const prevActiveIdRef = useRef(null);

    const scrollToBottom = (behavior = 'auto') => {
        requestAnimationFrame(() => {
            if (bottomRef.current?.scrollIntoView) {
                bottomRef.current.scrollIntoView({ behavior, block: 'end' });
                return;
            }
            const el = messagesContainerRef.current;
            if (el) el.scrollTop = el.scrollHeight;
        });
    };

    const setMessagesWithIndex = (nextMessages) => {
        const ids = new Set();
        (nextMessages || []).forEach((m) => {
            if (m?._id) ids.add(m._id);
        });
        messageIdsRef.current = ids;
        setMessages(nextMessages || []);
    };

    const appendMessageIfNew = (message, conversationId) => {
        if (!message || !message._id) return;
        if (conversationId && conversationId !== activeId) return;

        const ids = messageIdsRef.current;
        if (ids.has(message._id)) return;
        ids.add(message._id);
        setMessages((prev) => [...prev, message]);
    };

    const refreshConversations = async () => {
        setLoadingList(true);
        try {
            const res = await chatService.listConversations();
            if (res.success) {
                setConversations(res.data);
            }
        } finally {
            setLoadingList(false);
        }
    };

    const openConversation = async (conversationId, { replace = false } = {}) => {
        setActiveId(conversationId);
        setLoadingMessages(true);
        try {
            const res = await chatService.listMessages(conversationId);
            if (res.success) setMessagesWithIndex(res.data);
            await chatService.markRead(conversationId);
            socketRef.current?.emit?.('join_conversation', conversationId);
        } finally {
            setLoadingMessages(false);
        }

        // Ensure we land on the latest message after initial render.
        scrollToBottom('auto');

        const path = window.location.pathname;
        const next = `${path}?conversation=${conversationId}`;
        navigate(next, { replace });
    };

    useEffect(() => {
        if (!isAuthenticated || !token) return;
        refreshConversations();
    }, [isAuthenticated, token]);

    useEffect(() => {
        if (!token) return;
        const sock = getSocket(token);
        socketRef.current = sock;

        const onNewMessage = ({ conversationId, message }) => {
            setConversations((prev) => {
                const idx = prev.findIndex((c) => c._id === conversationId);
                if (idx === -1) return prev;
                const updated = [...prev];
                updated[idx] = {
                    ...updated[idx],
                    lastMessageAt: message?.createdAt,
                    lastMessageText: message?.text,
                    lastMessageSender: message?.sender?._id,
                };
                updated.sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
                return updated;
            });

            if (conversationId === activeId) {
                appendMessageIfNew(message, conversationId);
                chatService.markRead(conversationId).catch(() => null);
            }
        };

        sock.on('chat:new_message', onNewMessage);
        return () => {
            sock.off('chat:new_message', onNewMessage);
        };
    }, [token, activeId]);

    useLayoutEffect(() => {
        if (!activeId) return;
        if (loadingMessages) return;
        const behavior = prevActiveIdRef.current !== activeId ? 'auto' : 'smooth';
        prevActiveIdRef.current = activeId;
        scrollToBottom(behavior);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeId, loadingMessages, messages.length]);

    useEffect(() => {
        const conversationId = searchParams.get('conversation');
        const storeId = searchParams.get('storeId');
        const customerId = searchParams.get('customerId');
        const managerId = searchParams.get('managerId');

        const run = async () => {
            if (!isAuthenticated) return;

            if (conversationId) {
                await openConversation(conversationId, { replace: true });
                return;
            }

            if (storeId && user?.role === 'customer') {
                const res = await chatService.createStoreChat(storeId);
                if (res.success) await openConversation(res.data._id, { replace: true });
                return;
            }

            if (customerId && (user?.role === 'store_admin' || user?.role === 'store_manager') && user?.storeId) {
                const res = await chatService.createCustomerChat(user.storeId, customerId);
                if (res.success) await openConversation(res.data._id, { replace: true });
                return;
            }

            if (managerId && user?.role === 'store_admin') {
                const res = await chatService.createInternalChatWithManager(managerId);
                if (res.success) await openConversation(res.data._id, { replace: true });
            }
        };

        run().catch(() => null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, isAuthenticated, user?.role, user?.storeId]);

    useEffect(() => {
        if (loadingList) return;
        if (activeId) return;
        if (conversations.length) openConversation(conversations[0]._id, { replace: true }).catch(() => null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadingList, conversations]);

    useEffect(() => {
        if (context !== 'customer') return;
        const q = storeSearch.trim();
        if (q.length < 2) {
            setStoreResults([]);
            return;
        }
        const t = setTimeout(async () => {
            const res = await chatService.searchStores(q);
            if (res.success) setStoreResults(res.data);
        }, 300);
        return () => clearTimeout(t);
    }, [context, storeSearch]);

    useEffect(() => {
        if (context !== 'superadmin') return;
        const q = userSearch.trim();
        if (q.length < 2) {
            setStoreAdminResults([]);
            return;
        }
        const t = setTimeout(async () => {
            const res = await superAdminService.getAllUsers({ role: 'store_admin', search: q, limit: 10 });
            if (res.success) setStoreAdminResults(res.data);
        }, 300);
        return () => clearTimeout(t);
    }, [context, userSearch]);

    const onSend = async (e) => {
        e.preventDefault();
        if (!activeConversation) return;
        const text = draft.trim();
        if (!text) return;
        setDraft('');
        const res = await chatService.sendMessage(activeConversation._id, text);
        if (res.success) {
            appendMessageIfNew(res.data, activeConversation._id);
            chatService.markRead(activeConversation._id).catch(() => null);
            scrollToBottom('smooth');
        }
    };

    const onClickStoreResult = async (storeId) => {
        const res = await chatService.createStoreChat(storeId);
        if (res.success) {
            await refreshConversations();
            await openConversation(res.data._id);
            setStoreSearch('');
            setStoreResults([]);
        }
    };

    const onClickStoreAdminResult = async (storeAdminId) => {
        const res = await chatService.createSupportChatWithStoreAdmin(storeAdminId);
        if (res.success) {
            await refreshConversations();
            await openConversation(res.data._id);
            setUserSearch('');
            setStoreAdminResults([]);
        }
    };

    const onMessageStoreAdmin = async () => {
        const res = await chatService.createInternalChatWithStoreAdmin();
        if (res.success) {
            await refreshConversations();
            await openConversation(res.data._id);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="p-6 bg-white rounded-xl border border-gray-200">
                <div className="text-gray-700">Please login to use chat.</div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-[calc(100vh-12rem)] min-h-[520px]">
            <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
                {/* Left: list */}
                <div className="border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col min-h-0">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FiMessageCircle className="text-gray-700" />
                            <h2 className="font-semibold text-gray-900">Chat</h2>
                        </div>
                    </div>

                    {context === 'customer' && (
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                                <FiSearch />
                                <span>Search a store to message</span>
                            </div>
                            <input
                                value={storeSearch}
                                onChange={(e) => setStoreSearch(e.target.value)}
                                placeholder="Type store name..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            {storeResults.length > 0 && (
                                <div className="mt-2 max-h-48 overflow-auto border border-gray-200 rounded-lg">
                                    {storeResults.map((s) => (
                                        <button
                                            key={s._id}
                                            type="button"
                                            onClick={() => onClickStoreResult(s._id)}
                                            className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center justify-between"
                                        >
                                            <span className="font-medium text-gray-900">{s.name}</span>
                                            <span className="text-xs text-primary-600">Message</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {context === 'superadmin' && (
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                                <FiSearch />
                                <span>Search store admin</span>
                            </div>
                            <input
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                placeholder="Name or email..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                            {storeAdminResults.length > 0 && (
                                <div className="mt-2 max-h-48 overflow-auto border border-gray-200 rounded-lg">
                                    {storeAdminResults.map((u) => (
                                        <button
                                            key={u._id}
                                            type="button"
                                            onClick={() => onClickStoreAdminResult(u._id)}
                                            className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center justify-between"
                                        >
                                            <span className="font-medium text-gray-900">{u.name}</span>
                                            <span className="text-xs text-red-600">Message</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {context === 'staff' && user?.role === 'store_manager' && (
                        <div className="p-4 border-b border-gray-200">
                            <button
                                type="button"
                                onClick={onMessageStoreAdmin}
                                className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Message Store Admin
                            </button>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto">
                        {loadingList ? (
                            <div className="p-4 text-gray-500">Loading conversations...</div>
                        ) : conversations.length === 0 ? (
                            <div className="p-4 text-gray-500">No conversations yet.</div>
                        ) : (
                            conversations.map((conv) => {
                                const active = getConversationKey(conv) === activeId;
                                return (
                                    <button
                                        key={conv._id}
                                        type="button"
                                        onClick={() => openConversation(conv._id)}
                                        className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${active ? 'bg-gray-50' : ''}`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <div className="font-medium text-gray-900 truncate">
                                                    {getConversationTitle(conv, user)}
                                                </div>
                                                <div className="text-sm text-gray-600 truncate">
                                                    {getConversationSubtitle(conv)}
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-400 whitespace-nowrap">
                                                {formatTime(conv.lastMessageAt)}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right: messages */}
                <div className="lg:col-span-2 flex flex-col min-h-0">
                    <div className="p-4 border-b border-gray-200">
                        <div className="font-semibold text-gray-900">
                            {activeConversation ? getConversationTitle(activeConversation, user) : 'Select a conversation'}
                        </div>
                        {activeConversation?.kind === 'store_customer' && user?.role === 'customer' && activeConversation?.store?._id && (
                            <button
                                type="button"
                                onClick={() => navigate(`/stores/${activeConversation.store._id}`)}
                                className="text-sm text-primary-600 hover:underline"
                            >
                                View store
                            </button>
                        )}
                    </div>

                    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 min-h-0">
                        {loadingMessages ? (
                            <div className="text-gray-500">Loading messages...</div>
                        ) : !activeConversation ? (
                            <div className="text-gray-500">Pick a conversation to start.</div>
                        ) : messages.length === 0 ? (
                            <div className="text-gray-500">No messages yet. Say hi!</div>
                        ) : (
                            messages.map((m) => {
                                const mine = m.sender?._id === user?._id;
                                return (
                                    <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${mine ? 'bg-primary-600 text-white' : 'bg-white text-gray-900 border border-gray-200'}`}>
                                            <div className="text-sm whitespace-pre-wrap break-words">{m.text}</div>
                                            <div className={`text-[11px] mt-1 ${mine ? 'text-primary-100' : 'text-gray-400'}`}>
                                                {mine ? 'You' : (m.sender?.name || 'User')} • {formatTime(m.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={bottomRef} />
                    </div>

                    <form onSubmit={onSend} className="p-4 border-t border-gray-200 flex gap-2 bg-white">
                        <input
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            disabled={!activeConversation}
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            disabled={!activeConversation}
                        >
                            <FiSend />
                            <span className="hidden sm:inline">Send</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatShell;
