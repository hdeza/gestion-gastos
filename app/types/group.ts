// Tipos para gestión de grupos
export interface Group {
  id_grupo: number;
  nombre: string;
  descripcion?: string;
  id_creador: number;
  fecha_creacion: string;
  fecha_actualizacion?: string;
}

export interface GroupMember {
  id_usuario: number;
  id_grupo?: number;
  rol: 'admin' | 'miembro';
  fecha_union: string;
  nombre: string;
  correo: string;
  usuario?: {
    id_usuario: number;
    nombre: string;
    correo: string;
  };
}

export interface GroupDetail extends Group {
  creado_por?: number;
  creador_nombre?: string;
  total_miembros?: number;
  miembros?: GroupMember[];
  creador?: {
    id_usuario: number;
    nombre: string;
    correo: string;
  };
}

export interface CreateGroupData {
  nombre: string;
  descripcion?: string;
}

export interface UpdateGroupData {
  nombre?: string;
  descripcion?: string;
}

export interface GroupFilters {
  skip?: number;
  limit?: number;
}

