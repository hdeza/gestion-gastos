"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Plus,
  Search,
  Loader2,
  Calendar,
  User,
  Settings,
  Trash2,
  Eye,
} from "lucide-react";
import { groupService } from "../../services/groupService";
import { Group } from "../../types/group";
import { useAuth } from "../../contexts/AuthContext";
import Swal from "sweetalert2";

export default function GroupsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setIsLoading(true);
      const data = await groupService.getGroups({ skip: 0, limit: 100 });
      setGroups(data);
    } catch (error: any) {
      console.error("Error cargando grupos:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Error al cargar los grupos",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Campo requerido",
        text: "El nombre del grupo es obligatorio",
      });
      return;
    }

    try {
      setIsCreating(true);
      const newGroup = await groupService.createGroup({
        nombre: newGroupName.trim(),
        descripcion: newGroupDescription.trim() || undefined,
      });

      Swal.fire({
        icon: "success",
        title: "¡Grupo creado!",
        text: `El grupo "${newGroup.nombre}" ha sido creado exitosamente`,
        timer: 2000,
        showConfirmButton: false,
      });

      setShowCreateModal(false);
      setNewGroupName("");
      setNewGroupDescription("");
      loadGroups();
    } catch (error: any) {
      console.error("Error creando grupo:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Error al crear el grupo",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteGroup = async (group: Group) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar grupo?",
      text: `¿Estás seguro de eliminar el grupo "${group.nombre}"? Esta acción no se puede deshacer.`,
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
    });

    if (result.isConfirmed) {
      try {
        await groupService.deleteGroup(group.id_grupo);
        Swal.fire({
          icon: "success",
          title: "Grupo eliminado",
          text: `El grupo "${group.nombre}" ha sido eliminado`,
          timer: 2000,
          showConfirmButton: false,
        });
        loadGroups();
      } catch (error: any) {
        console.error("Error eliminando grupo:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Error al eliminar el grupo",
        });
      }
    }
  };

  const filteredGroups = groups.filter((group) =>
    group.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-neutral-600">Cargando grupos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            Mis Grupos
          </h1>
          <p className="text-neutral-600 mt-1">
            Gestiona tus grupos y colabora con otros usuarios
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
        >
          <Plus className="h-5 w-5" />
          Crear Grupo
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
        <input
          type="text"
          placeholder="Buscar grupos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Groups List */}
      {filteredGroups.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-neutral-200">
          <Users className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-700 mb-2">
            {searchTerm ? "No se encontraron grupos" : "No tienes grupos aún"}
          </h3>
          <p className="text-neutral-500 mb-4">
            {searchTerm
              ? "Intenta con otro término de búsqueda"
              : "Crea tu primer grupo para empezar a colaborar"}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Crear Grupo
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGroups.map((group) => {
            // Solo el creador puede eliminar el grupo
            const canDelete = group.id_creador === user?.id_usuario;
            
            return (
              <div
                key={group.id_grupo}
                className="bg-white rounded-lg border border-neutral-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/main/groups/${group.id_grupo}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                      {group.nombre}
                    </h3>
                    {group.descripcion && (
                      <p className="text-sm text-neutral-600 line-clamp-2">
                        {group.descripcion}
                      </p>
                    )}
                  </div>
                  {canDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGroup(group);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar grupo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              <div className="flex items-center gap-4 text-xs text-neutral-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(group.fecha_creacion)}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/main/groups/${group.id_grupo}`);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  Ver detalles
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">
              Crear Nuevo Grupo
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Nombre del Grupo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Ej: Viaje a la playa"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Descripción (opcional)
                </label>
                <textarea
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder="Describe el propósito del grupo..."
                  rows={3}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewGroupName("");
                  setNewGroupDescription("");
                }}
                className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                disabled={isCreating}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={isCreating || !newGroupName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear Grupo"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

