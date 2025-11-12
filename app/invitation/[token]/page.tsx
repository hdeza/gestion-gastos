"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Users,
  Loader2,
  Check,
  X,
  Calendar,
  User,
  Crown,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { invitationService } from "../../services/invitationService";
import { InvitationDetail } from "../../types/invitation";
import { useAuth } from "../../contexts/AuthContext";
import Swal from "sweetalert2";
import Link from "next/link";

export default function InvitationPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuth();
  const token = params.token as string;

  const [invitation, setInvitation] = useState<InvitationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadInvitation();
    }
  }, [token]);

  const loadInvitation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await invitationService.getInvitationByToken(token);
      
      console.log("Datos de invitación recibidos:", data);
      
      // Verificar que los datos necesarios estén presentes (estructura plana del API)
      if (!data.grupo_nombre && !data.grupo?.nombre) {
        console.error("Datos incompletos:", data);
        setError("La invitación no contiene información completa. Por favor, contacta al administrador del grupo.");
        setInvitation(data); // Aún así establecer los datos para mostrar lo que hay
        return;
      }
      
      setInvitation(data);

      // Verificar si la invitación ya fue aceptada o rechazada
      if (data.estado !== "pendiente") {
        setError(
          data.estado === "aceptada"
            ? "Esta invitación ya fue aceptada"
            : data.estado === "rechazada"
            ? "Esta invitación fue rechazada"
            : data.estado === "expirada"
            ? "Esta invitación ha expirado"
            : "Esta invitación fue revocada"
        );
      }

      // Verificar si está expirada
      const expirationDate = new Date(data.fecha_expiracion);
      if (expirationDate < new Date() && data.estado === "pendiente") {
        setError("Esta invitación ha expirado");
      }
    } catch (error: any) {
      console.error("Error cargando invitación:", error);
      setError(error.message || "Error al cargar la invitación");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!isAuthenticated) {
      Swal.fire({
        icon: "info",
        title: "Inicia sesión",
        text: "Debes iniciar sesión para aceptar la invitación",
        confirmButtonText: "Ir a iniciar sesión",
      }).then(() => {
        router.push(`/login?redirect=/invitation/${token}`);
      });
      return;
    }

    const grupoNombre = invitation?.grupo_nombre || invitation?.grupo?.nombre || "el grupo";
    
    const result = await Swal.fire({
      icon: "question",
      title: "¿Aceptar invitación?",
      text: `¿Deseas unirte al grupo "${grupoNombre}"?`,
      showCancelButton: true,
      confirmButtonText: "Sí, aceptar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#2563eb",
    });

    if (result.isConfirmed) {
      try {
        setIsProcessing(true);
        await invitationService.acceptInvitation({ token });
        Swal.fire({
          icon: "success",
          title: "¡Invitación aceptada!",
          text: `Te has unido al grupo "${grupoNombre}"`,
          confirmButtonText: "Ver grupo",
        }).then(() => {
          if (invitation?.id_grupo) {
            router.push(`/main/groups/${invitation.id_grupo}`);
          } else {
            router.push("/main/groups");
          }
        });
      } catch (error: any) {
        console.error("Error aceptando invitación:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Error al aceptar la invitación",
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleReject = async () => {
    if (!isAuthenticated) {
      Swal.fire({
        icon: "info",
        title: "Inicia sesión",
        text: "Debes iniciar sesión para rechazar la invitación",
        confirmButtonText: "Ir a iniciar sesión",
      }).then(() => {
        router.push(`/login?redirect=/invitation/${token}`);
      });
      return;
    }

    const grupoNombre = invitation?.grupo_nombre || invitation?.grupo?.nombre || "el grupo";
    
    const result = await Swal.fire({
      icon: "warning",
      title: "¿Rechazar invitación?",
      text: `¿Estás seguro de rechazar la invitación al grupo "${grupoNombre}"?`,
      showCancelButton: true,
      confirmButtonText: "Sí, rechazar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
    });

    if (result.isConfirmed) {
      try {
        setIsProcessing(true);
        await invitationService.rejectInvitation({ token });
        Swal.fire({
          icon: "success",
          title: "Invitación rechazada",
          text: "Has rechazado la invitación",
          confirmButtonText: "Cerrar",
        }).then(() => {
          router.push("/main/groups");
        });
      } catch (error: any) {
        console.error("Error rechazando invitación:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Error al rechazar la invitación",
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-neutral-600">Cargando invitación...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg border border-neutral-200 p-6 shadow-lg text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            Invitación no disponible
          </h2>
          <p className="text-neutral-600 mb-6">{error || "La invitación no existe"}</p>
          <div className="flex gap-3">
            <Link
              href="/main/groups"
              className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Ver mis grupos
            </Link>
            {!isAuthenticated && (
              <Link
                href="/login"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  const isExpired = new Date(invitation.fecha_expiracion) < new Date();
  const canInteract = invitation.estado === "pendiente" && !isExpired;

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/main/groups"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a grupos
          </Link>
        </div>

        {/* Invitation Card */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-lg overflow-hidden">
          {/* Status Banner */}
          {!canInteract && (
            <div
              className={`px-6 py-3 ${
                invitation.estado === "aceptada"
                  ? "bg-green-50 text-green-800"
                  : invitation.estado === "rechazada"
                  ? "bg-red-50 text-red-800"
                  : "bg-yellow-50 text-yellow-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">
                  {invitation.estado === "aceptada"
                    ? "Invitación aceptada"
                    : invitation.estado === "rechazada"
                    ? "Invitación rechazada"
                    : isExpired
                    ? "Invitación expirada"
                    : "Invitación revocada"}
                </span>
              </div>
            </div>
          )}

          <div className="p-6">
            {/* Group Info */}
            {(invitation.grupo_nombre || invitation.grupo?.nombre) && (
              <div className="text-center mb-6">
                <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-10 w-10 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                  {invitation.grupo_nombre || invitation.grupo?.nombre || "Grupo sin nombre"}
                </h1>
                {(invitation.grupo_descripcion || invitation.grupo?.descripcion) && (
                  <p className="text-neutral-600">
                    {invitation.grupo_descripcion || invitation.grupo?.descripcion}
                  </p>
                )}
              </div>
            )}

            {/* Invitation Details */}
            <div className="space-y-4 mb-6">
              {(invitation.creador_nombre || invitation.creador?.nombre) && (
                <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                  <User className="h-5 w-5 text-neutral-500" />
                  <div>
                    <div className="text-sm text-neutral-500">Invitado por</div>
                    <div className="font-medium text-neutral-900">
                      {invitation.creador_nombre || invitation.creador?.nombre || "Usuario desconocido"}
                    </div>
                    {invitation.creador?.correo && (
                      <div className="text-sm text-neutral-500">
                        {invitation.creador.correo}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                <Calendar className="h-5 w-5 text-neutral-500" />
                <div>
                  <div className="text-sm text-neutral-500">Fecha de expiración</div>
                  <div className="font-medium text-neutral-900">
                    {formatDate(invitation.fecha_expiracion)}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            {canInteract ? (
              <div className="space-y-3">
                {!isAuthenticated && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                    <p className="text-sm text-blue-800 text-center">
                      Debes iniciar sesión para aceptar o rechazar esta invitación
                    </p>
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={handleReject}
                    disabled={isProcessing}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <X className="h-5 w-5" />
                        Rechazar
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleAccept}
                    disabled={isProcessing || !isAuthenticated}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-5 w-5" />
                        Aceptar Invitación
                      </>
                    )}
                  </button>
                </div>
                {!isAuthenticated && (
                  <Link
                    href={`/login?redirect=/invitation/${token}`}
                    className="block w-full text-center px-6 py-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Iniciar sesión para continuar
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-neutral-500 mb-4">
                  Esta invitación ya no está disponible para interactuar
                </p>
                <Link
                  href="/main/groups"
                  className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ver mis grupos
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

