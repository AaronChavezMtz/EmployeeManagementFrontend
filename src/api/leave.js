import client from './client';

// Bandeja de RH para revisar solicitudes de ausencia.
export const leaveApi = {
  getAll: (status) => client.get('/leave-requests', { params: { status: status || undefined } }).then((r) => r.data),
  approve: (id, comment) => client.post(`/leave-requests/${id}/approve`, { comment }).then((r) => r.data),
  reject: (id, comment) => client.post(`/leave-requests/${id}/reject`, { comment }).then((r) => r.data),
};
