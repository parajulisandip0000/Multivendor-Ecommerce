import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    products: [],
    currentProduct: null,
    loading: false,
    error: null,
    filters: {
        category: '',
        minPrice: '',
        maxPrice: '',
        search: '',
        sort: '-createdAt',
    },
    pagination: {
        page: 1,
        limit: 12,
        total: 0,
        pages: 0,
    },
};

const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        setProducts: (state, action) => {
            state.products = action.payload;
        },
        setCurrentProduct: (state, action) => {
            state.currentProduct = action.payload;
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        setPagination: (state, action) => {
            state.pagination = { ...state.pagination, ...action.payload };
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
});

export const {
    setProducts,
    setCurrentProduct,
    setFilters,
    setPagination,
    setLoading,
    setError,
} = productSlice.actions;

export default productSlice.reducer;
