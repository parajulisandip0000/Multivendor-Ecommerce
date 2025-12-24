import { io } from 'socket.io-client';

let socket;
let lastToken;

const getSocketUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
};

export const getSocket = (token) => {
    if (!token) return null;

    if (socket && lastToken === token) return socket;

    if (socket) {
        socket.disconnect();
        socket = null;
    }

    lastToken = token;
    socket = io(getSocketUrl(), {
        transports: ['websocket'],
        auth: { token },
    });

    return socket;
};

export const disconnectSocket = () => {
    if (socket) socket.disconnect();
    socket = null;
    lastToken = null;
};

