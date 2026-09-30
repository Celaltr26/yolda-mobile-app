import apiClient from './client';
import { User } from './auth.api';

export type RideStatus = 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';

export interface Ride {
  id: string;
  customerId: string;
  driverId: string | null;
  originAddress: string;
  destinationAddress: string;
  status: RideStatus;
  createdAt: string;
  updatedAt: string;
  customer?: Partial<User>;
  driver?: Partial<User> | null;
}

export interface CreateRidePayload {
  originAddress: string;
  destinationAddress: string;
}

export interface RideResponse {
  message: string;
  ride: Ride;
}

export interface RidesListResponse {
  rides: Ride[];
}

export const createRide = async (data: CreateRidePayload): Promise<RideResponse> => {
  const response = await apiClient.post<RideResponse>('/rides', data);
  return response.data;
};

export const fetchMyRides = async (): Promise<RidesListResponse> => {
  const response = await apiClient.get<RidesListResponse>('/rides/my-rides');
  return response.data;
};

export const fetchPendingRides = async (): Promise<RidesListResponse> => {
  const response = await apiClient.get<RidesListResponse>('/rides/pending');
  return response.data;
};

export const acceptRide = async (id: string): Promise<RideResponse> => {
  const response = await apiClient.patch<RideResponse>(`/rides/${id}/accept`);
  return response.data;
};

export const completeRide = async (id: string): Promise<RideResponse> => {
  const response = await apiClient.patch<RideResponse>(`/rides/${id}/complete`);
  return response.data;
};

export const cancelRide = async (id: string): Promise<RideResponse> => {
  const response = await apiClient.patch<RideResponse>(`/rides/${id}/cancel`);
  return response.data;
};
