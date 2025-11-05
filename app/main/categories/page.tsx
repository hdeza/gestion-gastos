"use client";

import React from "react";
import { ArrowLeft, Plus, Edit, Trash2, Tag, Loader2, Palette, Type } from "lucide-react";
import Link from "next/link";
import { categoryService } from "../../services/categoryService";
import { Category, CreateCategoryData, UpdateCategoryData } from "../../types/category";
import { useAuth } from "../../contexts/AuthContext";
import Swal from "sweetalert2";

export default function CategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);

  // Form states
  const [formData, setFormData] = React.useState<CreateCategoryData>({
    nombre: '',
    tipo: 'ingreso',
    color: '#10b981',
    icono: '💰',
    es_global: false,
  });

  React.useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error cargando categorías:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar las categorías',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      tipo: 'ingreso',
      color: '#10b981',
      icono: '💰',
      es_global: false,
    });
    setEditingCategory(null);
    setShowCreateForm(false);
  };

  const handleCreateCategory = async () => {
    if (!formData.nombre.trim()) {
      Swal.fire({
        title: 'Error',
        text: 'El nombre de la categoría es obligatorio',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const categoryData = { ...formData, es_global: false };
      const newCategory = await categoryService.createCategory(categoryData);
      setCategories(prev => [...prev, newCategory]);
      resetForm();
      Swal.fire({
        title: '¡Éxito!',
        text: 'Categoría creada correctamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error creando categoría:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo crear la categoría',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !formData.nombre.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const updateData: UpdateCategoryData = {
        nombre: formData.nombre,
        tipo: formData.tipo,
        color: formData.color,
        icono: formData.icono,
        es_global: false,
      };

      const updatedCategory = await categoryService.updateCategory(editingCategory.id_categoria, updateData);
      setCategories(prev => prev.map(cat => cat.id_categoria === editingCategory.id_categoria ? updatedCategory : cat).filter(cat => cat.id_categoria !== undefined));
      resetForm();
      Swal.fire({
        title: '¡Éxito!',
        text: 'Categoría actualizada correctamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error actualizando categoría:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar la categoría',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (category.es_global) {
      Swal.fire({
        title: 'No permitido',
        text: 'Las categorías globales no pueden ser eliminadas',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la categoría "${category.nombre}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      await categoryService.deleteCategory(category.id_categoria);
      setCategories(prev => prev.filter(cat => cat.id_categoria !== category.id_categoria && cat.id_categoria !== undefined));
      Swal.fire({
        title: '¡Eliminada!',
        text: 'La categoría ha sido eliminada correctamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error eliminando categoría:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar la categoría. Puede que esté siendo usada.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const startEditing = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      nombre: category.nombre,
      tipo: category.tipo,
      color: category.color,
      icono: category.icono,
      es_global: category.es_global,
    });
    setShowCreateForm(true);
  };

  const predefinedColors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#06b6d4', '#3b82f6', '#6366f1',
    '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e'
  ];

  const predefinedIcons = [
    '💰', '🏠', '🍽️', '🚗', '📱', '💡', '🎮', '🎯', '📊', '💼',
    '🎓', '🏥', '🛒', '✈️', '🎵', '🎬', '📚', '🏃', '🚴', '🏊'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8 bg-neutral-50/90 backdrop-blur border-b border-neutral-200 px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-3">
          <Link href="/main/dashboard" className="rounded-full p-2 hover:bg-neutral-100">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="font-medium">Gestión de Categorías</div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Botón crear */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Categorías</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            <Plus className="h-4 w-4" />
            {showCreateForm ? 'Cancelar' : 'Nueva Categoría'}
          </button>
        </div>

        {/* Formulario */}
        {showCreateForm && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-4">
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </h2>

            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Nombre *
                </label>
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Ej. Salario, Freelance, etc."
                    className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 focus:border-blue-400 focus:outline-none"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Tipo
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as 'ingreso' | 'gasto' }))}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 focus:border-blue-400 focus:outline-none"
                  disabled={isSubmitting}
                >
                  <option value="ingreso">Ingreso</option>
                  <option value="gasto">Gasto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Color
                </label>
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-neutral-400" />
                  <div className="flex flex-wrap gap-2">
                    {predefinedColors.map(color => (
                      <button
                        key={color}
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded-full border-2 ${formData.color === color ? 'border-neutral-800' : 'border-neutral-300'}`}
                        style={{ backgroundColor: color }}
                        disabled={isSubmitting}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Icono
                </label>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-neutral-400" />
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {predefinedIcons.map(icon => (
                      <button
                        key={icon}
                        onClick={() => setFormData(prev => ({ ...prev, icono: icon }))}
                        className={`w-8 h-8 rounded-lg border flex items-center justify-center text-lg ${formData.icono === icon ? 'border-blue-400 bg-blue-50' : 'border-neutral-200 hover:border-neutral-300'}`}
                        disabled={isSubmitting}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>


              <div className="flex gap-3 pt-4">
                <button
                  onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
                  disabled={isSubmitting || !formData.nombre.trim()}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-400 text-white px-6 py-2 rounded-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {editingCategory ? 'Actualizando...' : 'Creando...'}
                    </>
                  ) : (
                    editingCategory ? 'Actualizar' : 'Crear'
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
          </div>
        )}

        {/* Lista de categorías */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
              <span className="ml-2 text-neutral-500">Cargando categorías...</span>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <Tag className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
              <div className="text-lg font-medium">No hay categorías</div>
              <div className="text-sm">Crea tu primera categoría para organizar tus finanzas</div>
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category.id_categoria}
                className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      {category.icono}
                    </div>
                    <div>
                      <div className="font-medium text-neutral-900">{category.nombre}</div>
                      <div className="text-sm text-neutral-500">
                        {category.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEditing(category)}
                      className="p-2 text-neutral-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category)}
                      className={`p-2 rounded-lg ${
                        category.es_global
                          ? 'text-neutral-300 cursor-not-allowed'
                          : 'text-neutral-400 hover:text-red-600 hover:bg-red-50'
                      }`}
                      title={category.es_global ? 'No se puede eliminar una categoría global' : 'Eliminar'}
                      disabled={category.es_global}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
