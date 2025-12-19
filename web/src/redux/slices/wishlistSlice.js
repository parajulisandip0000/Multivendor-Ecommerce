import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    items: [],
    loading: false,
    error: null,
};

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        setWishlist: (state, action) => {
            state.items = action.payload;
        },
        addToWishlistLocal: (state, action) => {
            state.items.push(action.payload);
        },
        removeFromWishlistLocal: (state, action) => {
            state.items = state.items.filter((item) => item._id !== action.payload);
        },
        clearWishlist: (state) => {
            state.items = [];
        },
    },
});

export const {
    setWishlist,
    addToWishlistLocal,
    removeFromWishlistLocal,
    clearWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
