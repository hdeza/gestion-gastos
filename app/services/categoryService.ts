import { Category, CreateCategoryData, UpdateCategoryData, CategoryFilters, CategoryStats } from '../types/category';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

class CategoryService {
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

  async getCategories(filters: CategoryFilters = {}): Promise<Category[]> {
    const params = new URLSearchParams();
    if (filters.skip !== undefined) params.append('skip', filters.skip.toString());
    if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
    if (filters.tipo) params.append('tipo', filters.tipo);

    const response = await fetch(`${API_BASE_URL}/api/categories/?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al obtener categorías');
    }

    return response.json();
  }

  async getPersonalCategories(filters: CategoryFilters = {}): Promise<Category[]> {
    const params = new URLSearchParams();
    if (filters.skip !== undefined) params.append('skip', filters.skip.toString());
    if (filters.limit !== undefined) params.append('limit', filters.limit.toString());

    const response = await fetch(`${API_BASE_URL}/api/categories/personal?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al obtener categorías personales');
    }

    return response.json();
  }

  async getGlobalCategories(filters: CategoryFilters = {}): Promise<Category[]> {
    const params = new URLSearchParams();
    if (filters.skip !== undefined) params.append('skip', filters.skip.toString());
    if (filters.limit !== undefined) params.append('limit', filters.limit.toString());

    const response = await fetch(`${API_BASE_URL}/api/categories/global?${params}`, {
      headers: {},
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al obtener categorías globales');
    }

    return response.json();
  }

  async getCategoryById(categoryId: number): Promise<Category> {
    const response = await fetch(`${API_BASE_URL}/api/categories/${categoryId}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al obtener la categoría');
    }

    return response.json();
  }

  async createCategory(data: CreateCategoryData): Promise<Category> {
    const response = await fetch(`${API_BASE_URL}/api/categories/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al crear la categoría');
    }

    return response.json();
  }

  async updateCategory(categoryId: number, data: UpdateCategoryData): Promise<Category> {
    const response = await fetch(`${API_BASE_URL}/api/categories/${categoryId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al actualizar la categoría');
    }

    return response.json();
  }

  async deleteCategory(categoryId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/categories/${categoryId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al eliminar la categoría');
    }
  }

  async getCategoryStats(categoryId: number): Promise<CategoryStats> {
    const response = await fetch(`${API_BASE_URL}/api/categories/${categoryId}/stats`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al obtener estadísticas de la categoría');
    }

    return response.json();
  }
}

export const categoryService = new CategoryService();
