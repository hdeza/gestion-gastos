"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  House,
  UtensilsCrossed,
  Droplets,
  Bus,
  Smartphone,
  Lightbulb,
  Brain,
  Gamepad2,
  Sparkles,
  Loader2,
} from "lucide-react";
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Label,
} from "recharts";
import { incomeService } from "../../services/incomeService";
import { categoryService } from "../../services/categoryService";
import { Income } from "../../types/income";
import { Category } from "../../types/category";
import { useAuth } from "../../contexts/AuthContext";
import { formatCurrency } from "../../utils/currency";
import Swal from "sweetalert2";

type CategoryDisplay = {
  id: string;
  name: string;
  color: string;
  spent: number;
  budget: number;
  icon: React.ReactNode;
};

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [incomes, setIncomes] = React.useState<Income[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [categoryDisplays, setCategoryDisplays] = React.useState<CategoryDisplay[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedMonth, setSelectedMonth] = React.useState(new Date());

  // Cargar datos al montar el componente
  React.useEffect(() => {
    loadDashboardData();
  }, [selectedMonth]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Cargar ingresos del mes actual
      const startDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
      const endDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);

      const [incomesData, categoriesData] = await Promise.all([
        incomeService.getIncomesByDateRange(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        ),
        categoryService.getCategories({ tipo: 'ingreso' })
      ]);

      console.log('Datos recibidos de la API:', {
        incomes: incomesData,
        categories: categoriesData
      });

      setIncomes(incomesData);
      setCategories(categoriesData);

      // Filtrar categorías que no tienen ID válido
      const validCategories = categoriesData.filter(cat => cat.id_categoria !== undefined && cat.id_categoria !== null);
      console.log(`Categorías totales: ${categoriesData.length}, válidas: ${validCategories.length}`);
      if (validCategories.length !== categoriesData.length) {
        console.log('Categorías filtradas:', categoriesData.filter(cat => cat.id_categoria === undefined || cat.id_categoria === null));
      }

      // Crear display categories con datos reales
      const displays: CategoryDisplay[] = validCategories.map((cat, index) => {
        const categoryIncomes = incomesData.filter(inc => inc.id_categoria === cat.id_categoria);
        const totalSpent = categoryIncomes.reduce((sum, inc) => sum + Number(inc.monto), 0);

        // Colores por defecto si no tienen
        const defaultColors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
        const color = cat.color || defaultColors[index % defaultColors.length];

        // Iconos por defecto
        const defaultIcons = [<House className="h-5 w-5" />, <UtensilsCrossed className="h-5 w-5" />, <Droplets className="h-5 w-5" />, <Bus className="h-5 w-5" />, <Smartphone className="h-5 w-5" />, <Lightbulb className="h-5 w-5" />];
        const icon = defaultIcons[index % defaultIcons.length];

        // Presupuesto estimado (podría venir de la API después)
        const estimatedBudget = totalSpent * 1.2; // 20% más que lo gastado

        return {
          id: cat.id_categoria.toString(),
          name: cat.nombre || 'Sin nombre',
          color,
          spent: totalSpent,
          budget: estimatedBudget,
          icon,
        };
      });

      setCategoryDisplays(displays);

      console.log('Displays creados:', displays);

    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar los datos del dashboard',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalIncome = incomes.reduce((acc, inc) => acc + Number(inc.monto), 0);
  const budget = categoryDisplays.reduce((acc, c) => acc + c.budget, 0);
  const available = Math.max(budget - totalIncome, 0);

  const pieData = categoryDisplays.map((c) => ({
    name: c.name,
    value: c.spent,
    color: c.color,
  }));

  return (
    <div className="space-y-6">
      {/* Header selector */}
      <div className="flex items-center justify-between gap-3">
        <button
          aria-label="Mes anterior"
          onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1))}
          className="rounded-full p-2 hover:bg-neutral-100"
          disabled={isLoading}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-sm font-medium text-neutral-600">
          {selectedMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
        </div>
        <button
          aria-label="Mes siguiente"
          onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1))}
          className="rounded-full p-2 hover:bg-neutral-100"
          disabled={isLoading}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Card resumen */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
            <span className="ml-2 text-neutral-500">Cargando datos...</span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-neutral-600 text-sm">
                  Ingresos del mes
                </div>
                <div className="text-2xl font-semibold text-neutral-900">
                  {formatCurrency(totalIncome, user)}
                </div>
              </div>
              <div className="h-14 w-14 rounded-full bg-emerald-50 ring-8 ring-emerald-100 flex items-center justify-center">
                <div className="h-6 w-6 rounded-full bg-emerald-600" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 divide-x divide-neutral-200 rounded-xl border border-neutral-200">
              <div className="p-3">
                <div className="text-neutral-500 text-xs">Categorías activas</div>
                <div className="text-neutral-900 font-medium">
                  {categoryDisplays.length}
                </div>
              </div>
              <div className="p-3">
                <div className="text-neutral-500 text-xs">Presupuesto estimado</div>
                <div className="text-neutral-900 font-medium">
                  {formatCurrency(budget, user)}
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Tokens de IA */}
      <section className="rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-purple-700 text-sm font-medium">
                Tokens de IA
              </div>
              <div className="text-2xl font-bold text-purple-900">25</div>
              <div className="text-xs text-purple-600">
                Para consultas financieras
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => router.push("/main/game")}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
            >
              <Gamepad2 className="h-4 w-4" />
              Ganar Más
            </button>
            <div className="text-xs text-purple-600 text-center">
              Juega el puzzle
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm text-purple-700">
          <Sparkles className="h-4 w-4" />
          <span>Usa tus tokens para obtener consejos personalizados de IA</span>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[{ k: "Mensual" }, { k: "Semanal" }, { k: "Fecha" }].map((t, i) => (
          <button
            key={t.k}
            className={`${
              i === 0
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-700"
            } rounded-full px-4 py-2 text-sm whitespace-nowrap`}
          >
            {t.k}
          </button>
        ))}
      </div>

      {/* Gráficas y listas - responsive grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut chart */}
        <div className="lg:col-span-1 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="h-64 sm:h-72">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
              </div>
            ) : pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={pieData}
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          const cx = (viewBox as any).cx as number;
                          const cy = (viewBox as any).cy as number;
                          return (
                            <text
                              x={cx}
                              y={cy}
                              textAnchor="middle"
                              dominantBaseline="central"
                            >
                              <tspan fill="#64748b" fontSize="12">
                                Total
                              </tspan>
                              <tspan
                                x={cx}
                                y={cy + 18}
                                fill="#0f172a"
                                fontSize="18"
                                fontWeight="600"
                              >
                                {formatCurrency(totalIncome, user)}
                              </tspan>
                            </text>
                          );
                        }
                        return null;
                      }}
                    />
                  </Pie>
                </RePieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-neutral-500">
                  <div className="text-sm">No hay datos</div>
                  <div className="text-xs">Registra ingresos para ver estadísticas</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lista de categorías */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
              <span className="ml-2 text-neutral-500">Cargando categorías...</span>
            </div>
          ) : categoryDisplays.length > 0 ? (
            categoryDisplays.map((c) => {
              const percentage = Math.min(
                Math.round((c.spent / c.budget) * 100),
                100
              );
              const availableCat = Math.max(c.budget - c.spent, 0);
              return (
                <div
                  key={c.id}
                  className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-xl grid place-items-center"
                        style={{ backgroundColor: `${c.color}20` }}
                      >
                        <span style={{ color: c.color }}>{c.icon}</span>
                      </div>
                      <div className="font-medium text-neutral-900">{c.name}</div>
                      <span className="ml-2 rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-600">
                        {percentage}%
                      </span>
                    </div>
                    <div className="text-neutral-900 font-medium">
                      {formatCurrency(c.spent, user)}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-neutral-500">
                    Presupuesto: {formatCurrency(c.budget, user)}
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: c.color,
                      }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-center text-neutral-500">
                <div className="text-sm">No hay categorías</div>
                <div className="text-xs">Crea categorías para organizar tus ingresos</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Recomendaciones */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Recomendaciones</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <div className="text-sm text-neutral-700">
              Ajusta tu presupuesto mensual si notas sobrecarga en una
              categoría.
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <Smartphone className="h-5 w-5 text-blue-500" />
            <div className="text-sm text-neutral-700">
              Registra tus gastos al momento para mantener datos actualizados.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
