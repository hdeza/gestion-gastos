"use client";

import React from "react";
import { ArrowLeft, Plus, Tag, Wallet, PiggyBank } from "lucide-react";
import Link from "next/link";

type MovementType = "expense" | "income";

type Movement = {
  id: string;
  type: MovementType;
  amount: number;
  description?: string;
  category: string;
  createdAt: number;
};

const defaultCategories = {
  expense: ["Alquiler", "Alimentación", "Servicios", "Transporte"],
  income: ["Beca", "Trabajo", "Ayuda", "Otros"]
};

function formatCurrency(n: number) {
  return n.toLocaleString("es-ES", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function AddExpenseIncome() {
  const [type, setType] = React.useState<MovementType>("expense");
  const [amount, setAmount] = React.useState<string>("");
  const [description, setDescription] = React.useState<string>("");
  const [category, setCategory] = React.useState<string>(defaultCategories.expense[0]);
  const [newCategory, setNewCategory] = React.useState<string>("");
  const [categories, setCategories] = React.useState<typeof defaultCategories>(defaultCategories);
  const [items, setItems] = React.useState<Movement[]>([]);

  React.useEffect(() => {
    // Reset categoría cuando cambia el tipo
    const list = type === "expense" ? categories.expense : categories.income;
    setCategory(list[0] ?? "General");
  }, [type, categories]);

  const totals = React.useMemo(() => {
    const expenses = items.filter(i => i.type === "expense").reduce((a, b) => a + b.amount, 0);
    const incomes = items.filter(i => i.type === "income").reduce((a, b) => a + b.amount, 0);
    return { expenses, incomes, balance: incomes - expenses };
  }, [items]);

  function addCategory() {
    if (!newCategory.trim()) return;
    setCategories(prev => {
      const updated = { ...prev };
      const listKey = type === "expense" ? "expense" : "income";
      if (!updated[listKey].includes(newCategory.trim())) {
        updated[listKey] = [...updated[listKey], newCategory.trim()];
      }
      return updated;
    });
    setCategory(newCategory.trim());
    setNewCategory("");
  }

  function onSave() {
    const parsed = Number(amount.replace(/[^0-9.]/g, ""));
    if (!parsed || parsed <= 0) return;
    const movement: Movement = {
      id: crypto.randomUUID(),
      type,
      amount: parsed,
      description: description || undefined,
      category,
      createdAt: Date.now(),
    };
    setItems(prev => [movement, ...prev]);
    // Reset inputs conservando el tipo seleccionado
    setAmount("");
    setDescription("");
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8 bg-neutral-50/90 backdrop-blur border-b border-neutral-200 px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-3">
          <Link href="/main/dashboard" className="rounded-full p-2 hover:bg-neutral-100">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="font-medium">Agregar {type === "expense" ? "gasto" : "ingreso"}</div>
        </div>
      </div>

      <div className="mt-4 grid gap-6">
        {/* Toggle tipo */}
        <div className="w-full flex justify-center">
          <div className="flex justify-center rounded-full bg-blue-50 p-1 w-full">
            <button
              className={`flex-1 rounded-full px-4 py-2 text-sm ${type === "expense" ? "bg-blue-600 text-white" : "text-blue-700"}`}
              onClick={() => setType("expense")}
            >
              Gasto
            </button>
            <button
              className={`flex-1 rounded-full px-4 py-2 text-sm ${type === "income" ? "bg-blue-600 text-white" : "text-blue-700"}`}
              onClick={() => setType("income")}
            >
              Ingreso
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm space-y-4">
          <div>
            <label className="text-sm text-neutral-600">Monto</label>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 focus-within:border-blue-400">
              {type === "expense" ? <Wallet className="h-4 w-4 text-blue-500" /> : <PiggyBank className="h-4 w-4 text-blue-500" />}
              <input
                inputMode="decimal"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent outline-none text-lg"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-neutral-600">Descripción (opcional)</label>
            <input
              placeholder="Ej. Almuerzo, pago de renta"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 outline-none focus:border-blue-400"
            />
          </div>
          <div className="grid gap-3">
            <div>
              <label className="text-sm text-neutral-600">Categoría</label>
              <div className="mt-1 relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
                >
                  {(type === "expense" ? categories.expense : categories.income).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <Tag className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-300" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                placeholder={type === "expense" ? "Nueva categoría de gasto" : "Nueva categoría de ingreso"}
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex-1 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
              />
              <button onClick={addCategory} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-3 py-2 text-sm text-white">
                <Plus className="h-4 w-4" />
                Agregar
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button onClick={onSave} className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-3 text-white font-medium">
              Guardar {type === "expense" ? "gasto" : "ingreso"}
            </button>
          </div>
        </div>

        {/* Preview dinámico */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-neutral-700">Preview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-center">
              <div className="text-xs text-neutral-500">Ingresos</div>
              <div className="text-xl font-semibold text-emerald-700">{formatCurrency(totals.incomes)}</div>
            </div>
            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-center">
              <div className="text-xs text-neutral-500">Gastos</div>
              <div className="text-xl font-semibold text-rose-700">{formatCurrency(totals.expenses)}</div>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-center">
              <div className="text-xs text-neutral-500">Balance</div>
              <div className={`text-xl font-semibold ${totals.balance >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{formatCurrency(totals.balance)}</div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white divide-y">
            {items.length === 0 ? (
              <div className="p-4 text-sm text-neutral-500">Aún no hay movimientos</div>
            ) : (
              items.map((m) => (
                <div key={m.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{m.category} {m.description ? `· ${m.description}` : ""}</div>
                    <div className="text-xs text-neutral-500">{new Date(m.createdAt).toLocaleString()}</div>
                  </div>
                    <div className={`text-sm font-semibold ${m.type === "income" ? "text-emerald-700" : "text-rose-700"}`}>
                      {m.type === "income" ? "+" : "-"}{formatCurrency(m.amount)}
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
