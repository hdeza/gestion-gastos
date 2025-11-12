import { Invitation, InvitationDetail, CreateInvitationData, InvitationQRResponse, AcceptInvitationData } from '../types/invitation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

class InvitationService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async createInvitation(data: CreateInvitationData): Promise<Invitation> {
    const response = await fetch(`${API_BASE_URL}/api/invitations/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al crear la invitación');
    }

    return response.json();
  }

  async getGroupInvitations(groupId: number): Promise<Invitation[]> {
    const response = await fetch(`${API_BASE_URL}/api/invitations/group/${groupId}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al obtener invitaciones del grupo');
    }

    return response.json();
  }

  async getInvitationByToken(token: string): Promise<InvitationDetail> {
    const response = await fetch(`${API_BASE_URL}/api/invitations/token/${token}`, {
      headers: {},
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al obtener la invitación');
    }

    return response.json();
  }

  async getInvitationQR(invitationId: number): Promise<InvitationQRResponse> {
    const response = await fetch(`${API_BASE_URL}/api/invitations/${invitationId}/qr`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al generar QR de invitación');
    }

    return response.json();
  }

  async acceptInvitation(data: AcceptInvitationData): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/invitations/accept`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al aceptar la invitación');
    }
  }

  async rejectInvitation(data: AcceptInvitationData): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/invitations/reject`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al rechazar la invitación');
    }
  }

  async revokeInvitation(invitationId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/invitations/${invitationId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al revocar la invitación');
    }
  }
}

export const invitationService = new InvitationService();

