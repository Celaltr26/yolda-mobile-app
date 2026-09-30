import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// POST /api/auth/register (isim, email, şifre, rol [CUSTOMER veya DRIVER])
router.post('/register', register);

// POST /api/auth/login (JWT token ve kullanıcı bilgisi döner)
router.post('/login', login);

// GET /api/auth/me (Giriş yapan kullanıcının profili)
router.get('/me', authMiddleware, getMe);

export default router;
