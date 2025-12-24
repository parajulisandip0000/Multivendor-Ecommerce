import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { storeAdminService } from '../../services';

// Thunks
export const fetchDashboard = createAsyncThunk(
    'seller/fetchDashboard',
    async (_, { rejectWithValue }) => {
        try {
            const data = await storeAdminService.getDashboard();
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard');
        }
    },
    {
        condition: (_, { getState }) => {
            const state = getState();
            return !state.seller.loading;
        },
    }
);

export const fetchSellerProducts = createAsyncThunk(
    'seller/fetchProducts',
    async (params, { rejectWithValue }) => {
        try {
            const data = await storeAdminService.getProducts(params);
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
        }
    }
);

export const fetchSellerProductDetails = createAsyncThunk(
    'seller/fetchProductDetails',
    async (id, { rejectWithValue }) => {
        try {
            const data = await storeAdminService.getProduct(id);
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch product details');
        }
    }
);

export const createSellerProduct = createAsyncThunk(
    'seller/createProduct',
    async (productData, { rejectWithValue }) => {
        try {
            const data = await storeAdminService.createProduct(productData);
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create product');
        }
    }
);

export const updateSellerProduct = createAsyncThunk(
    'seller/updateProduct',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await storeAdminService.updateProduct(id, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update product');
        }
    }
);

export const deleteSellerProduct = createAsyncThunk(
    'seller/deleteProduct',
    async (id, { rejectWithValue }) => {
        try {
            await storeAdminService.deleteProduct(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete product');
        }
    }
);

export const fetchSellerOrders = createAsyncThunk(
    'seller/fetchOrders',
    async (params, { rejectWithValue }) => {
        try {
            const data = await storeAdminService.getOrders(params);
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
        }
    }
);

export const fetchSellerOrderDetails = createAsyncThunk(
    'seller/fetchOrderDetails',
    async (id, { rejectWithValue }) => {
        try {
            const data = await storeAdminService.getOrder(id);
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch order details');
        }
    }
);

export const updateSellerOrderStatus = createAsyncThunk(
    'seller/updateOrderStatus',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const data = await storeAdminService.updateOrderStatus(id, status);
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update order status');
        }
    }
);

const initialState = {
    stats: null,
    recentOrders: [], // from dashboard
    products: [],
    currentProduct: null,
    orders: [], // full orders list
    currentOrder: null,
    loading: false,
    error: null,
    storeProfile: null,
};

const sellerSlice = createSlice({
    name: 'seller',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentProduct: (state) => {
            state.currentProduct = null;
        },
        clearCurrentOrder: (state) => {
            state.currentOrder = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Dashboard
            .addCase(fetchDashboard.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboard.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload.stats;
                state.recentOrders = action.payload.recentOrders;
                state.storeProfile = action.payload.store;
            })
            .addCase(fetchDashboard.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Products
            .addCase(fetchSellerProducts.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchSellerProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload;
            })
            .addCase(fetchSellerProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Product Details
            .addCase(fetchSellerProductDetails.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchSellerProductDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.currentProduct = action.payload;
            })
            .addCase(fetchSellerProductDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create Product
            .addCase(createSellerProduct.fulfilled, (state, action) => {
                state.products.unshift(action.payload);
            })
            // Update Product
            .addCase(updateSellerProduct.fulfilled, (state, action) => {
                const index = state.products.findIndex(p => p._id === action.payload._id);
                if (index !== -1) {
                    state.products[index] = action.payload;
                }
            })
            // Delete Product
            .addCase(deleteSellerProduct.fulfilled, (state, action) => {
                state.products = state.products.filter(p => p._id !== action.payload);
            })
            // Orders
            .addCase(fetchSellerOrders.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchSellerOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload;
            })
            .addCase(fetchSellerOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Order Details
            .addCase(fetchSellerOrderDetails.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchSellerOrderDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload;
            })
            .addCase(fetchSellerOrderDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update Order Status
            .addCase(updateSellerOrderStatus.fulfilled, (state, action) => {
                const index = state.orders.findIndex(o => o._id === action.payload._id);
                if (index !== -1) {
                    state.orders[index] = action.payload;
                }
                if (state.currentOrder && state.currentOrder._id === action.payload._id) {
                    state.currentOrder = action.payload;
                }
                const recentIndex = state.recentOrders.findIndex(o => o._id === action.payload._id);
                if (recentIndex !== -1) {
                    state.recentOrders[recentIndex] = action.payload;
                }
            });
    },
});

export const { clearError, clearCurrentProduct, clearCurrentOrder } = sellerSlice.actions;
export default sellerSlice.reducer;
