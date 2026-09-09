import { api } from '@/lib/api';

export async function fetchMeasurements() {
  const res = await api.get('/users/me/measurements');
  return res.data || {};
}

export async function fetchMeasurementsCompleteness() {
  const res = await api.get('/users/me/measurements/completeness');
  return res.data;
}

export { queryKeys } from './query-keys';
