import api from './api';

export const authService = {
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    logout: async () => {
        const response = await api.post('/auth/logout');
        return response.data;
    },

    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    updateMe: async (data) => {
        const response = await api.put('/auth/me', data);
        return response.data;
    },

    changePassword: async (data) => {
        const response = await api.post('/auth/change-password', data);
        return response.data;
    },

    updateProfilePicture: async (formData) => {
        const response = await api.post('/auth/profile-picture', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
};

export const productService = {
    getProducts: async (params) => {
        const response = await api.get('/products', { params });
        return response.data;
    },

    getProduct: async (id) => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    getProductReviews: async (id, params) => {
        const response = await api.get(`/products/${id}/reviews`, { params });
        return response.data;
    },
};

export const storeService = {
    getStore: async (storeId) => {
        const response = await api.get(`/stores/${storeId}`);
        return response.data;
    },

    getStoreProducts: async (storeId, params) => {
        const response = await api.get(`/stores/${storeId}/products`, { params });
        return response.data;
    },
};

export const customerService = {
    // Cart
    getCart: async () => {
        const response = await api.get('/customer/cart');
        return response.data;
    },

    addToCart: async (data) => {
        const response = await api.post('/customer/cart', data);
        return response.data;
    },

    updateCartItem: async (itemId, data) => {
        const response = await api.put(`/customer/cart/${itemId}`, data);
        return response.data;
    },

    removeFromCart: async (itemId) => {
        const response = await api.delete(`/customer/cart/${itemId}`);
        return response.data;
    },

    // Wishlist
    getWishlist: async () => {
        const response = await api.get('/customer/wishlist');
        return response.data;
    },

    addToWishlist: async (productId) => {
        const response = await api.post('/customer/wishlist', { productId });
        return response.data;
    },

    removeFromWishlist: async (itemId) => {
        const response = await api.delete(`/customer/wishlist/${itemId}`);
        return response.data;
    },

    // Orders
    createOrder: async (orderData) => {
        const response = await api.post('/customer/orders', orderData);
        return response.data;
    },

    getOrders: async (params) => {
        const response = await api.get('/customer/orders', { params });
        return response.data;
    },

    // Reviews
    createReview: async (reviewData) => {
        const response = await api.post('/customer/reviews', reviewData);
        return response.data;
    },
};

export const chatService = {
    listConversations: async (params) => {
        const response = await api.get('/chat/conversations', { params });
        return response.data;
    },

    getConversation: async (conversationId) => {
        const response = await api.get(`/chat/conversations/${conversationId}`);
        return response.data;
    },

    listMessages: async (conversationId, params) => {
        const response = await api.get(`/chat/conversations/${conversationId}/messages`, { params });
        return response.data;
    },

    sendMessage: async (conversationId, text) => {
        const response = await api.post(`/chat/conversations/${conversationId}/messages`, { text });
        return response.data;
    },

    markRead: async (conversationId) => {
        const response = await api.post(`/chat/conversations/${conversationId}/read`);
        return response.data;
    },

    // Customer starts a store chat
    createStoreChat: async (storeId) => {
        const response = await api.post(`/chat/store/${storeId}/message`);
        return response.data;
    },

    // Store staff starts a customer chat
    createCustomerChat: async (storeId, customerId) => {
        const response = await api.post(`/chat/store/${storeId}/customer/${customerId}/message`);
        return response.data;
    },

    // SuperAdmin starts chat with store admin
    createSupportChatWithStoreAdmin: async (storeAdminId) => {
        const response = await api.post(`/chat/support/store-admin/${storeAdminId}`);
        return response.data;
    },

    // Store admin starts chat with manager
    createInternalChatWithManager: async (managerId) => {
        const response = await api.post(`/chat/internal/manager/${managerId}`);
        return response.data;
    },

    createInternalChatWithStoreAdmin: async () => {
        const response = await api.post('/chat/internal/store-admin');
        return response.data;
    },

    searchStores: async (q) => {
        const response = await api.get('/chat/stores/search', { params: { q } });
        return response.data;
    },
};

export const storeAdminService = {
    registerStore: async (storeData) => {
        const response = await api.post('/store-admin/register', storeData);
        return response.data;
    },

    getDashboard: async () => {
        const response = await api.get('/store-admin/dashboard');
        return response.data;
    },

    updateProfile: async (data) => {
        const response = await api.put('/store-admin/profile', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    getAnalytics: async () => {
        const response = await api.get('/store-admin/analytics');
        return response.data;
    },

    addManager: async (managerData) => {
        const response = await api.post('/store-admin/managers', managerData);
        return response.data;
    },

    getManagers: async () => {
        const response = await api.get('/store-admin/managers');
        return response.data;
    },
    updateManager: async (id, data) => {
        const response = await api.put(`/store-admin/managers/${id}`, data);
        return response.data;
    },
    deleteManager: async (id) => {
        const response = await api.delete(`/store-admin/managers/${id}`);
        return response.data;
    },
    toggleManagerStatus: async (id, isActive) => {
        const response = await api.patch(`/store-admin/managers/${id}/status`, { isActive });
        return response.data;
    },

    // Product Management
    createProduct: async (productData) => {
        const response = await api.post('/store-admin/products', productData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    getProducts: async (params) => {
        const response = await api.get('/store-admin/products', { params });
        return response.data;
    },

    getProduct: async (id) => {
        const response = await api.get(`/store-admin/products/${id}`);
        return response.data;
    },

    updateProduct: async (id, productData) => {
        const response = await api.put(`/store-admin/products/${id}`, productData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    deleteProduct: async (id) => {
        const response = await api.delete(`/store-admin/products/${id}`);
        return response.data;
    },

    // Order Management
    getOrders: async (params) => {
        const response = await api.get('/store-admin/orders', { params });
        return response.data;
    },

    getOrder: async (id) => {
        const response = await api.get(`/store-admin/orders/${id}`);
        return response.data;
    },

    updateOrderStatus: async (id, status) => {
        const response = await api.patch(`/store-admin/orders/${id}/status`, { status });
        return response.data;
    },
};

export const storeManagerService = {
    getDashboard: async () => {
        const response = await api.get('/store-manager/dashboard');
        return response.data;
    },

    getProducts: async (params) => {
        const response = await api.get('/store-manager/products', { params });
        return response.data;
    },

    createProduct: async (formData) => {
        const response = await api.post('/store-manager/products', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    updateProduct: async (productId, formData) => {
        const response = await api.put(`/store-manager/products/${productId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    deleteProduct: async (productId) => {
        const response = await api.delete(`/store-manager/products/${productId}`);
        return response.data;
    },

    getOrders: async (params) => {
        const response = await api.get('/store-manager/orders', { params });
        return response.data;
    },

    updateOrderStatus: async (orderId, data) => {
        const response = await api.put(`/store-manager/orders/${orderId}/status`, data);
        return response.data;
    },

    getAnalytics: async (params) => {
        const response = await api.get('/store-manager/analytics', { params });
        return response.data;
    },

    getStoreSettings: async () => {
        const response = await api.get('/store-manager/settings');
        return response.data;
    },

    updateStoreSettings: async (data) => {
        const response = await api.put('/store-manager/settings', data);
        return response.data;
    },
};

export const superAdminService = {
    getDashboard: async () => {
        const response = await api.get('/superadmin/dashboard');
        return response.data;
    },

    getStoreRequests: async (params) => {
        const response = await api.get('/superadmin/stores/requests', { params });
        return response.data;
    },

    approveStore: async (storeId) => {
        const response = await api.put(`/superadmin/stores/${storeId}/approve`);
        return response.data;
    },

    rejectStore: async (storeId, reason) => {
        const response = await api.put(`/superadmin/stores/${storeId}/reject`, { reason });
        return response.data;
    },

    getAllStores: async (params) => {
        const response = await api.get('/superadmin/stores', { params });
        return response.data;
    },

    updateStoreStatus: async (storeId, status) => {
        const response = await api.put(`/superadmin/stores/${storeId}/status`, { status });
        return response.data;
    },

    getAllUsers: async (params) => {
        const response = await api.get('/superadmin/users', { params });
        return response.data;
    },

    updateUserStatus: async (userId, isActive) => {
        const response = await api.put(`/superadmin/users/${userId}/status`, { isActive });
        return response.data;
    },

    getAllProducts: async (params) => {
        const response = await api.get('/superadmin/products', { params });
        return response.data;
    },

    deleteProduct: async (productId) => {
        const response = await api.delete(`/superadmin/products/${productId}`);
        return response.data;
    },

    getSystemLogs: async (params) => {
        const response = await api.get('/superadmin/logs', { params });
        return response.data;
    },

    getSystemSettings: async () => {
        const response = await api.get('/superadmin/settings');
        return response.data;
    },

    updateSystemSettings: async (data) => {
        const response = await api.put('/superadmin/settings', data);
        return response.data;
    },
};
