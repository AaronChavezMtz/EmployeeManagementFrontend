import client from './client';

export const dashboardApi = {
  getKpis: () => client.get('/dashboard/kpis').then((r) => r.data),
};
