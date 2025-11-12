// Tipos para gestión de invitaciones
export interface Invitation {
  id_invitacion: number;
  id_grupo: number;
  id_usuario_invitado?: number;
  token: string;
  link_invitacion?: string;
  fecha_creacion: string;
  fecha_expiracion: string;
  estado: 'pendiente' | 'aceptada' | 'rechazada' | 'expirada' | 'revocada';
  grupo?: {
    id_grupo: number;
    nombre: string;
    descripcion?: string;
  };
  creador?: {
    id_usuario: number;
    nombre: string;
    correo: string;
  };
}

export interface InvitationDetail extends Invitation {
  // Campos planos que vienen del API
  creado_por?: number;
  grupo_nombre?: string;
  grupo_descripcion?: string;
  creador_nombre?: string;
  // Mantener compatibilidad con estructura anidada (opcional)
  grupo?: {
    id_grupo: number;
    nombre: string;
    descripcion?: string;
    id_creador: number;
  };
  creador?: {
    id_usuario: number;
    nombre: string;
    correo: string;
  };
}

export interface CreateInvitationData {
  id_grupo: number;
  id_usuario_invitado?: number | null;
  dias_expiracion?: number;
}

export interface InvitationQRResponse {
  qr_code_base64: string;
  link_invitacion: string;
  token: string;
}

export interface AcceptInvitationData {
  token: string;
}

