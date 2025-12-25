import { io } from 'socket.io-client';
import { getSocketUrl } from '../config/urls';

let socket;
let lastToken;

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
