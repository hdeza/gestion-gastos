"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  LoginCredentials,
  RegisterData,
  AuthContextType,
  AuthResponse,
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
            const userData = await response.json();
            setUser(userData);
            setToken(storedToken);
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
        setUser(data.user || data);
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

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
