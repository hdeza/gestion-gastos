"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  House,
  UtensilsCrossed,
  Droplets,
  Bus,
  Smartphone,
  Lightbulb,
} from "lucide-react";
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Label,
} from "recharts";

type Category = {
  id: string;
  name: string;
  color: string;
  spent: number;
  budget: number;
  icon: React.ReactNode;
};

const currency = (value: number) =>
  value.toLocaleString("es-ES", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const CATEGORIES: Category[] = [
  { id: "rent", name: "Alquiler", color: "#f5b942", spent: 360000, budget: 380000, icon: <House className="h-5 w-5" /> },
  { id: "food", name: "Alimentación", color: "#77bdf3", spent: 200000, budget: 260000, icon: <UtensilsCrossed className="h-5 w-5" /> },
  { id: "services", name: "Servicios", color: "#f39ad2", spent: 60000, budget: 90000, icon: <Droplets className="h-5 w-5" /> },
  { id: "transit", name: "Transporte", color: "#7dd3a8", spent: 40000, budget: 80000, icon: <Bus className="h-5 w-5" /> },
];

export default function Dashboard() {
  const total = CATEGORIES.reduce((acc, c) => acc + c.spent, 0);
  const budget = 950000;
  const available = Math.max(budget - total, 0);

  const pieData = CATEGORIES.map((c) => ({ name: c.name, value: c.spent, color: c.color }));

  return (
    <div className="space-y-6">
      {/* Header selector */}
      <div className="flex items-center justify-between gap-3">
        <button aria-label="Mes anterior" className="rounded-full p-2 hover:bg-neutral-100">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-sm font-medium text-neutral-600">Septiembre 2024</div>
        <button aria-label="Mes siguiente" className="rounded-full p-2 hover:bg-neutral-100">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Card resumen */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-neutral-600 text-sm">Disponible para gastar</div>
            <div className="text-2xl font-semibold text-neutral-900">{currency(available)}</div>
          </div>
          <div className="h-14 w-14 rounded-full bg-blue-50 ring-8 ring-blue-100 flex items-center justify-center">
            <div className="h-6 w-6 rounded-full bg-blue-600" />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 divide-x divide-neutral-200 rounded-xl border border-neutral-200">
          <div className="p-3">
            <div className="text-neutral-500 text-xs">Gastos totales</div>
            <div className="text-neutral-900 font-medium">{currency(total)}</div>
          </div>
          <div className="p-3">
            <div className="text-neutral-500 text-xs">Presupuesto</div>
            <div className="text-neutral-900 font-medium">{currency(budget)}</div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[
          { k: "Mensual" },
          { k: "Semanal" },
          { k: "Fecha" },
        ].map((t, i) => (
          <button
            key={t.k}
            className={`${
              i === 0 ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-700"
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
                      if (
                        viewBox &&
                        "cx" in viewBox &&
                        "cy" in viewBox
                      ) {
                        const cx = (viewBox as any).cx as number;
                        const cy = (viewBox as any).cy as number;
                        return (
                          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
                            <tspan fill="#64748b" fontSize="12">Total</tspan>
                            <tspan x={cx} y={cy + 18} fill="#0f172a" fontSize="18" fontWeight="600">
                              {currency(total)}
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
          </div>
        </div>

        {/* Lista de categorías */}
        <div className="lg:col-span-2 space-y-4">
          {CATEGORIES.map((c) => {
            const percentage = Math.min(Math.round((c.spent / c.budget) * 100), 100);
            const availableCat = Math.max(c.budget - c.spent, 0);
            return (
              <div key={c.id} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl grid place-items-center" style={{ backgroundColor: `${c.color}20` }}>
                      <span style={{ color: c.color }}>{c.icon}</span>
                    </div>
                    <div className="font-medium text-neutral-900">{c.name}</div>
                    <span className="ml-2 rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-600">{percentage}%</span>
                  </div>
                  <div className="text-neutral-900 font-medium">{currency(c.spent)}</div>
                </div>
                <div className="mt-2 text-xs text-neutral-500">Disponible: {currency(availableCat)}</div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${percentage}%`, backgroundColor: c.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recomendaciones */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Recomendaciones</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <div className="text-sm text-neutral-700">
              Ajusta tu presupuesto mensual si notas sobrecarga en una categoría.
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
