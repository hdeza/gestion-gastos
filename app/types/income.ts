// Tipos para gestión de ingresos
export interface Income {
  id_ingreso: number;
  descripcion: string;
  monto: number | string; // Puede ser number o string según el backend
  fecha: string;
  fuente: string;
  id_categoria: number;
  id_grupo?: number;
  id_usuario: number;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export interface CreateIncomeData {
  descripcion: string;
  monto: number;
  fecha: string;
  fuente: string;
  id_categoria: number;
  id_grupo?: number | null;
}

export interface UpdateIncomeData {
  descripcion?: string;
  monto?: number;
  fecha?: string;
  fuente?: string;
  id_categoria?: number;
  id_grupo?: number | null;
}

export interface IncomeFilters {
  skip?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
}

export interface IncomeTotal {
  total: number;
}

export interface IncomeStats {
  total_ingresos: number;
  promedio_mensual: number;
  mejor_mes: string;
  peor_mes: string;
}
