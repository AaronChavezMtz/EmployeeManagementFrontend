import client from './client';

export const demoApi = {
  status: () => client.get('/demo').then((r) => r.data),
  reset: () => client.post('/demo/reset'),
};
