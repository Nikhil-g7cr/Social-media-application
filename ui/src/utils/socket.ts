import { io, Socket } from 'socket.io-client';

// Define the URL of your NestJS backend
const SOCKET_URL = 'http://localhost:5000'; 

let socket: Socket | null = null;

export const initializeSocket = (): Socket => {
  // Grab the token from sessionStorage so the backend knows who is connecting
  const token = sessionStorage.getItem('accessToken');

  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: {
        token: token ? `Bearer ${token}` : '', // Pass token in auth payload
      },
      transports: ['websocket'], // Force WebSocket transport for better performance
      autoConnect: true,
    });

    // Optional: Global event listeners for debugging
    socket.on('connect', () => {
      console.log('✅ Connected to WebSocket:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket');
    });

    socket.on('connect_error', (err) => {
      console.error('⚠️ WebSocket Connection Error:', err.message);
    });
  }

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};