import { io, Socket } from 'socket.io-client';
import { getApiBaseUrl } from '../api/client';
import { Ride } from '../api/ride.api';

let socket: Socket | null = null;

export const initMobileSocket = (userId?: string, isDriver?: boolean): Socket => {
  const serverUrl = getApiBaseUrl();

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(serverUrl, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    console.log('[Socket Mobile] Bağlandı. Socket ID:', socket?.id);

    if (userId) {
      socket?.emit('join_user', userId);
    }
    if (isDriver) {
      socket?.emit('join_drivers');
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket Mobile] Bağlantı kesildi. Neden:', reason);
  });

  socket.on('connect_error', (error) => {
    console.warn('[Socket Mobile] Bağlantı hatası:', error.message);
  });

  return socket;
};

export const getMobileSocket = (): Socket | null => {
  return socket;
};

export const disconnectMobileSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const subscribeToNewRideRequests = (callback: (ride: Ride) => void): (() => void) => {
  if (!socket) return () => {};

  socket.on('new_ride_request', callback);
  return () => {
    socket?.off('new_ride_request', callback);
  };
};

export const subscribeToRideStatusUpdates = (callback: (ride: Ride) => void): (() => void) => {
  if (!socket) return () => {};

  socket.on('ride_status_updated', callback);
  return () => {
    socket?.off('ride_status_updated', callback);
  };
};
