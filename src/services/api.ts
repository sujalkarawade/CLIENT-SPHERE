/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axios from 'axios';
import { Client, Lead, Task, Pipeline, DashboardStats, User } from '../types';

// Set up default axios client pointing relatively to /api
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Bearer Token if available in client localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('clientsphere_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authService = {
  register: async (payload: { name: string; email: string; password?: string }) => {
    const res = await api.post<{ token: string; user: User }>('/auth/register', payload);
    return res.data;
  },
  login: async (payload: { email: string; password?: string }) => {
    const res = await api.post<{ token: string; user: User }>('/auth/login', payload);
    return res.data;
  },
  getCurrentUser: async () => {
    const res = await api.get<{ user: User }>('/auth/me');
    return res.data;
  },
};

export const clientService = {
  getAll: async (params?: { search?: string; status?: string }) => {
    const res = await api.get<Client[]>('/clients', { params });
    return res.data;
  },
  create: async (data: Omit<Client, 'id' | 'createdAt'>) => {
    const res = await api.post<Client>('/clients', data);
    return res.data;
  },
  update: async (id: string, data: Omit<Client, 'id' | 'createdAt'>) => {
    const res = await api.put<Client>(`/clients/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete<{ message: string }>(`/clients/${id}`);
    return res.data;
  },
};

export const leadService = {
  getAll: async (params?: { search?: string; status?: string }) => {
    const res = await api.get<Lead[]>('/leads', { params });
    return res.data;
  },
  create: async (data: Omit<Lead, 'id' | 'createdAt'>) => {
    const res = await api.post<Lead>('/leads', data);
    return res.data;
  },
  update: async (id: string, data: Omit<Lead, 'id' | 'createdAt'>) => {
    const res = await api.put<Lead>(`/leads/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete<{ message: string }>(`/leads/${id}`);
    return res.data;
  },
};

export const taskService = {
  getAll: async (params?: { status?: string }) => {
    const res = await api.get<Task[]>('/tasks', { params });
    return res.data;
  },
  create: async (data: Omit<Task, 'id' | 'createdAt'>) => {
    const res = await api.post<Task>('/tasks', data);
    return res.data;
  },
  update: async (id: string, data: Omit<Task, 'id' | 'createdAt'>) => {
    const res = await api.put<Task>(`/tasks/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete<{ message: string }>(`/tasks/${id}`);
    return res.data;
  },
};

export const pipelineService = {
  getAll: async () => {
    const res = await api.get<Pipeline[]>('/pipelines');
    return res.data;
  },
  create: async (data: Omit<Pipeline, 'id' | 'createdAt'>) => {
    const res = await api.post<Pipeline>('/pipelines', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Omit<Pipeline, 'id' | 'createdAt'>>) => {
    const res = await api.put<Pipeline>(`/pipelines/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete<{ message: string }>(`/pipelines/${id}`);
    return res.data;
  },
};

export const dashboardService = {
  getStats: async () => {
    const res = await api.get<DashboardStats>('/dashboard/stats');
    return res.data;
  },
};

export default api;
