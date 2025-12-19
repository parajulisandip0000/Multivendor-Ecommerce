import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services';

export const loadUser = createAsyncThunk(
    'auth/loadUser',
    async (_, { rejectWithValue }) => {
        try {
            const data = await authService.getMe();
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to load user');
        }
    }
);

const initialState = {
    user: null,
    token: localStorage.getItem('token') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.refreshToken = action.payload.refreshToken;
            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('refreshToken', action.payload.refreshToken);
        },
        loginFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
        },
        setUser: (state, action) => {
            state.user = action.payload;
        },
        updateToken: (state, action) => {
            state.token = action.payload;
            localStorage.setItem('token', action.payload);
        },
        updateUserAvatar: (state, action) => {
            if (state.user) {
                state.user.avatar = action.payload;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(loadUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
            })
            .addCase(loadUser.rejected, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                state.refreshToken = null;
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
            });
    },
});

export const {
    loginStart,
    loginSuccess,
    loginFailure,
    logout,
    setUser,
    updateToken,
    updateUserAvatar,
} = authSlice.actions;

export default authSlice.reducer;
