import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    items: [],
    loading: false,
    error: null,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        setCart: (state, action) => {
            state.items = action.payload;
        },
        addToCartLocal: (state, action) => {
            const existingItem = state.items.find(
                (item) => item.product._id === action.payload.product._id
            );
            if (existingItem) {
                existingItem.quantity += action.payload.quantity;
            } else {
                state.items.push(action.payload);
            }
        },
        removeFromCartLocal: (state, action) => {
            state.items = state.items.filter((item) => item._id !== action.payload);
        },
        updateCartItemLocal: (state, action) => {
            const item = state.items.find((item) => item._id === action.payload.itemId);
            if (item) {
                item.quantity = action.payload.quantity;
            }
        },
        clearCart: (state) => {
            state.items = [];
        },
    },
});

export const {
    setCart,
    addToCartLocal,
    removeFromCartLocal,
    updateCartItemLocal,
    clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
