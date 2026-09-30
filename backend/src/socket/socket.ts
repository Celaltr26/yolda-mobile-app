import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

let io: SocketIOServer | null = null;

export const initSocket = (server: HttpServer): SocketIOServer => {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.io] Client bağlandı: ${socket.id}`);

    // Kullanıcıya özel odaya katılma (örneğin bildirimler için)
    socket.on('join_user', (userId: string) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`[Socket.io] Socket ${socket.id}, user_${userId} odasına katıldı.`);
      }
    });

    // Sürücülerin ortak bildirim odasına katılması
    socket.on('join_drivers', () => {
      socket.join('drivers');
      console.log(`[Socket.io] Socket ${socket.id}, 'drivers' odasına katıldı.`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client bağlantısı koptu: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io henüz başlatılmadı. Lütfen önce initSocket çağırın.');
  }
  return io;
};

export const emitNewRideRequest = (ride: unknown): void => {
  if (io) {
    // Hem genel kanala hem sürücüler odasına emit et
    io.emit('new_ride_request', ride);
  }
};

export const emitRideStatusUpdated = (ride: unknown): void => {
  if (io) {
    // Tüm dinleyicilere güncel yolculuk bilgisini yay
    io.emit('ride_status_updated', ride);
  }
};
