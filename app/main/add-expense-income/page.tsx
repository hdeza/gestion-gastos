"use client";

import React from "react";
import { ArrowLeft, Plus, Tag, Wallet, PiggyBank, Loader2 } from "lucide-react";
import Link from "next/link";
import { categoryService } from "../../services/categoryService";
import { incomeService } from "../../services/incomeService";
import { Category } from "../../types/category";
import { Income, CreateIncomeData } from "../../types/income";
import { useAuth } from "../../contexts/AuthContext";
import { formatCurrency } from "../../utils/currency";
import Swal from "sweetalert2";

type MovementType = "income"; // Solo ingresos por ahora según la API

type Movement = {
  id: string;
  type: MovementType;
  amount: number;
  description?: string;
  category: string;
  categoryId: number;
  createdAt: number;
};

export default function AddExpenseIncome() {
  const { user } = useAuth();
  const [type] = React.useState<MovementType>("income"); // Solo ingresos
  const [amount, setAmount] = React.useState<string>("");
  const [description, setDescription] = React.useState<string>("");
  const [fuente, setFuente] = React.useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<number | null>(null);
  const [newCategoryName, setNewCategoryName] = React.useState<string>("");
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [items, setItems] = React.useState<Movement[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = React.useState(true);

  // Cargar categorías al montar el componente
  React.useEffect(() => {
    loadCategories();
  }, []);

  // Cargar ingresos después de que se carguen las categorías
  React.useEffect(() => {
    if (categories.length > 0) {
      loadExistingIncomes();
    }
  }, [categories]);

  const loadExistingIncomes = async () => {
    try {
      const incomes = await incomeService.getPersonalIncomes({ limit: 10 });
      const movements: Movement[] = incomes.map(income => ({
        id: income.id_ingreso.toString(),
        type: 'income',
        amount: typeof income.monto === 'string' ? parseFloat(income.monto) : income.monto,
        description: income.descripcion,
        category: categories.find(c => c.id_categoria === income.id_categoria)?.nombre || 'Sin categoría',
        categoryId: income.id_categoria,
        createdAt: income.fecha_creacion ? new Date(income.fecha_creacion).getTime() : Date.now(),
      }));
      setItems(movements);
    } catch (error) {
      console.error('Error cargando ingresos existentes:', error);
    }
  };

  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const allCategories = await categoryService.getCategories({ tipo: 'ingreso' });
      setCategories(allCategories);

      // Seleccionar la primera categoría por defecto
      if (allCategories.length > 0) {
        setSelectedCategoryId(allCategories[0].id);
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar las categorías',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const totals = React.useMemo(() => {
    const incomes = items.filter(i => i.type === "income").reduce((a, b) => a + b.amount, 0);
    return { incomes };
  }, [items]);

  const addCategory = async () => {
    if (!newCategoryName.trim() || !user) return;

    try {
      setIsLoading(true);
      const newCategory = await categoryService.createCategory({
        nombre: newCategoryName.trim(),
        tipo: 'ingreso',
        color: '#10b981', // Verde por defecto
        icono: '💰',
        es_global: false,
      });

      setCategories(prev => [...prev, newCategory]);
      setSelectedCategoryId(newCategory.id);
      setNewCategoryName("");

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
      setIsLoading(false);
    }
  };

  const onSave = async () => {
    const parsed = Number(amount.replace(/[^0-9.]/g, ""));
    if (!parsed || parsed <= 0 || !selectedCategoryId || !fuente.trim()) return;

    try {
      setIsLoading(true);

      const incomeData = {
        descripcion: description || 'Ingreso registrado',
        monto: parsed.toFixed(2), // Enviar como string decimal tal como en Postman
        fecha: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        fuente: fuente.trim(),
        id_categoria: selectedCategoryId,
        id_grupo: null, // Campo requerido por el backend
      };

      // Asegurarse de que TODOS los campos requeridos estén presentes
      const requiredFields = ['descripcion', 'monto', 'fecha', 'fuente', 'id_categoria', 'id_grupo'];
      const missingFields = requiredFields.filter(field => !(field in incomeData) || incomeData[field] === undefined);

      if (missingFields.length > 0) {
        console.error('ERROR: Faltan campos requeridos:', missingFields);
        throw new Error(`Faltan campos requeridos: ${missingFields.join(', ')}`);
      }

      console.log('=== DATOS A ENVIAR AL BACKEND (FORMATO POSTMAN) ===');
      console.log(JSON.stringify(incomeData, null, 2));
      console.log('Campos requeridos presentes:', requiredFields.every(field => field in incomeData));
      console.log('===================================');
      console.log('Comparación con Postman:');
      console.log('- descripcion: OK');
      console.log('- monto: debe ser string decimal (ej: "1500000.00")');
      console.log('- fecha: debe ser YYYY-MM-DD');
      console.log('- fuente: OK');
      console.log('- id_categoria: debe ser número');
      console.log('- id_grupo: debe ser null o número');
      console.log('===================================');
      const newIncome = await incomeService.createIncome(incomeData);

      // Agregar a la lista local
      const movement: Movement = {
        id: newIncome.id_ingreso.toString(),
        type: 'income',
        amount: typeof newIncome.monto === 'string' ? parseFloat(newIncome.monto) : newIncome.monto,
        description: newIncome.descripcion,
        category: categories.find(c => c.id_categoria === newIncome.id_categoria)?.nombre || 'Sin categoría',
        categoryId: newIncome.id_categoria,
        createdAt: newIncome.fecha_creacion ? new Date(newIncome.fecha_creacion).getTime() : Date.now(),
      };

      setItems(prev => [movement, ...prev]);

      // Reset inputs
      setAmount("");
      setDescription("");
      setFuente("");

      Swal.fire({
        title: '¡Éxito!',
        text: 'Ingreso registrado correctamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error creando ingreso:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo registrar el ingreso',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8 bg-neutral-50/90 backdrop-blur border-b border-neutral-200 px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-3">
          <Link href="/main/dashboard" className="rounded-full p-2 hover:bg-neutral-100">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="font-medium">Agregar Ingreso</div>
        </div>
      </div>

      <div className="mt-4 grid gap-6">
        {/* Header tipo */}
        <div className="w-full flex justify-center">
          <div className="rounded-full bg-emerald-50 px-6 py-2">
            <span className="text-emerald-700 font-medium">Registro de Ingreso</span>
          </div>
        </div>

        {/* Inputs */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm space-y-4">
          <div>
            <label className="text-sm text-neutral-600">Monto</label>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 focus-within:border-emerald-400">
              <PiggyBank className="h-4 w-4 text-emerald-500" />
              <input
                inputMode="decimal"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent outline-none text-lg"
                disabled={isLoading}
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-neutral-600">Fuente del ingreso *</label>
            <input
              placeholder="Ej. Salario mensual, Freelance, etc."
              value={fuente}
              onChange={(e) => setFuente(e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 outline-none focus:border-emerald-400"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="text-sm text-neutral-600">Descripción (opcional)</label>
            <input
              placeholder="Ej. Salario de enero, bono de fin de año"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 outline-none focus:border-emerald-400"
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-3">
            <div>
              <label className="text-sm text-neutral-600">Categoría</label>
              <div className="mt-1 relative">
                {isLoadingCategories ? (
                  <div className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Cargando categorías...</span>
                  </div>
                ) : (
                  <>
                    <select
                      value={selectedCategoryId || ""}
                      onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                      className="w-full appearance-none rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400"
                      disabled={isLoading || categories.length === 0}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                    <Tag className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-300" />
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                placeholder="Nueva categoría de ingreso"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400"
                disabled={isLoading}
              />
              <button
                onClick={addCategory}
                disabled={isLoading || !newCategoryName.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-400 px-3 py-2 text-sm text-white"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Agregar
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onSave}
              disabled={isLoading || !amount || !fuente.trim() || !selectedCategoryId}
              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-400 px-4 py-3 text-white font-medium flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Ingreso'
              )}
            </button>
          </div>
        </div>

        {/* Preview dinámico */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-neutral-700">Historial de Ingresos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-center">
              <div className="text-xs text-neutral-500">Total Ingresos Registrados</div>
              <div className="text-xl font-semibold text-emerald-700">{formatCurrency(totals.incomes, user)}</div>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-center">
              <div className="text-xs text-neutral-500">Ingresos en esta sesión</div>
              <div className="text-xl font-semibold text-emerald-700">{formatCurrency(items.filter(i => i.type === "income").reduce((a, b) => a + b.amount, 0), user)}</div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white divide-y">
            {items.length === 0 ? (
              <div className="p-4 text-sm text-neutral-500">Aún no hay ingresos registrados</div>
            ) : (
              items.map((m) => (
                <div key={m.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{m.category} {m.description ? `· ${m.description}` : ""}</div>
                    <div className="text-xs text-neutral-500">{new Date(m.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="text-sm font-semibold text-emerald-700">
                    +{formatCurrency(m.amount, user)}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
