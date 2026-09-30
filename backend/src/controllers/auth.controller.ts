import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/client';
import { Role } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const JWT_SECRET = process.env.JWT_SECRET || 'yolda_jwt_secret_key_prod_render_2026';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, password, role } = req.body;

    // Girdi doğrulamaları
    if (!fullName || !email || !password || !role) {
      res.status(400).json({ message: 'Tüm alanlar (fullName, email, password, role) zorunludur.' });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      res.status(400).json({ message: 'Lütfen geçerli bir e-posta adresi girin.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: 'Şifre en az 6 karakter olmalıdır.' });
      return;
    }

    if (role !== Role.CUSTOMER && role !== Role.DRIVER) {
      res.status(400).json({ message: "Rol sadece 'CUSTOMER' veya 'DRIVER' olabilir." });
      return;
    }

    // E-posta mükerrerlik kontrolü
    const existingUser = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (existingUser) {
      res.status(400).json({ message: 'Bu e-posta adresi ile kayıtlı bir kullanıcı zaten mevcut.' });
      return;
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Kullanıcıyı oluştur
    const newUser = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: trimmedEmail,
        password: hashedPassword,
        role: role as Role,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // JWT token üret
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: 'Kayıt başarılı.',
      user: newUser,
      token,
    });
  } catch (error: any) {
    console.error('[Register Error]:', error);
    res.status(500).json({ message: 'Sunucu hatası: Kayıt işlemi gerçekleştirilemedi.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'E-posta ve şifre zorunludur.' });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (!user) {
      res.status(401).json({ message: 'E-posta veya şifre hatalı.' });
      return;
    }

    // Şifreyi doğrula
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'E-posta veya şifre hatalı.' });
      return;
    }

    // JWT token üret
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(200).json({
      message: 'Giriş başarılı.',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error: any) {
    console.error('[Login Error]:', error);
    res.status(500).json({ message: 'Sunucu hatası: Giriş yapılamadı.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Yetkilendirme gerekli.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
      return;
    }

    res.status(200).json({ user });
  } catch (error: any) {
    console.error('[GetMe Error]:', error);
    res.status(500).json({ message: 'Profil bilgisi alınırken hata oluştu.' });
  }
};
