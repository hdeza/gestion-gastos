import { Income, CreateIncomeData, UpdateIncomeData, IncomeFilters, IncomeTotal } from '../types/income';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

class IncomeService {
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

  async getPersonalIncomes(filters: IncomeFilters = {}): Promise<Income[]> {
    const params = new URLSearchParams();
    if (filters.skip !== undefined) params.append('skip', filters.skip.toString());
    if (filters.limit !== undefined) params.append('limit', filters.limit.toString());

    const response = await fetch(`${API_BASE_URL}/api/incomes/?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al obtener ingresos personales');
    }

    return response.json();
  }

  async getIncomeById(incomeId: number): Promise<Income> {
    const response = await fetch(`${API_BASE_URL}/api/incomes/${incomeId}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al obtener el ingreso');
    }

    return response.json();
  }

  async getGroupIncomes(groupId: number, filters: IncomeFilters = {}): Promise<Income[]> {
    const params = new URLSearchParams();
    if (filters.skip !== undefined) params.append('skip', filters.skip.toString());
    if (filters.limit !== undefined) params.append('limit', filters.limit.toString());

    const response = await fetch(`${API_BASE_URL}/api/incomes/group/${groupId}?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al obtener ingresos del grupo');
    }

    return response.json();
  }

  async createIncome(data: any): Promise<Income> {
    console.log('Enviando datos al backend:', data);
    console.log('Headers:', this.getAuthHeaders());

    const response = await fetch(`${API_BASE_URL}/api/incomes/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    console.log('Respuesta del backend - Status:', response.status);
    console.log('Respuesta del backend - Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.log('Error data del backend:', errorData);
      } catch (e) {
        console.log('No se pudo parsear error como JSON');
        const text = await response.text();
        console.log('Error como texto:', text);
        errorData = { detail: text };
      }
      throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Respuesta exitosa del backend:', result);
    return result;
  }

  async updateIncome(incomeId: number, data: UpdateIncomeData): Promise<Income> {
    const response = await fetch(`${API_BASE_URL}/api/incomes/${incomeId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al actualizar el ingreso');
    }

    return response.json();
  }

  async deleteIncome(incomeId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/incomes/${incomeId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al eliminar el ingreso');
    }
  }

  async getTotalIncome(): Promise<IncomeTotal> {
    const response = await fetch(`${API_BASE_URL}/api/incomes/total/amount`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al obtener el total de ingresos');
    }

    return response.json();
  }

  async getIncomesByDateRange(startDate: string, endDate: string): Promise<Income[]> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    });

    const response = await fetch(`${API_BASE_URL}/api/incomes/date-range/?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al obtener ingresos por rango de fechas');
    }

    return response.json();
  }

  async getGroupTotalIncome(groupId: number): Promise<IncomeTotal> {
    const response = await fetch(`${API_BASE_URL}/api/incomes/group/${groupId}/total/amount`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al obtener el total de ingresos del grupo');
    }

    return response.json();
  }
}

export const incomeService = new IncomeService();
