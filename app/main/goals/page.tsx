"use client";

import React from "react";
import { ArrowLeft, Edit, Trash2, Plus, Loader2, Calendar, Target, TrendingUp, CheckCircle, X, Search, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { goalService } from "../../services/goalService";
import { goalContributionService } from "../../services/goalContributionService";
import { Goal, CreateGoalData, UpdateGoalData } from "../../types/goal";
import { GoalContribution, CreateGoalContributionData } from "../../types/goalContribution";
import { useAuth } from "../../contexts/AuthContext";
import { formatCurrency } from "../../utils/currency";
import Swal from "sweetalert2";

export default function GoalsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [goals, setGoals] = React.useState<Goal[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [editingGoal, setEditingGoal] = React.useState<Goal | null>(null);
  const [selectedGoal, setSelectedGoal] = React.useState<Goal | null>(null);
  const [contributions, setContributions] = React.useState<GoalContribution[]>([]);
  const [showContributions, setShowContributions] = React.useState(false);
  const [showContributionForm, setShowContributionForm] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'activa' | 'completada' | 'cancelada'>('all');

  // Form states
  const [formData, setFormData] = React.useState<CreateGoalData>({
    nombre: '',
    monto_objetivo: 0,
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 días por defecto
    estado: 'activa',
    id_grupo: null,
  });

  const [contributionFormData, setContributionFormData] = React.useState<CreateGoalContributionData>({
    id_meta: 0,
    monto: 0,
    fecha: new Date().toISOString().split('T')[0],
  });

  React.useEffect(() => {
    loadGoals();
  }, [statusFilter]);

  const loadGoals = async () => {
    try {
      setIsLoading(true);
      let goalsData: Goal[] = [];
      
      if (statusFilter === 'all') {
        goalsData = await goalService.getGoals({ personal_only: true, limit: 100 });
      } else {
        goalsData = await goalService.getGoalsByStatus(statusFilter, true);
      }

      // Los datos ya vienen con monto_acumulado y porcentaje_completado del API
      // Si no viene porcentaje_completado, lo calculamos manualmente
      const goalsWithProgress = goalsData.map(goal => {
        if (goal.porcentaje_completado === undefined || goal.porcentaje_completado === null) {
          const montoObjetivo = Number(goal.monto_objetivo);
          const montoAcumulado = Number(goal.monto_acumulado || 0);
          const porcentaje = montoObjetivo > 0 ? (montoAcumulado / montoObjetivo) * 100 : 0;
          return {
            ...goal,
            porcentaje_completado: porcentaje,
          };
        }
        return goal;
      });
      
      console.log('Metas cargadas:', goalsWithProgress);
      setGoals(goalsWithProgress);
    } catch (error: any) {
      console.error('Error cargando metas:', error);
      Swal.fire({
        title: 'Error',
        text: error.message || 'No se pudieron cargar las metas',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadContributions = async (goalId: number) => {
    try {
      const contributionsData = await goalContributionService.getContributionsByGoal(goalId, { limit: 100 });
      setContributions(contributionsData);
    } catch (error: any) {
      console.error('Error cargando aportes:', error);
      Swal.fire({
        title: 'Error',
        text: error.message || 'No se pudieron cargar los aportes',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      monto_objetivo: 0,
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estado: 'activa',
      id_grupo: null,
    });
    setEditingGoal(null);
    setShowCreateForm(false);
  };

  const handleCreateGoal = async () => {
    if (!formData.nombre.trim() || formData.monto_objetivo <= 0 || !formData.fecha_inicio || !formData.fecha_fin) {
      Swal.fire({
        title: 'Error',
        text: 'Todos los campos son obligatorios',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (new Date(formData.fecha_fin) < new Date(formData.fecha_inicio)) {
      Swal.fire({
        title: 'Error',
        text: 'La fecha de fin debe ser posterior a la fecha de inicio',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const newGoal = await goalService.createGoal(formData);
      await loadGoals();
      resetForm();
      Swal.fire({
        title: '¡Éxito!',
        text: 'Meta creada correctamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error: any) {
      console.error('Error creando meta:', error);
      Swal.fire({
        title: 'Error',
        text: error.message || 'Error al crear la meta',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateGoal = async () => {
    if (!editingGoal) return;

    if (!formData.nombre.trim() || formData.monto_objetivo <= 0 || !formData.fecha_inicio || !formData.fecha_fin) {
      Swal.fire({
        title: 'Error',
        text: 'Todos los campos son obligatorios',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await goalService.updateGoal(editingGoal.id_meta, formData);
      await loadGoals();
      resetForm();
      Swal.fire({
        title: '¡Éxito!',
        text: 'Meta actualizada correctamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error: any) {
      console.error('Error actualizando meta:', error);
      Swal.fire({
        title: 'Error',
        text: error.message || 'Error al actualizar la meta',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGoal = async (goal: Goal) => {
    const result = await Swal.fire({
      title: '¿Eliminar meta?',
      text: `¿Estás seguro de eliminar la meta "${goal.nombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await goalService.deleteGoal(goal.id_meta);
        await loadGoals();
        Swal.fire({
          title: '¡Éxito!',
          text: 'Meta eliminada correctamente',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error: any) {
        console.error('Error eliminando meta:', error);
        Swal.fire({
          title: 'Error',
          text: error.message || 'Error al eliminar la meta',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  const handleCreateContribution = async () => {
    if (!contributionFormData.id_meta || contributionFormData.monto <= 0) {
      Swal.fire({
        title: 'Error',
        text: 'El monto debe ser mayor a 0',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await goalContributionService.createContribution(contributionFormData);
      await loadContributions(contributionFormData.id_meta);
      await loadGoals();
      
      // Actualizar el progreso de la meta seleccionada si está abierta
      if (selectedGoal && selectedGoal.id_meta === contributionFormData.id_meta) {
        try {
          // Recargar la meta completa para obtener todos los datos actualizados
          const updatedGoal = await goalService.getGoalById(selectedGoal.id_meta);
          setSelectedGoal(updatedGoal);
        } catch (error) {
          console.error('Error actualizando progreso:', error);
        }
      }
      
      setContributionFormData({
        id_meta: contributionFormData.id_meta,
        monto: 0,
        fecha: new Date().toISOString().split('T')[0],
      });
      setShowContributionForm(false);
      Swal.fire({
        title: '¡Éxito!',
        text: 'Aporte creado correctamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error: any) {
      console.error('Error creando aporte:', error);
      Swal.fire({
        title: 'Error',
        text: error.message || 'Error al crear el aporte',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteContribution = async (contributionId: number, goalId: number) => {
    const result = await Swal.fire({
      title: '¿Eliminar aporte?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await goalContributionService.deleteContribution(contributionId);
        await loadContributions(goalId);
        await loadGoals();
        
        // Actualizar el progreso de la meta seleccionada si está abierta
        if (selectedGoal && selectedGoal.id_meta === goalId) {
          try {
            // Recargar la meta completa para obtener todos los datos actualizados
            const updatedGoal = await goalService.getGoalById(selectedGoal.id_meta);
            setSelectedGoal(updatedGoal);
          } catch (error) {
            console.error('Error actualizando progreso:', error);
          }
        }
        
        Swal.fire({
          title: '¡Éxito!',
          text: 'Aporte eliminado correctamente',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error: any) {
        console.error('Error eliminando aporte:', error);
        Swal.fire({
          title: 'Error',
          text: error.message || 'Error al eliminar el aporte',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  const openGoalDetails = async (goal: Goal) => {
    // Recargar la meta para obtener los datos más actualizados con progreso
    try {
      const updatedGoal = await goalService.getGoalById(goal.id_meta);
      setSelectedGoal(updatedGoal);
    } catch (error) {
      // Si falla, usar la meta que ya tenemos
      setSelectedGoal(goal);
    }
    setShowContributions(true);
    await loadContributions(goal.id_meta);
  };

  const openContributionForm = (goal: Goal) => {
    if (goal.estado !== 'activa') {
      Swal.fire({
        title: 'Error',
        text: 'Solo se pueden hacer aportes a metas activas',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }
    setContributionFormData({
      id_meta: goal.id_meta,
      monto: 0,
      fecha: new Date().toISOString().split('T')[0],
    });
    setShowContributionForm(true);
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'activa':
        return <Target className="h-5 w-5 text-blue-600" />;
      case 'completada':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'cancelada':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Target className="h-5 w-5 text-neutral-600" />;
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'activa':
        return 'bg-blue-100 text-blue-700';
      case 'completada':
        return 'bg-green-100 text-green-700';
      case 'cancelada':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-neutral-100 text-neutral-700';
    }
  };

  const filteredGoals = goals.filter(goal =>
    goal.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-neutral-600">Cargando metas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/main/profile")}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
            <Target className="h-8 w-8 text-blue-600" />
            Mis Metas
          </h1>
          <p className="text-neutral-600 mt-1">Gestiona tus metas de ahorro personales</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateForm(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Nueva Meta</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar metas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-neutral-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas</option>
              <option value="activa">Activas</option>
              <option value="completada">Completadas</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Goals List */}
      {filteredGoals.length === 0 ? (
        <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
          <Target className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">No hay metas</h3>
          <p className="text-neutral-600 mb-6">Crea tu primera meta para empezar a ahorrar</p>
          <button
            onClick={() => {
              resetForm();
              setShowCreateForm(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Crear Meta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGoals.map((goal) => {
            const montoAcumulado = Number(goal.monto_acumulado || 0);
            const montoObjetivo = Number(goal.monto_objetivo);
            // Usar porcentaje del API o calcularlo si no viene
            const porcentaje = goal.porcentaje_completado ?? (montoObjetivo > 0 ? (montoAcumulado / montoObjetivo) * 100 : 0);
            const montoFaltante = montoObjetivo - montoAcumulado;

            return (
              <div
                key={goal.id_meta}
                className="bg-white rounded-lg border border-neutral-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => openGoalDetails(goal)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(goal.estado)}
                      <h3 className="text-lg font-semibold text-neutral-900">{goal.nombre}</h3>
                    </div>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(goal.estado)}`}>
                      {goal.estado.charAt(0).toUpperCase() + goal.estado.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingGoal(goal);
                        setFormData({
                          nombre: goal.nombre,
                          monto_objetivo: Number(goal.monto_objetivo),
                          fecha_inicio: goal.fecha_inicio,
                          fecha_fin: goal.fecha_fin,
                          estado: goal.estado,
                          id_grupo: goal.id_grupo ?? null,
                        });
                        setShowCreateForm(true);
                      }}
                      className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                      title="Editar meta"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGoal(goal);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar meta"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-neutral-600 mb-2">
                    <span>{formatCurrency(montoAcumulado, user)} / {formatCurrency(montoObjetivo, user)}</span>
                    <span className="font-semibold">{porcentaje.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        porcentaje >= 100 ? 'bg-green-500' : porcentaje >= 75 ? 'bg-blue-500' : porcentaje >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(porcentaje, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="flex items-center gap-4 text-sm text-neutral-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Inicio: {formatDate(goal.fecha_inicio)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Fin: {formatDate(goal.fecha_fin)}</span>
                  </div>
                </div>

                {/* Faltante */}
                {montoFaltante > 0 && goal.estado === 'activa' && (
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <span className="text-sm text-neutral-600">Faltante:</span>
                    <span className="font-semibold text-neutral-900">{formatCurrency(montoFaltante, user)}</span>
                  </div>
                )}

                {/* Action Button */}
                {goal.estado === 'activa' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openContributionForm(goal);
                    }}
                    className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar Aporte
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Goal Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">
              {editingGoal ? 'Editar Meta' : 'Nueva Meta'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Ahorrar para viaje"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Monto Objetivo</label>
                <input
                  type="number"
                  value={formData.monto_objetivo || ''}
                  onChange={(e) => setFormData({ ...formData, monto_objetivo: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Fecha Inicio</label>
                  <input
                    type="date"
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Fecha Fin</label>
                  <input
                    type="date"
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Estado</label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="activa">Activa</option>
                  <option value="completada">Completada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={resetForm}
                className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                onClick={editingGoal ? handleUpdateGoal : handleCreateGoal}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {editingGoal ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : (
                  editingGoal ? 'Actualizar' : 'Crear'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goal Details Modal */}
      {showContributions && selectedGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full shadow-xl max-h-[90vh] flex flex-col">
            {/* Header fijo */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <h2 className="text-2xl font-bold text-neutral-900">{selectedGoal.nombre}</h2>
              <button
                onClick={() => {
                  setShowContributions(false);
                  setSelectedGoal(null);
                }}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Contenido con scroll */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Progress Summary */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-600">Progreso</span>
                  <span className="text-lg font-bold text-blue-900">
                    {selectedGoal.porcentaje_completado?.toFixed(1) ?? 0}%
                  </span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-4 overflow-hidden mb-2">
                  <div
                    className={`h-full transition-all ${
                      (selectedGoal.porcentaje_completado ?? 0) >= 100 ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(selectedGoal.porcentaje_completado ?? 0, 100)}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-neutral-600">Objetivo</div>
                    <div className="font-semibold">{formatCurrency(Number(selectedGoal.monto_objetivo), user)}</div>
                  </div>
                  <div>
                    <div className="text-neutral-600">Actual</div>
                    <div className="font-semibold">{formatCurrency(Number(selectedGoal.monto_acumulado || 0), user)}</div>
                  </div>
                  <div>
                    <div className="text-neutral-600">Faltante</div>
                    <div className="font-semibold">
                      {formatCurrency(Number(selectedGoal.monto_objetivo) - Number(selectedGoal.monto_acumulado || 0), user)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contributions List con scroll interno */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-neutral-900">Aportes</h3>
                  {selectedGoal.estado === 'activa' && (
                    <button
                      onClick={() => openContributionForm(selectedGoal)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Plus className="h-4 w-4" />
                      Nuevo Aporte
                    </button>
                  )}
                </div>
                {contributions.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500">
                    No hay aportes aún
                  </div>
                ) : (
                  <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                    {contributions.map((contribution) => (
                      <div
                        key={contribution.id_aporte}
                        className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-neutral-900">
                            {formatCurrency(Number(contribution.monto), user)}
                          </div>
                          <div className="text-sm text-neutral-500">
                            {formatDate(contribution.fecha)}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteContribution(contribution.id_aporte, selectedGoal.id_meta)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contribution Form Modal */}
      {showContributionForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Nuevo Aporte</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Monto</label>
                <input
                  type="number"
                  value={contributionFormData.monto || ''}
                  onChange={(e) => setContributionFormData({ ...contributionFormData, monto: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Fecha</label>
                <input
                  type="date"
                  value={contributionFormData.fecha}
                  onChange={(e) => setContributionFormData({ ...contributionFormData, fecha: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowContributionForm(false);
                  setContributionFormData({
                    id_meta: 0,
                    monto: 0,
                    fecha: new Date().toISOString().split('T')[0],
                  });
                }}
                className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateContribution}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Aporte'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

