import {
  Group,
  GroupDetail,
  CreateGroupData,
  UpdateGroupData,
  GroupFilters,
  GroupMember,
} from "../types/group";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

class GroupService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      throw new Error("No hay token de autenticación");
    }

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  async getGroups(filters: GroupFilters = {}): Promise<Group[]> {
    const params = new URLSearchParams();
    if (filters.skip !== undefined)
      params.append("skip", filters.skip.toString());
    if (filters.limit !== undefined)
      params.append("limit", filters.limit.toString());

    const response = await fetch(`${API_BASE_URL}/api/groups/?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Error al obtener grupos");
    }

    return response.json();
  }

  async getCreatedGroups(filters: GroupFilters = {}): Promise<Group[]> {
    const params = new URLSearchParams();
    if (filters.skip !== undefined)
      params.append("skip", filters.skip.toString());
    if (filters.limit !== undefined)
      params.append("limit", filters.limit.toString());

    const response = await fetch(
      `${API_BASE_URL}/api/groups/created?${params}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Error al obtener grupos creados");
    }

    return response.json();
  }

  async getGroupById(groupId: number): Promise<GroupDetail> {
    const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Error al obtener el grupo");
    }

    return response.json();
  }

  async createGroup(data: CreateGroupData): Promise<Group> {
    const response = await fetch(`${API_BASE_URL}/api/groups/`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Error al crear el grupo");
    }

    return response.json();
  }

  async updateGroup(groupId: number, data: UpdateGroupData): Promise<Group> {
    const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Error al actualizar el grupo");
    }

    return response.json();
  }

  async deleteGroup(groupId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Error al eliminar el grupo");
    }
  }

  async getGroupMembers(groupId: number): Promise<GroupMember[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/groups/${groupId}/members`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || "Error al obtener miembros del grupo"
      );
    }

    return response.json();
  }

  async removeMember(groupId: number, userId: number): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/api/groups/${groupId}/members/${userId}`,
      {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Error al remover miembro del grupo");
    }
  }

  async changeMemberRole(
    groupId: number,
    userId: number,
    newRole: "admin" | "miembro"
  ): Promise<void> {
    const params = new URLSearchParams({ new_role: newRole });
    const response = await fetch(
      `${API_BASE_URL}/api/groups/${groupId}/members/${userId}/role?${params}`,
      {
        method: "PUT",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Error al cambiar rol del miembro");
    }
  }
}

export const groupService = new GroupService();
