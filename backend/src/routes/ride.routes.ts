import { Router } from 'express';
import {
  createRide,
  getMyRides,
  getPendingRides,
  acceptRide,
  completeRide,
  cancelRide,
} from '../controllers/ride.controller';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Tüm ride rotaları authentication gerektirir
router.use(authMiddleware);

// POST /api/rides (Sadece Müşteri: Yeni yolculuk talebi oluşturur)
router.post('/', requireRole(Role.CUSTOMER), createRide);

// GET /api/rides/my-rides (Müşteri: Kendi talepleri / Sürücü: Kabul ettiği talepler)
router.get('/my-rides', getMyRides);

// GET /api/rides/pending (Sürücü: Bekleyen PENDING talepler)
router.get('/pending', requireRole(Role.DRIVER), getPendingRides);

// PATCH /api/rides/:id/accept (Sürücü: PENDING durumundaki talebi kabul eder -> ACCEPTED)
router.patch('/:id/accept', requireRole(Role.DRIVER), acceptRide);

// PATCH /api/rides/:id/complete (Sürücü: Talebi tamamlar -> COMPLETED)
router.patch('/:id/complete', requireRole(Role.DRIVER), completeRide);

// PATCH /api/rides/:id/cancel (Müşteri: Henüz PENDING ise iptal eder -> CANCELLED)
router.patch('/:id/cancel', requireRole(Role.CUSTOMER), cancelRide);

export default router;
