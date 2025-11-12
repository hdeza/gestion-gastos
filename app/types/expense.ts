// Tipos para gestión de gastos
export interface Expense {
  id_gasto: number;
  descripcion: string;
  monto: number | string;
  fecha: string;
  metodo_pago: string;
  nota?: string;
  recurrente: boolean;
  id_categoria: number;
  id_grupo?: number;
  id_usuario: number;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export interface CreateExpenseData {
  descripcion: string;
  monto: number;
  fecha: string;
  metodo_pago: string;
  nota?: string;
  recurrente?: boolean;
  id_categoria: number;
  id_grupo?: number | null;
}

export interface UpdateExpenseData {
  descripcion?: string;
  monto?: number;
  fecha?: string;
  metodo_pago?: string;
  nota?: string;
  recurrente?: boolean;
  id_categoria?: number;
  id_grupo?: number | null;
}

export interface ExpenseFilters {
  skip?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
  personal_only?: boolean;
}

export interface ExpenseTotal {
  total: number;
}

