import client from './client';

export const usersApi = {
  getAll: () => client.get('/users').then((r) => r.data),
  update: (id, payload) => client.put(`/users/${id}`, payload).then((r) => r.data),
  register: (payload) => client.post('/auth/register', payload).then((r) => r.data),
};
