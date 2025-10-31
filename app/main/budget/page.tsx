"use client";

import React from "react";
import { Plus, Target, Calendar, PiggyBank, Plane, ArrowLeftRight } from "lucide-react";

type MonthlyCategory = {
  id: string;
  name: string;
  budget: number;
  spent: number;
  color: string;
};

type Goal = {
  id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string; // ISO
  icon: React.ReactNode;
};

const initialCats: MonthlyCategory[] = [
  { id: "rent", name: "Alquiler", budget: 380000, spent: 360000, color: "#f5b942" },
  { id: "food", name: "Alimentación", budget: 260000, spent: 200000, color: "#77bdf3" },
  { id: "services", name: "Servicios", budget: 90000, spent: 60000, color: "#f39ad2" },
  { id: "transport", name: "Transporte", budget: 80000, spent: 40000, color: "#7dd3a8" },
];

const initialGoals: Goal[] = [
  { id: "trip", title: "Viaje a San Andrés", targetAmount: 1200000, savedAmount: 300000, deadline: new Date(Date.now() + 30*24*3600*1000).toISOString(), icon: <Plane className="h-5 w-5" /> },
];

function currency(n: number) {
  return n.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function Budget() {
  const [tab, setTab] = React.useState<"monthly" | "goals">("monthly");
  const [cats, setCats] = React.useState<MonthlyCategory[]>(initialCats);
  const [goals, setGoals] = React.useState<Goal[]>(initialGoals);

  const monthlyTotalBudget = cats.reduce((a, c) => a + c.budget, 0);
  const monthlyTotalSpent = cats.reduce((a, c) => a + c.spent, 0);

  function addCategory() {
    setCats(prev => [
      ...prev,
      { id: crypto.randomUUID(), name: "Nueva categoría", budget: 0, spent: 0, color: "#c4b5fd" },
    ]);
  }

  function updateCat(id: string, key: "name" | "budget", value: string) {
    setCats(prev => prev.map(c => c.id === id ? { ...c, [key]: key === "budget" ? Number(value.replace(/[^0-9.]/g, "")) || 0 : value } : c));
  }

  function addGoal() {
    setGoals(prev => [
      ...prev,
      { id: crypto.randomUUID(), title: "Nuevo objetivo", targetAmount: 0, savedAmount: 0, deadline: new Date().toISOString(), icon: <Target className="h-5 w-5" /> },
    ]);
  }

  function updateGoal(id: string, key: keyof Omit<Goal, "id" | "icon">, value: string) {
    setGoals(prev => prev.map(g => g.id === id ? {
      ...g,
      [key]: key.includes("Amount") ? Number(value.replace(/[^0-9.]/g, "")) || 0 : value,
    } : g));
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[
          { key: "monthly", label: "Mensual" },
          { key: "goals", label: "Objetivos" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`rounded-full px-4 py-2 text-sm ${tab === t.key ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "monthly" ? (
        <section className="space-y-6">
          {/* Resumen mensual */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <div className="text-xs text-neutral-600">Presupuesto mensual</div>
              <div className="text-2xl font-semibold">{currency(monthlyTotalBudget)}</div>
            </div>
            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
              <div className="text-xs text-neutral-600">Gasto estimado</div>
              <div className="text-2xl font-semibold">{currency(monthlyTotalSpent)}</div>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <div className="text-xs text-neutral-600">Disponible</div>
              <div className="text-2xl font-semibold text-emerald-700">{currency(Math.max(monthlyTotalBudget - monthlyTotalSpent, 0))}</div>
            </div>
          </div>

          {/* Editor por categorías */}
          <div className="rounded-2xl border border-neutral-200 bg-white divide-y shadow-sm">
            <div className="flex items-center justify-between p-4">
              <div className="font-medium">Categorías</div>
              <button onClick={addCategory} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm text-white">
                <Plus className="h-4 w-4" /> Añadir categoría
              </button>
            </div>

            {cats.map((c) => {
              const pct = c.budget === 0 ? 0 : Math.min(Math.round((c.spent / c.budget) * 100), 100);
              return (
                <div key={c.id} className="p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                    <input
                      value={c.name}
                      onChange={(e) => updateCat(c.id, "name", e.target.value)}
                      className="rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                    />
                    <input
                      value={c.budget ? String(c.budget) : ""}
                      onChange={(e) => updateCat(c.id, "budget", e.target.value)}
                      placeholder="Presupuesto"
                      inputMode="numeric"
                      className="rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                    />
                    <div className="text-sm text-neutral-600">Usado: {currency(c.spent)} / {currency(c.budget)}</div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
                    <div className="h-full" style={{ width: `${pct}%`, backgroundColor: c.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="space-y-6">
          {/* Resumen de objetivos */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-neutral-600"><PiggyBank className="h-4 w-4" /> Ahorro total</div>
              <div className="text-lg font-semibold">{currency(goals.reduce((a,g)=>a+g.savedAmount,0))}</div>
              <div className="ml-auto flex items-center gap-2 text-sm text-neutral-600"><Calendar className="h-4 w-4" /> Próximas fechas: {goals.length}</div>
            </div>
          </div>

          {/* Lista de objetivos */}
          <div className="rounded-2xl border border-neutral-200 bg-white divide-y shadow-sm">
            <div className="flex items-center justify-between p-4">
              <div className="font-medium">Objetivos</div>
              <button onClick={addGoal} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm text-white"><Plus className="h-4 w-4" /> Nuevo objetivo</button>
            </div>
            {goals.map((g) => {
              const pct = g.targetAmount === 0 ? 0 : Math.min(Math.round((g.savedAmount / g.targetAmount) * 100), 100);
              return (
                <div key={g.id} className="p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                    <input
                      value={g.title}
                      onChange={(e) => updateGoal(g.id, "title", e.target.value)}
                      className="rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                    />
                    <input
                      value={g.targetAmount ? String(g.targetAmount) : ""}
                      onChange={(e) => updateGoal(g.id, "targetAmount", e.target.value)}
                      placeholder="Meta (USD)"
                      inputMode="numeric"
                      className="rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                    />
                    <input
                      value={g.savedAmount ? String(g.savedAmount) : ""}
                      onChange={(e) => updateGoal(g.id, "savedAmount", e.target.value)}
                      placeholder="Ahorrado"
                      inputMode="numeric"
                      className="rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                    />
                    <input
                      type="date"
                      value={g.deadline.slice(0,10)}
                      onChange={(e) => updateGoal(g.id, "deadline", e.target.value)}
                      className="rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm text-neutral-600">
                    <div className="flex items-center gap-2">
                      <ArrowLeftRight className="h-4 w-4" /> Avance
                    </div>
                    <div>{currency(g.savedAmount)} / {currency(g.targetAmount)}</div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
                    <div className="h-full bg-blue-600" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
