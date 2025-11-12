"use client";

import React from "react";
import { ArrowLeft, Edit, Trash2, Plus, Loader2, Calendar, CreditCard, Tag, Search } from "lucide-react";
import Link from "next/link";
import { expenseService } from "../../services/expenseService";
import { categoryService } from "../../services/categoryService";
import { Expense, CreateExpenseData, UpdateExpenseData } from "../../types/expense";
import { Category } from "../../types/category";
import { useAuth } from "../../contexts/AuthContext";
import { formatCurrency } from "../../utils/currency";
import Swal from "sweetalert2";

export default function ExpensesPage() {
  const { user } = useAuth();
  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [editingExpense, setEditingExpense] = React.useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<number | null>(null);

  // Form states
  const [formData, setFormData] = React.useState<CreateExpenseData>({
    descripcion: '',
    monto: 0,
    fecha: new Date().toISOString().split('T')[0],
    metodo_pago: 'efectivo',
    nota: '',
    recurrente: false,
    id_categoria: 0,
    id_grupo: null,
  });

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [expensesData, categoriesData] = await Promise.all([
        expenseService.getPersonalExpenses({ limit: 100 }),
        categoryService.getCategories({ tipo: 'gasto' })
      ]);

      setExpenses(expensesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar los gastos',
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
      metodo_pago: 'efectivo',
      nota: '',
      recurrente: false,
      id_categoria: categories.length > 0 ? categories[0].id_categoria : 0,
      id_grupo: null,
    });
    setEditingExpense(null);
    setShowCreateForm(false);
  };

  const handleCreateExpense = async () => {
    if (!formData.descripcion.trim() || formData.monto <= 0 || !formData.id_categoria) {
      Swal.fire({
        title: 'Error',
        text: 'Todos los campos obligatorios deben estar completos',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = { ...formData, id_grupo: formData.id_grupo ?? null };
      const newExpense = await expenseService.createExpense(payload);
      setExpenses(prev => [newExpense, ...prev]);
      resetForm();
      Swal.fire({
        title: '¡Éxito!',
        text: 'Gasto creado correctamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error creando gasto:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo crear el gasto',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateExpense = async () => {
    if (!editingExpense) return;

    if (!formData.descripcion.trim() || formData.monto <= 0 || !formData.id_categoria) {
      Swal.fire({
        title: 'Error',
        text: 'Todos los campos obligatorios deben estar completos',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const updateData: UpdateExpenseData = {
        descripcion: formData.descripcion,
        monto: formData.monto,
        fecha: formData.fecha,
        metodo_pago: formData.metodo_pago,
        nota: formData.nota,
        recurrente: formData.recurrente,
        id_categoria: formData.id_categoria,
      };

      const updatedExpense = await expenseService.updateExpense(editingExpense.id_gasto, updateData);
      setExpenses(prev => prev.map(exp => exp.id_gasto === editingExpense.id_gasto ? updatedExpense : exp));
      resetForm();
      Swal.fire({
        title: '¡Éxito!',
        text: 'Gasto actualizado correctamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error actualizando gasto:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar el gasto',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async (expense: Expense) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar este gasto de ${formatCurrency(Number(expense.monto), user)}? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      await expenseService.deleteExpense(expense.id_gasto);
      setExpenses(prev => prev.filter(exp => exp.id_gasto !== expense.id_gasto));
      Swal.fire({
        title: '¡Eliminado!',
        text: 'El gasto ha sido eliminado correctamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error eliminando gasto:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar el gasto',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const startEditing = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      descripcion: expense.descripcion,
      monto: typeof expense.monto === 'string' ? parseFloat(expense.monto) : expense.monto,
      fecha: expense.fecha,
      metodo_pago: expense.metodo_pago,
      nota: expense.nota || '',
      recurrente: expense.recurrente,
      id_categoria: expense.id_categoria,
      id_grupo: expense.id_grupo ?? null,
    });
    setShowCreateForm(true);
  };

  // Filtrar gastos
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.nota?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || expense.id_categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + Number(expense.monto), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8 bg-neutral-50/90 backdrop-blur border-b border-neutral-200 px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-3">
          <Link href="/main/dashboard" className="rounded-full p-2 hover:bg-neutral-100">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="font-medium">Gestión de Gastos</div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
            <div className="text-sm text-red-600">Total Gastos</div>
            <div className="text-2xl font-semibold text-red-900">
              {formatCurrency(totalExpenses, user)}
            </div>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <div className="text-sm text-blue-600">Número de Gastos</div>
            <div className="text-2xl font-semibold text-blue-900">
              {filteredExpenses.length}
            </div>
          </div>
          <div className="rounded-2xl border border-purple-100 bg-purple-50 p-4">
            <div className="text-sm text-purple-600">Promedio</div>
            <div className="text-2xl font-semibold text-purple-900">
              {filteredExpenses.length > 0 ? formatCurrency(totalExpenses / filteredExpenses.length, user) : formatCurrency(0, user)}
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
                placeholder="Buscar gastos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:border-red-400 focus:outline-none"
              />
            </div>

            {/* Filtro por categoría */}
            <select
              value={selectedCategory || ""}
              onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
              className="px-3 py-2 border border-neutral-200 rounded-lg focus:border-red-400 focus:outline-none"
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
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            <Plus className="h-4 w-4" />
            {showCreateForm ? 'Cancelar' : 'Nuevo Gasto'}
          </button>
        </div>

        {/* Formulario */}
        {showCreateForm && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-4">
              {editingExpense ? 'Editar Gasto' : 'Nuevo Gasto'}
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
                  placeholder="Ej. Almuerzo en restaurante"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 focus:border-red-400 focus:outline-none"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Monto *
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="number"
                    value={formData.monto || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, monto: Number(e.target.value) }))}
                    placeholder="0"
                    className="w-full pl-10 pr-3 py-2 border border-neutral-200 rounded-lg focus:border-red-400 focus:outline-none"
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
                    className="w-full pl-10 pr-3 py-2 border border-neutral-200 rounded-lg focus:border-red-400 focus:outline-none"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Método de Pago *
                </label>
                <select
                  value={formData.metodo_pago}
                  onChange={(e) => setFormData(prev => ({ ...prev, metodo_pago: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:border-red-400 focus:outline-none"
                  disabled={isSubmitting}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="otro">Otro</option>
                </select>
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
                    className="w-full pl-10 pr-3 py-2 border border-neutral-200 rounded-lg focus:border-red-400 focus:outline-none"
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

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Nota (opcional)
                </label>
                <textarea
                  value={formData.nota}
                  onChange={(e) => setFormData(prev => ({ ...prev, nota: e.target.value }))}
                  placeholder="Notas adicionales..."
                  rows={3}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 focus:border-red-400 focus:outline-none resize-none"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.recurrente}
                    onChange={(e) => setFormData(prev => ({ ...prev, recurrente: e.target.checked }))}
                    className="rounded border-neutral-300"
                    disabled={isSubmitting}
                  />
                  <span className="text-sm text-neutral-700">Gasto recurrente</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={editingExpense ? handleUpdateExpense : handleCreateExpense}
                disabled={isSubmitting || !formData.descripcion.trim() || formData.monto <= 0 || !formData.id_categoria}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-neutral-400 text-white px-6 py-2 rounded-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {editingExpense ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : (
                  editingExpense ? 'Actualizar' : 'Crear'
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

        {/* Lista de gastos */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
              <span className="ml-2 text-neutral-500">Cargando gastos...</span>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
              <div className="text-lg font-medium">
                {expenses.length === 0 ? 'No hay gastos registrados' : 'No se encontraron gastos'}
              </div>
              <div className="text-sm">
                {expenses.length === 0 ? 'Registra tu primer gasto' : 'Intenta cambiar los filtros de búsqueda'}
              </div>
            </div>
          ) : (
            filteredExpenses.map((expense) => {
              const category = categories.find(cat => cat.id_categoria === expense.id_categoria);
              return (
                <div
                  key={expense.id_gasto}
                  className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-lg"
                        style={{ backgroundColor: `${category?.color || '#ef4444'}20` }}
                      >
                        {category?.icono || '💸'}
                      </div>
                      <div>
                        <div className="font-medium text-neutral-900">{expense.descripcion}</div>
                        <div className="text-sm text-neutral-500">
                          {category?.nombre || 'Sin categoría'} • {expense.metodo_pago} • {new Date(expense.fecha).toLocaleDateString('es-ES')}
                          {expense.recurrente && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Recurrente</span>}
                        </div>
                        {expense.nota && (
                          <div className="text-xs text-neutral-400 mt-1">{expense.nota}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-semibold text-red-700">
                          -{formatCurrency(Number(expense.monto), user)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditing(expense)}
                          className="p-2 text-neutral-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense)}
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

