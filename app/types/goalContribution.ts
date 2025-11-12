export interface GoalContribution {
  id_aporte: number;
  id_meta: number;
  id_usuario: number;
  monto: number | string;
  fecha: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  // Campos relacionados que pueden venir del API
  usuario?: {
    id_usuario: number;
    nombre: string;
    correo: string;
  };
  meta?: {
    id_meta: number;
    nombre: string;
    monto_objetivo: number;
  };
}

export interface CreateGoalContributionData {
  id_meta: number;
  monto: number;
  fecha: string;
}

export interface UpdateGoalContributionData {
  monto?: number;
  fecha?: string;
}

export interface GoalContributionFilters {
  skip?: number;
  limit?: number;
}

export interface GoalContributionTotal {
  total: number;
  cantidad: number;
}

