"use client";

import React from "react";
import { ArrowLeft, Edit, Trash2, Plus, Loader2, Calendar, DollarSign, Tag, Search } from "lucide-react";
import Link from "next/link";
import { incomeService } from "../../services/incomeService";
import { categoryService } from "../../services/categoryService";
import { Income, CreateIncomeData, UpdateIncomeData } from "../../types/income";
import { Category } from "../../types/category";
import { useAuth } from "../../contexts/AuthContext";
import { formatCurrency } from "../../utils/currency";
import Swal from "sweetalert2";

export default function IncomesPage() {
  const { user } = useAuth();
  const [incomes, setIncomes] = React.useState<Income[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [editingIncome, setEditingIncome] = React.useState<Income | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<number | null>(null);

  // Form states
  const [formData, setFormData] = React.useState<CreateIncomeData>({
    descripcion: '',
    monto: 0,
    fecha: new Date().toISOString().split('T')[0],
    fuente: '',
    id_categoria: 0,
    id_grupo: null,
  });

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [incomesData, categoriesData] = await Promise.all([
        incomeService.getPersonalIncomes({ limit: 100 }),
        categoryService.getCategories({ tipo: 'ingreso' })
      ]);

      setIncomes(incomesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar los ingresos',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      descripcion: '',
      monto: 0,
      fecha: new Date().toISOString().split('T')[0],
      fuente: '',
      id_categoria: categories.length > 0 ? categories[0].id : 0,
      id_grupo: null,
    });
    setEditingIncome(null);
    setShowCreateForm(false);
  };

  const handleCreateIncome = async () => {
    if (!formData.descripcion.trim() || !formData.fuente.trim() || formData.monto <= 0 || !formData.id_categoria) {
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
      const payload = { ...formData, id_grupo: formData.id_grupo ?? null };
      const newIncome = await incomeService.createIncome(payload);
      setIncomes(prev => [newIncome, ...prev]);
      resetForm();
      Swal.fire({
        title: '¡Éxito!',
        text: 'Ingreso creado correctamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error creando ingreso:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo crear el ingreso',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateIncome = async () => {
    if (!editingIncome) return;

    if (!formData.descripcion.trim() || !formData.fuente.trim() || formData.monto <= 0 || !formData.id_categoria) {
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
      const updateData: UpdateIncomeData = {
        descripcion: formData.descripcion,
        monto: formData.monto,
        fecha: formData.fecha,
        fuente: formData.fuente,
        id_categoria: formData.id_categoria,
      };

      const updatedIncome = await incomeService.updateIncome(editingIncome.id_ingreso, updateData);
      setIncomes(prev => prev.map(inc => inc.id_ingreso === editingIncome.id_ingreso ? updatedIncome : inc));
      resetForm();
      Swal.fire({
        title: '¡Éxito!',
        text: 'Ingreso actualizado correctamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error actualizando ingreso:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar el ingreso',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteIncome = async (income: Income) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar este ingreso de ${formatCurrency(Number(income.monto), user)}? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      await incomeService.deleteIncome(income.id_ingreso);
      setIncomes(prev => prev.filter(inc => inc.id_ingreso !== income.id_ingreso));
      Swal.fire({
        title: '¡Eliminado!',
        text: 'El ingreso ha sido eliminado correctamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error eliminando ingreso:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar el ingreso',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const startEditing = (income: Income) => {
    setEditingIncome(income);
    setFormData({
      descripcion: income.descripcion,
      monto: income.monto,
      fecha: income.fecha,
      fuente: income.fuente,
      id_categoria: income.id_categoria,
      id_grupo: income.id_grupo ?? null,
    });
    setShowCreateForm(true);
  };

  // Filtrar ingresos
  const filteredIncomes = incomes.filter(income => {
    const matchesSearch = income.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         income.fuente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || income.id_categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalIncomes = filteredIncomes.reduce((sum, income) => sum + Number(income.monto), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8 bg-neutral-50/90 backdrop-blur border-b border-neutral-200 px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-3">
          <Link href="/main/dashboard" className="rounded-full p-2 hover:bg-neutral-100">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="font-medium">Gestión de Ingresos</div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <div className="text-sm text-emerald-600">Total Ingresos</div>
            <div className="text-2xl font-semibold text-emerald-900">
              {formatCurrency(totalIncomes, user)}
            </div>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <div className="text-sm text-blue-600">Número de Ingresos</div>
            <div className="text-2xl font-semibold text-blue-900">
              {filteredIncomes.length}
            </div>
          </div>
          <div className="rounded-2xl border border-purple-100 bg-purple-50 p-4">
            <div className="text-sm text-purple-600">Promedio</div>
            <div className="text-2xl font-semibold text-purple-900">
              {filteredIncomes.length > 0 ? formatCurrency(totalIncomes / filteredIncomes.length, user) : formatCurrency(0, user)}
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Buscador */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar ingresos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:border-blue-400 focus:outline-none"
              />
            </div>

            {/* Filtro por categoría */}
            <select
              value={selectedCategory || ""}
              onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
              className="px-3 py-2 border border-neutral-200 rounded-lg focus:border-blue-400 focus:outline-none"
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category.id_categoria} value={category.id_categoria}>
                  {category.nombre}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg"
          >
            <Plus className="h-4 w-4" />
            {showCreateForm ? 'Cancelar' : 'Nuevo Ingreso'}
          </button>
        </div>

        {/* Formulario */}
        {showCreateForm && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-4">
              {editingIncome ? 'Editar Ingreso' : 'Nuevo Ingreso'}
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Descripción *
                </label>
                <input
                  type="text"
                  value={formData.descripcion}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Ej. Salario mensual"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 focus:border-emerald-400 focus:outline-none"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Fuente *
                </label>
                <input
                  type="text"
                  value={formData.fuente}
                  onChange={(e) => setFormData(prev => ({ ...prev, fuente: e.target.value }))}
                  placeholder="Ej. Empresa XYZ"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 focus:border-emerald-400 focus:outline-none"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Monto *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="number"
                    value={formData.monto || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, monto: Number(e.target.value) }))}
                    placeholder="0"
                    className="w-full pl-10 pr-3 py-2 border border-neutral-200 rounded-lg focus:border-emerald-400 focus:outline-none"
                    disabled={isSubmitting}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Fecha *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-neutral-200 rounded-lg focus:border-emerald-400 focus:outline-none"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Categoría *
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <select
                    value={formData.id_categoria}
                    onChange={(e) => setFormData(prev => ({ ...prev, id_categoria: Number(e.target.value) }))}
                    className="w-full pl-10 pr-3 py-2 border border-neutral-200 rounded-lg focus:border-emerald-400 focus:outline-none"
                    disabled={isSubmitting}
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map(category => (
                      <option key={category.id_categoria} value={category.id_categoria}>
                        {category.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={editingIncome ? handleUpdateIncome : handleCreateIncome}
                disabled={isSubmitting || !formData.descripcion.trim() || !formData.fuente.trim() || formData.monto <= 0 || !formData.id_categoria}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-400 text-white px-6 py-2 rounded-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {editingIncome ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : (
                  editingIncome ? 'Actualizar' : 'Crear'
                )}
              </button>
              <button
                onClick={resetForm}
                disabled={isSubmitting}
                className="px-6 py-2 text-neutral-600 hover:text-neutral-800"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lista de ingresos */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
              <span className="ml-2 text-neutral-500">Cargando ingresos...</span>
            </div>
          ) : filteredIncomes.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
              <div className="text-lg font-medium">
                {incomes.length === 0 ? 'No hay ingresos registrados' : 'No se encontraron ingresos'}
              </div>
              <div className="text-sm">
                {incomes.length === 0 ? 'Registra tu primer ingreso' : 'Intenta cambiar los filtros de búsqueda'}
              </div>
            </div>
          ) : (
            filteredIncomes.map((income) => {
              const category = categories.find(cat => cat.id_categoria !== undefined && cat.id_categoria === income.id_categoria);
              return (
                <div
                  key={income.id_ingreso}
                  className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-lg"
                        style={{ backgroundColor: `${category?.color || '#10b981'}20` }}
                      >
                        {category?.icono || '💰'}
                      </div>
                      <div>
                        <div className="font-medium text-neutral-900">{income.descripcion}</div>
                        <div className="text-sm text-neutral-500">
                          {income.fuente} • {category?.nombre || 'Sin categoría'} • {new Date(income.fecha).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-semibold text-emerald-700">
                          +{formatCurrency(Number(income.monto), user)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditing(income)}
                          className="p-2 text-neutral-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteIncome(income)}
                          className="p-2 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
