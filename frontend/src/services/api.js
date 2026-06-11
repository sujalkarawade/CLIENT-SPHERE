/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axios from 'axios';

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
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authService = {
  register: async (payload) => {
    const res = await api.post('/auth/register', payload);
    return res.data;
  },
  login: async (payload) => {
    const res = await api.post('/auth/login', payload);
    return res.data;
  },
  getCurrentUser: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export const clientService = {
  getAll: async (params) => {
    const res = await api.get('/clients', { params });
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/clients', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put('/clients/' + id, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete('/clients/' + id);
    return res.data;
  },
};

export const leadService = {
  getAll: async (params) => {
    const res = await api.get('/leads', { params });
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/leads', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put('/leads/' + id, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete('/leads/' + id);
    return res.data;
  },
};

export const taskService = {
  getAll: async (params) => {
    const res = await api.get('/tasks', { params });
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/tasks', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put('/tasks/' + id, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete('/tasks/' + id);
    return res.data;
  },
};

export const pipelineService = {
  getAll: async () => {
    const res = await api.get('/pipelines');
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/pipelines', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put('/pipelines/' + id, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete('/pipelines/' + id);
    return res.data;
  },
};

export const dashboardService = {
  getStats: async () => {
    const res = await api.get('/dashboard/stats');
    return res.data;
  },
};

export const aiEmailService = {
  generate: async (data) => {
    const res = await api.post('/ai/generate', data);
    return res.data;
  },
  save: async (data) => {
    const res = await api.post('/ai/emails', data);
    return res.data;
  },
  getHistory: async () => {
    const res = await api.get('/ai/emails');
    return res.data;
  },
};

export const assistantService = {
  chat: async (message) => {
    const res = await api.post('/assistant/chat', { message });
    return res.data;
  },
  getHistory: async () => {
    const res = await api.get('/assistant/history');
    return res.data;
  },
  clearHistory: async () => {
    const res = await api.delete('/assistant/history');
    return res.data;
  },
};

export default api;
