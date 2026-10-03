import client from './client';

export const departmentsApi = {
  getAll: () => client.get('/departments').then((r) => r.data),
  getById: (id) => client.get(`/departments/${id}`).then((r) => r.data),
  create: (payload) => client.post('/departments', payload).then((r) => r.data),
  update: (id, payload) => client.put(`/departments/${id}`, payload).then((r) => r.data),
  remove: (id) => client.delete(`/departments/${id}`),
  summary: () => client.get('/departments/summary').then((r) => r.data),
};
