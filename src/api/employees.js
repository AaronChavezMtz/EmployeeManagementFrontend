import client from './client';

export const employeesApi = {
  getAll: (params) => client.get('/employees', { params }).then((r) => r.data),
  getById: (id) => client.get(`/employees/${id}`).then((r) => r.data),
  create: (payload) => client.post('/employees', payload).then((r) => r.data),
  update: (id, payload) => client.put(`/employees/${id}`, payload).then((r) => r.data),
  terminate: (id, payload) => client.post(`/employees/${id}/terminate`, payload).then((r) => r.data),
  rehire: (id, payload) => client.post(`/employees/${id}/rehire`, payload).then((r) => r.data),
  getHistory: (id) => client.get(`/employees/${id}/history`).then((r) => r.data),
};
