import { Goal, CreateGoalData, UpdateGoalData, GoalFilters, GoalProgress } from '../types/goal';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

class GoalService {
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

  async getGoals(filters: GoalFilters = {}): Promise<Goal[]> {
    const params = new URLSearchParams();
    if (filters.skip !== undefined) params.append('skip', filters.skip.toString());
    if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
    if (filters.personal_only !== undefined) params.append('personal_only', filters.personal_only.toString());

    const response = await fetch(`${API_BASE_URL}/api/goals/?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al obtener metas');
    }

    return response.json();
  }

  async getGoalById(goalId: number): Promise<Goal> {
    const response = await fetch(`${API_BASE_URL}/api/goals/${goalId}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al obtener la meta');
    }

    return response.json();
  }

  async getGroupGoals(groupId: number, filters: GoalFilters = {}): Promise<Goal[]> {
    const params = new URLSearchParams();
    if (filters.skip !== undefined) params.append('skip', filters.skip.toString());
    if (filters.limit !== undefined) params.append('limit', filters.limit.toString());

    const response = await fetch(`${API_BASE_URL}/api/goals/group/${groupId}?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al obtener metas del grupo');
    }

    return response.json();
  }

  async getGoalsByStatus(status: 'activa' | 'completada' | 'cancelada', personalOnly: boolean = false): Promise<Goal[]> {
    const params = new URLSearchParams();
    params.append('personal_only', personalOnly.toString());

    const response = await fetch(`${API_BASE_URL}/api/goals/status/${status}?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al obtener metas por estado');
    }

    return response.json();
  }

  async getGoalProgress(goalId: number): Promise<GoalProgress> {
    const response = await fetch(`${API_BASE_URL}/api/goals/${goalId}/progress`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al obtener progreso de la meta');
    }

    return response.json();
  }

  async createGoal(data: CreateGoalData): Promise<Goal> {
    const response = await fetch(`${API_BASE_URL}/api/goals/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al crear la meta');
    }

    return response.json();
  }

  async updateGoal(goalId: number, data: UpdateGoalData): Promise<Goal> {
    const response = await fetch(`${API_BASE_URL}/api/goals/${goalId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al actualizar la meta');
    }

    return response.json();
  }

  async deleteGoal(goalId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/goals/${goalId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al eliminar la meta');
    }
  }
}

export const goalService = new GoalService();

