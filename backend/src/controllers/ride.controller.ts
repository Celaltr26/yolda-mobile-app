import { Response } from 'express';
import { prisma } from '../prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';
import { RideStatus, Role } from '@prisma/client';
import { emitNewRideRequest, emitRideStatusUpdated } from '../socket/socket';

// Müşteri: Yeni yolculuk talebi oluştur
export const createRide = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { originAddress, destinationAddress } = req.body;

    if (!originAddress || !destinationAddress) {
      res.status(400).json({ message: 'Başlangıç ve varış adresleri zorunludur.' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: 'Yetkilendirme gerekli.' });
      return;
    }

    const newRide = await prisma.ride.create({
      data: {
        customerId: req.user.id,
        originAddress: originAddress.trim(),
        destinationAddress: destinationAddress.trim(),
        status: RideStatus.PENDING,
      },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
        driver: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Socket.io ile sürücülere anlık yeni talep bildirimi gönder
    emitNewRideRequest(newRide);

    res.status(201).json({
      message: 'Yolculuk talebi başarıyla oluşturuldu.',
      ride: newRide,
    });
  } catch (error: any) {
    console.error('[CreateRide Error]:', error);
    res.status(500).json({ message: 'Yolculuk talebi oluşturulurken hata oluştu.' });
  }
};

// Kullanıcının kendi talepleri (Müşteri kendi açtıklarını, Sürücü kabul ettiklerini görür)
export const getMyRides = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Yetkilendirme gerekli.' });
      return;
    }

    const isCustomer = req.user.role === Role.CUSTOMER;

    const rides = await prisma.ride.findMany({
      where: isCustomer
        ? { customerId: req.user.id }
        : { driverId: req.user.id },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        driver: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({ rides });
  } catch (error: any) {
    console.error('[GetMyRides Error]:', error);
    res.status(500).json({ message: 'Yolculuklar listelenirken hata oluştu.' });
  }
};

// Sürücü: Bekleyen PENDING talepleri listele
export const getPendingRides = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rides = await prisma.ride.findMany({
      where: {
        status: RideStatus.PENDING,
      },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({ rides });
  } catch (error: any) {
    console.error('[GetPendingRides Error]:', error);
    res.status(500).json({ message: 'Bekleyen talepler listelenirken hata oluştu.' });
  }
};

// Sürücü: PENDING durumundaki talebi kabul et -> ACCEPTED
export const acceptRide = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({ message: 'Yetkilendirme gerekli.' });
      return;
    }

    const ride = await prisma.ride.findUnique({
      where: { id },
    });

    if (!ride) {
      res.status(404).json({ message: 'Yolculuk talebi bulunamadı.' });
      return;
    }

    if (ride.status !== RideStatus.PENDING) {
      res.status(400).json({
        message: 'Bu yolculuk artık beklemede değil veya başka bir sürücü tarafından kabul edilmiş.',
      });
      return;
    }

    const updatedRide = await prisma.ride.update({
      where: { id },
      data: {
        driverId: req.user.id,
        status: RideStatus.ACCEPTED,
      },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        driver: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    // Socket.io ile güncelleme yayınla
    emitRideStatusUpdated(updatedRide);

    res.status(200).json({
      message: 'Yolculuk başarıyla kabul edildi.',
      ride: updatedRide,
    });
  } catch (error: any) {
    console.error('[AcceptRide Error]:', error);
    res.status(500).json({ message: 'Yolculuk kabul edilirken hata oluştu.' });
  }
};

// Sürücü: Talebi tamamla -> COMPLETED
export const completeRide = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({ message: 'Yetkilendirme gerekli.' });
      return;
    }

    const ride = await prisma.ride.findUnique({
      where: { id },
    });

    if (!ride) {
      res.status(404).json({ message: 'Yolculuk talebi bulunamadı.' });
      return;
    }

    if (ride.driverId !== req.user.id) {
      res.status(403).json({ message: 'Bu yolculuğu sadece kabul eden sürücü tamamlayabilir.' });
      return;
    }

    if (ride.status !== RideStatus.ACCEPTED) {
      res.status(400).json({ message: 'Sadece kabul edilmiş (ACCEPTED) yolculuklar tamamlanabilir.' });
      return;
    }

    const updatedRide = await prisma.ride.update({
      where: { id },
      data: {
        status: RideStatus.COMPLETED,
      },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        driver: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    // Socket.io ile güncelleme yayınla
    emitRideStatusUpdated(updatedRide);

    res.status(200).json({
      message: 'Yolculuk tamamlandı.',
      ride: updatedRide,
    });
  } catch (error: any) {
    console.error('[CompleteRide Error]:', error);
    res.status(500).json({ message: 'Yolculuk tamamlanırken hata oluştu.' });
  }
};

// Müşteri: Henüz PENDING ise iptal et -> CANCELLED
export const cancelRide = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({ message: 'Yetkilendirme gerekli.' });
      return;
    }

    const ride = await prisma.ride.findUnique({
      where: { id },
    });

    if (!ride) {
      res.status(404).json({ message: 'Yolculuk talebi bulunamadı.' });
      return;
    }

    if (ride.customerId !== req.user.id) {
      res.status(403).json({ message: 'Bu yolculuğu sadece talep sahibi iptal edebilir.' });
      return;
    }

    if (ride.status !== RideStatus.PENDING) {
      res.status(400).json({
        message: 'Kabul edilmiş veya tamamlanmış yolculuklar iptal edilemez.',
      });
      return;
    }

    const updatedRide = await prisma.ride.update({
      where: { id },
      data: {
        status: RideStatus.CANCELLED,
      },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        driver: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    // Socket.io ile güncelleme yayınla
    emitRideStatusUpdated(updatedRide);

    res.status(200).json({
      message: 'Yolculuk talebi iptal edildi.',
      ride: updatedRide,
    });
  } catch (error: any) {
    console.error('[CancelRide Error]:', error);
    res.status(500).json({ message: 'Yolculuk iptal edilirken hata oluştu.' });
  }
};
