import { Student, StudentFormData, ApiResponse, DatabaseStatus, AdminUser } from '../types/student.ts';

const API_BASE = '/api';

export interface StudentFilterParams {
  search?: string;
  department?: string;
  status?: string;
  yearLevel?: string;
  minGpa?: number;
  maxGpa?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export const api = {
  // Students REST APIs
  async getStudents(params: StudentFilterParams = {}): Promise<ApiResponse<Student[]>> {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.department && params.department !== 'All') query.append('department', params.department);
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.yearLevel && params.yearLevel !== 'All') query.append('yearLevel', params.yearLevel);
    if (params.minGpa !== undefined) query.append('minGpa', params.minGpa.toString());
    if (params.maxGpa !== undefined) query.append('maxGpa', params.maxGpa.toString());
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());

    const res = await fetch(`${API_BASE}/students?${query.toString()}`);
    const data = await res.json();
    if (!res.ok) {
      throw { status: res.status, ...data };
    }
    return data;
  },

  async getStudent(id: string): Promise<ApiResponse<Student>> {
    const res = await fetch(`${API_BASE}/students/${encodeURIComponent(id)}`);
    const data = await res.json();
    if (!res.ok) {
      throw { status: res.status, ...data };
    }
    return data;
  },

  async createStudent(student: StudentFormData): Promise<ApiResponse<Student>> {
    const res = await fetch(`${API_BASE}/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(student)
    });
    const data = await res.json();
    if (!res.ok) {
      throw { status: res.status, ...data };
    }
    return data;
  },

  async updateStudent(id: string, updates: Partial<StudentFormData>): Promise<ApiResponse<Student>> {
    const res = await fetch(`${API_BASE}/students/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok) {
      throw { status: res.status, ...data };
    }
    return data;
  },

  async deleteStudent(id: string): Promise<ApiResponse<{ deletedStudent: Student }>> {
    const res = await fetch(`${API_BASE}/students/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok) {
      throw { status: res.status, ...data };
    }
    return data;
  },

  async seedDefaultStudents(): Promise<ApiResponse<Student[]>> {
    const res = await fetch(`${API_BASE}/students/seed`, {
      method: 'POST'
    });
    const data = await res.json();
    if (!res.ok) {
      throw { status: res.status, ...data };
    }
    return data;
  },

  async getSummaryStats(): Promise<ApiResponse<any>> {
    const res = await fetch(`${API_BASE}/students/stats/summary`);
    const data = await res.json();
    if (!res.ok) {
      throw { status: res.status, ...data };
    }
    return data;
  },

  // Auth REST APIs
  async login(email: string, password: string): Promise<{ success: boolean; token: string; user: AdminUser; error?: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw { status: res.status, ...data };
    }
    return data;
  },

  async getMe(token: string): Promise<{ success: boolean; user: AdminUser }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (!res.ok) {
      throw { status: res.status, ...data };
    }
    return data;
  },

  // Database status
  async getDbStatus(): Promise<ApiResponse<DatabaseStatus>> {
    const res = await fetch(`${API_BASE}/db/status`);
    const data = await res.json();
    if (!res.ok) {
      throw { status: res.status, ...data };
    }
    return data;
  }
};
