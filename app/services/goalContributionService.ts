import { GoalContribution, CreateGoalContributionData, UpdateGoalContributionData, GoalContributionFilters, GoalContributionTotal } from '../types/goalContribution';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

class GoalContributionService {
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

  async getContributionsByGoal(goalId: number, filters: GoalContributionFilters = {}): Promise<GoalContribution[]> {
    const params = new URLSearchParams();
    if (filters.skip !== undefined) params.append('skip', filters.skip.toString());
    if (filters.limit !== undefined) params.append('limit', filters.limit.toString());

    const response = await fetch(`${API_BASE_URL}/api/goal-contributions/goal/${goalId}?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al obtener aportes de la meta');
    }

    return response.json();
  }

  async getUserContributions(filters: GoalContributionFilters = {}): Promise<GoalContribution[]> {
    const params = new URLSearchParams();
    if (filters.skip !== undefined) params.append('skip', filters.skip.toString());
    if (filters.limit !== undefined) params.append('limit', filters.limit.toString());

    const response = await fetch(`${API_BASE_URL}/api/goal-contributions/user?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al obtener aportes del usuario');
    }

    return response.json();
  }

  async getUserContributionsByGoal(goalId: number, userId: number): Promise<GoalContribution[]> {
    const response = await fetch(`${API_BASE_URL}/api/goal-contributions/goal/${goalId}/user/${userId}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al obtener aportes del usuario por meta');
    }

    return response.json();
  }

  async getContributionById(contributionId: number): Promise<GoalContribution> {
    const response = await fetch(`${API_BASE_URL}/api/goal-contributions/${contributionId}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al obtener el aporte');
    }

    return response.json();
  }

  async getGoalTotalContributions(goalId: number): Promise<GoalContributionTotal> {
    const response = await fetch(`${API_BASE_URL}/api/goal-contributions/goal/${goalId}/total`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al obtener total de aportes');
    }

    return response.json();
  }

  async createContribution(data: CreateGoalContributionData): Promise<GoalContribution> {
    const response = await fetch(`${API_BASE_URL}/api/goal-contributions/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al crear el aporte');
    }

    return response.json();
  }

  async updateContribution(contributionId: number, data: UpdateGoalContributionData): Promise<GoalContribution> {
    const response = await fetch(`${API_BASE_URL}/api/goal-contributions/${contributionId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al actualizar el aporte');
    }

    return response.json();
  }

  async deleteContribution(contributionId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/goal-contributions/${contributionId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al eliminar el aporte');
    }
  }
}

export const goalContributionService = new GoalContributionService();

