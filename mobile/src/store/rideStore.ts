import { create } from 'zustand';
import {
  Ride,
  CreateRidePayload,
  createRide,
  fetchMyRides,
  fetchPendingRides,
  acceptRide,
  completeRide,
  cancelRide,
} from '../api/ride.api';

interface RideState {
  myRides: Ride[];
  pendingRides: Ride[];
  activeRide: Ride | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Eylemler
  fetchMyRides: () => Promise<void>;
  fetchPendingRides: () => Promise<void>;
  createNewRide: (payload: CreateRidePayload) => Promise<Ride | null>;
  acceptRideById: (id: string) => Promise<boolean>;
  completeRideById: (id: string) => Promise<boolean>;
  cancelRideById: (id: string) => Promise<boolean>;
  setActiveRide: (ride: Ride | null) => void;
  clearError: () => void;

  // Socket güncellemeleri
  handleSocketNewRide: (ride: Ride) => void;
  handleSocketRideUpdated: (ride: Ride) => void;
}

export const useRideStore = create<RideState>((set, get) => ({
  myRides: [],
  pendingRides: [],
  activeRide: null,
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchMyRides: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchMyRides();
      const rides = data.rides || [];
      // Aktif sürüşü belirle (PENDING veya ACCEPTED durumundaki en güncel talep)
      const currentActive = rides.find(
        (r) => r.status === 'PENDING' || r.status === 'ACCEPTED'
      );
      set({
        myRides: rides,
        activeRide: currentActive || null,
        isLoading: false,
      });
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || 'Yolculuklar yüklenirken hata oluştu.';
      set({ isLoading: false, error: message });
    }
  },

  fetchPendingRides: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchPendingRides();
      set({ pendingRides: data.rides || [], isLoading: false });
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || 'Bekleyen talepler alınamadı.';
      set({ isLoading: false, error: message });
    }
  },

  createNewRide: async (payload: CreateRidePayload) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await createRide(payload);
      const newRide = res.ride;

      set((state) => ({
        isSubmitting: false,
        myRides: [newRide, ...state.myRides],
        activeRide: newRide,
      }));

      return newRide;
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || 'Yolculuk talebi oluşturulamadı.';
      set({ isSubmitting: false, error: message });
      return null;
    }
  },

  acceptRideById: async (id: string) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await acceptRide(id);
      const updated = res.ride;

      set((state) => ({
        isSubmitting: false,
        activeRide: updated,
        pendingRides: state.pendingRides.filter((r) => r.id !== id),
        myRides: [updated, ...state.myRides.filter((r) => r.id !== id)],
      }));

      return true;
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || 'Yolculuk kabul edilemedi.';
      set({ isSubmitting: false, error: message });
      return false;
    }
  },

  completeRideById: async (id: string) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await completeRide(id);
      const updated = res.ride;

      set((state) => ({
        isSubmitting: false,
        activeRide: null,
        myRides: state.myRides.map((r) => (r.id === id ? updated : r)),
      }));

      return true;
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || 'Yolculuk tamamlanamadı.';
      set({ isSubmitting: false, error: message });
      return false;
    }
  },

  cancelRideById: async (id: string) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await cancelRide(id);
      const updated = res.ride;

      set((state) => ({
        isSubmitting: false,
        activeRide: state.activeRide?.id === id ? null : state.activeRide,
        myRides: state.myRides.map((r) => (r.id === id ? updated : r)),
      }));

      return true;
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || 'Yolculuk iptal edilemedi.';
      set({ isSubmitting: false, error: message });
      return false;
    }
  },

  setActiveRide: (ride) => set({ activeRide: ride }),
  clearError: () => set({ error: null }),

  // Canlı Socket Olayları
  handleSocketNewRide: (newRide: Ride) => {
    set((state) => {
      // Eğer sürücü listesinde zaten yoksa ve durumu PENDING ise listeye ekle
      const exists = state.pendingRides.some((r) => r.id === newRide.id);
      if (!exists && newRide.status === 'PENDING') {
        return {
          pendingRides: [newRide, ...state.pendingRides],
        };
      }
      return state;
    });
  },

  handleSocketRideUpdated: (updatedRide: Ride) => {
    set((state) => {
      // 1. myRides listesini güncelle
      const updatedMyRides = state.myRides.map((r) =>
        r.id === updatedRide.id ? updatedRide : r
      );

      // 2. pendingRides listesinden güncelle / çıkar
      let updatedPending = [...state.pendingRides];
      if (updatedRide.status !== 'PENDING') {
        updatedPending = updatedPending.filter((r) => r.id !== updatedRide.id);
      } else {
        updatedPending = updatedPending.map((r) =>
          r.id === updatedRide.id ? updatedRide : r
        );
      }

      // 3. activeRide durumunu kontrol et
      let currentActive = state.activeRide;
      if (currentActive && currentActive.id === updatedRide.id) {
        if (updatedRide.status === 'COMPLETED' || updatedRide.status === 'CANCELLED') {
          currentActive = null;
        } else {
          currentActive = updatedRide;
        }
      }

      return {
        myRides: updatedMyRides,
        pendingRides: updatedPending,
        activeRide: currentActive,
      };
    });
  },
}));
