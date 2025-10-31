export interface User {
  id: number;
  nombre: string;
  correo: string;
  moneda_preferida: string;
  foto_perfil?: string;
  fecha_creacion: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  nombre: string;
  correo: string;
  contrasena: string;
  moneda_preferida: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ChangePasswordData {
  old_password: string;
  new_password: string;
}

export interface UpdateProfileData {
  nombre?: string;
  moneda_preferida?: string;
  foto_perfil?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  getProfile: () => Promise<User>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  deleteAccount: () => Promise<void>;
}
