// Tipos para gestión de categorías
export interface Category {
  id_categoria: number;
  nombre: string;
  tipo: 'ingreso' | 'gasto';
  color: string;
  icono: string;
  es_global: boolean;
  id_usuario?: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface CreateCategoryData {
  nombre: string;
  tipo: 'ingreso' | 'gasto';
  color: string;
  icono: string;
  es_global?: boolean;
}

export interface UpdateCategoryData {
  nombre?: string;
  tipo?: 'ingreso' | 'gasto';
  color?: string;
  icono?: string;
  es_global?: boolean;
}

export interface CategoryFilters {
  skip?: number;
  limit?: number;
  tipo?: 'ingreso' | 'gasto';
}

export interface CategoryStats {
  total_gastos: number;
  total_ingresos: number;
  cantidad_transacciones: number;
  promedio_mensual: number;
}
