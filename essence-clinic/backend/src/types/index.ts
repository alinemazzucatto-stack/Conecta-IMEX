import { Request } from 'express';

// User types
export interface User {
  id: string;
  clinic_id: string;
  email: string;
  name: string;
  role: 'admin' | 'doctor' | 'receptionist' | 'client';
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  clinic_id?: string;
  role?: 'admin' | 'doctor' | 'receptionist' | 'client';
}

export interface LoginRequest {
  email: string;
  password: string;
  clinic_code?: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

// JWT Payload
export interface JWTPayload {
  user_id: string;
  clinic_id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Authenticated Request
export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

// Clinic types
export interface Clinic {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// Professional types
export interface Professional {
  id: string;
  clinic_id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  crm: string;
  bio?: string;
  avatar_url?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Appointment types
export interface Appointment {
  id: string;
  clinic_id: string;
  professional_id: string;
  client_id: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Client types
export interface Client {
  id: string;
  clinic_id: string;
  name: string;
  email: string;
  phone: string;
  date_of_birth?: string;
  gender?: string;
  cpf?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
