export interface User {
  id: string;
  clinic_id: string;
  email: string;
  name: string;
  role: 'admin' | 'doctor' | 'receptionist' | 'client';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  clinic_name: string;
}

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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
