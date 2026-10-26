import client from './client';

// Portal del empleado: la API resuelve el empleado a partir del token, no hay ids en la URL.
export const meApi = {
  getProfile: () => client.get('/me').then((r) => r.data),
  getHistory: () => client.get('/me/history').then((r) => r.data),
  updatePhone: (phone) => client.put('/me/phone', { phone }).then((r) => r.data),
  getVacationBalance: () => client.get('/me/vacation-balance').then((r) => r.data),
  getLeaveRequests: () => client.get('/me/leave-requests').then((r) => r.data),
  createLeaveRequest: (payload) => client.post('/me/leave-requests', payload).then((r) => r.data),
  cancelLeaveRequest: (id) => client.post(`/me/leave-requests/${id}/cancel`).then((r) => r.data),
};
