"use client";

import { useState } from "react";
import { Eye, EyeOff, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { RegisterData } from "../types/auth";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<RegisterData>({
    nombre: "",
    correo: "",
    contrasena: "",
    moneda_preferida: "COP",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Validaciones
    if (formData.contrasena !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.contrasena.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      await register(formData);
      router.push("/main/dashboard");
    } catch (error: any) {
      setError(error.message || "Error al registrar usuario");
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ backgroundColor: "#3F3FF3" }}
      >
        <div className="relative z-10 flex flex-col justify-between w-full px-12 py-12">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
              <div
                className="w-4 h-4 rounded-sm"
                style={{ backgroundColor: "#3F3FF3" }}
              ></div>
            </div>
            <h1 className="text-xl font-semibold text-white">GastoGenius</h1>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-4xl text-white mb-6 leading-tight">
              Únete a la revolución financiera.
            </h2>
            <p className="text-white/90 text-lg leading-relaxed">
              Comienza tu viaje hacia la libertad financiera. Regístrate y
              descubre cómo la IA puede transformar tu forma de manejar el
              dinero.
            </p>
          </div>

          <div className="flex justify-between items-center text-white/70 text-sm">
            <span>Copyright © 2025 GastoGenius.</span>
            <span className="cursor-pointer hover:text-white/90">
              Política de Privacidad
            </span>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden text-center mb-8">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: "#3F3FF3" }}
            >
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <h1 className="text-xl font-semibold text-foreground">
              GastoGenius
            </h1>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <Link
              href="/login"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al login
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-3xl text-foreground">¡Crea tu cuenta!</h2>
              <p className="text-muted-foreground">
                Únete a GastoGenius y toma control de tus finanzas.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="nombre"
                  className="text-sm font-medium text-foreground"
                >
                  Nombre Completo
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  placeholder="Tu nombre completo"
                  className="h-12 border-gray-200 focus:ring-0 shadow-none rounded-lg bg-white focus:border-[#3F3FF3] w-full px-3"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="correo"
                  className="text-sm font-medium text-foreground"
                >
                  Correo Electrónico
                </label>
                <input
                  id="correo"
                  name="correo"
                  type="email"
                  placeholder="usuario@empresa.com"
                  className="h-12 border-gray-200 focus:ring-0 shadow-none rounded-lg bg-white focus:border-[#3F3FF3] w-full px-3"
                  value={formData.correo}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="moneda_preferida"
                  className="text-sm font-medium text-foreground"
                >
                  Moneda Preferida
                </label>
                <select
                  id="moneda_preferida"
                  name="moneda_preferida"
                  className="h-12 border-gray-200 focus:ring-0 shadow-none rounded-lg bg-white focus:border-[#3F3FF3] w-full px-3"
                  value={formData.moneda_preferida}
                  onChange={handleInputChange}
                  required
                >
                  <option value="COP">Peso Colombiano (COP)</option>
                  <option value="USD">Dólar Americano (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="MXN">Peso Mexicano (MXN)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="contrasena"
                  className="text-sm font-medium text-foreground"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="contrasena"
                    name="contrasena"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    className="h-12 pr-10 border-gray-200 focus:ring-0 shadow-none rounded-lg bg-white focus:border-[#3F3FF3] w-full px-3"
                    value={formData.contrasena}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer bg-transparent border-none"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-foreground"
                >
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repite tu contraseña"
                    className="h-12 pr-10 border-gray-200 focus:ring-0 shadow-none rounded-lg bg-white focus:border-[#3F3FF3] w-full px-3"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer bg-transparent border-none"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-sm font-medium text-white hover:opacity-90 rounded-lg shadow-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ backgroundColor: "#3F3FF3" }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                "Crear Cuenta"
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <Link
                  href="/login"
                  className="text-[#3F3FF3] hover:underline font-medium"
                >
                  Inicia sesión aquí
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
