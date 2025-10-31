"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  LoginCredentials,
  RegisterData,
  AuthContextType,
  AuthResponse,
  UpdateProfileData,
  ChangePasswordData,
} from "../types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Debug logs
  console.log("AuthContext state:", {
    user,
    token,
    isAuthenticated,
    isLoading,
  });

  // Verificar token al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("auth_token");
      if (storedToken) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });

          if (response.ok) {
            // Cargar información completa del perfil
            try {
              const profileResponse = await fetch(
                `${API_BASE_URL}/api/users/profile`,
                {
                  headers: {
                    Authorization: `Bearer ${storedToken}`,
                  },
                }
              );

              if (profileResponse.ok) {
                const profileData = await profileResponse.json();
                setUser(profileData);
                setToken(storedToken);
                console.log("Perfil cargado al verificar token:", profileData);
              } else {
                // Si falla el perfil, usar info básica de /me
                const userData = await response.json();
                setUser(userData);
                setToken(storedToken);
                console.warn(
                  "No se pudo cargar el perfil completo al verificar token"
                );
              }
            } catch (error) {
              console.error("Error cargando perfil al verificar token:", error);
              // Si falla, usar info básica
              const userData = await response.json();
              setUser(userData);
              setToken(storedToken);
            }
          } else {
            localStorage.removeItem("auth_token");
          }
        } catch (error) {
          console.error("Error verificando token:", error);
          localStorage.removeItem("auth_token");
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);

      const formData = new URLSearchParams();
      formData.append("username", credentials.username);
      formData.append("password", credentials.password);

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al iniciar sesión");
      }

      const data = await response.json();

      console.log("Respuesta completa del backend:", data); // Debug log

      // Verificar si la respuesta tiene el formato esperado
      if (data.access_token) {
        localStorage.setItem("auth_token", data.access_token);
        setToken(data.access_token);

        // Cargar información completa del perfil
        try {
          const profileResponse = await fetch(
            `${API_BASE_URL}/api/users/profile`,
            {
              headers: {
                Authorization: `Bearer ${data.access_token}`,
              },
            }
          );

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            setUser(profileData);
            console.log("Perfil cargado:", profileData);
          } else {
            // Si falla, usar la info básica del login
            setUser(data.user || data);
            console.warn(
              "No se pudo cargar el perfil completo, usando info básica"
            );
          }
        } catch (error) {
          console.error("Error cargando perfil:", error);
          // Si falla, usar la info básica del login
          setUser(data.user || data);
        }
      } else {
        console.error("Formato de respuesta inesperado:", data);
        throw new Error("Formato de respuesta inesperado del servidor");
      }
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al registrar usuario");
      }

      const responseData = await response.json();

      // Después del registro exitoso, hacer login automático
      await login({
        username: data.correo,
        password: data.contrasena,
      });
    } catch (error) {
      console.error("Error en registro:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setUser(null);
    setToken(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const getProfile = async (): Promise<User> => {
    if (!token) {
      throw new Error("No hay token de autenticación");
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al obtener el perfil");
      }

      const profileData = await response.json();
      setUser(profileData);
      return profileData;
    } catch (error) {
      console.error("Error obteniendo perfil:", error);
      throw error;
    }
  };

  const updateProfile = async (data: UpdateProfileData): Promise<void> => {
    if (!token) {
      throw new Error("No hay token de autenticación");
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al actualizar el perfil");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (data: ChangePasswordData): Promise<void> => {
    if (!token) {
      throw new Error("No hay token de autenticación");
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al cambiar la contraseña");
      }

      // La contraseña se cambió exitosamente
    } catch (error) {
      console.error("Error cambiando contraseña:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async (): Promise<void> => {
    if (!token) {
      throw new Error("No hay token de autenticación");
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al eliminar la cuenta");
      }

      // La cuenta se eliminó exitosamente, hacer logout
      logout();
    } catch (error) {
      console.error("Error eliminando cuenta:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    getProfile,
    updateProfile,
    changePassword,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
