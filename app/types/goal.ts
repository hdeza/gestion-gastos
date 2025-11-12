export interface Goal {
  id_meta: number;
  nombre: string;
  monto_objetivo: number | string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'activa' | 'completada' | 'cancelada';
  id_grupo?: number | null;
  id_usuario: number;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  // Campos calculados que vienen del API
  monto_acumulado?: number | string;
  porcentaje_completado?: number;
  total_aportes?: number;
}

export interface CreateGoalData {
  nombre: string;
  monto_objetivo: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado?: 'activa' | 'completada' | 'cancelada';
  id_grupo?: number | null;
}

export interface UpdateGoalData {
  nombre?: string;
  monto_objetivo?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  estado?: 'activa' | 'completada' | 'cancelada';
}

export interface GoalFilters {
  skip?: number;
  limit?: number;
  personal_only?: boolean;
}

export interface GoalProgress {
  id_meta: number;
  nombre: string;
  monto_objetivo: number;
  monto_acumulado: number;
  porcentaje_completado: number;
  estado: string;
  faltante: number;
}

