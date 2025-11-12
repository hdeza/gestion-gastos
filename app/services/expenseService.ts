import { Expense, CreateExpenseData, UpdateExpenseData, ExpenseFilters, ExpenseTotal } from '../types/expense';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

class ExpenseService {
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

  async getPersonalExpenses(filters: ExpenseFilters = {}): Promise<Expense[]> {
    const params = new URLSearchParams();
    if (filters.skip !== undefined) params.append('skip', filters.skip.toString());
    if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
    params.append('personal_only', 'true');

    const response = await fetch(`${API_BASE_URL}/api/expenses/?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al obtener gastos personales');
    }

    return response.json();
  }

  async getExpenseById(expenseId: number): Promise<Expense> {
    const response = await fetch(`${API_BASE_URL}/api/expenses/${expenseId}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al obtener el gasto');
    }

    return response.json();
  }

  async getGroupExpenses(groupId: number, filters: ExpenseFilters = {}): Promise<Expense[]> {
    const params = new URLSearchParams();
    if (filters.skip !== undefined) params.append('skip', filters.skip.toString());
    if (filters.limit !== undefined) params.append('limit', filters.limit.toString());

    const response = await fetch(`${API_BASE_URL}/api/expenses/group/${groupId}?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al obtener gastos del grupo');
    }

    return response.json();
  }

  async createExpense(data: CreateExpenseData): Promise<Expense> {
    const response = await fetch(`${API_BASE_URL}/api/expenses/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al crear el gasto');
    }

    return response.json();
  }

  async updateExpense(expenseId: number, data: UpdateExpenseData): Promise<Expense> {
    const response = await fetch(`${API_BASE_URL}/api/expenses/${expenseId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al actualizar el gasto');
    }

    return response.json();
  }

  async deleteExpense(expenseId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/expenses/${expenseId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al eliminar el gasto');
    }
  }

  async getTotalExpenses(personalOnly: boolean = false): Promise<ExpenseTotal> {
    const params = new URLSearchParams();
    params.append('personal_only', personalOnly.toString());

    const response = await fetch(`${API_BASE_URL}/api/expenses/total/amount?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al obtener el total de gastos');
    }

    return response.json();
  }

  async getGroupTotalExpenses(groupId: number): Promise<ExpenseTotal> {
    const response = await fetch(`${API_BASE_URL}/api/expenses/group/${groupId}/total/amount`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al obtener el total de gastos del grupo');
    }

    return response.json();
  }

  async getExpensesByDateRange(startDate: string, endDate: string, personalOnly: boolean = false): Promise<Expense[]> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
      personal_only: personalOnly.toString(),
    });

    const response = await fetch(`${API_BASE_URL}/api/expenses/date-range/?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al obtener gastos por rango de fechas');
    }

    return response.json();
  }
}

export const expenseService = new ExpenseService();

