import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { initSocket } from './socket/socket';

// .env dosyasını yükle
dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io'yu başlat
initSocket(server);

// Middleware'ler
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// Sağlık kontrolü ve karşılama uç noktaları
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    name: 'Yolda API',
    description: 'Martı TAG Benzeri Mini Yolculuk Talep Platformu Backend Servisi',
    version: '1.0.0',
    status: 'ONLINE',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

// API Rotaları
app.use('/api', routes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: `Kaynak bulunamadı: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Unhandled Error]:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Beklenmeyen bir sunucu hatası meydana geldi.',
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚗 Yolda Backend Servisi Başlatıldı!`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`⚡ Socket.io: Aktif`);
  console.log(`===============================================`);
});

export { app, server };
