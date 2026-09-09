import type { UserMeasurements } from '@/features/measurements/types/measurements';
import { api } from '@/lib/api';

export async function updateMeasurements(measurements: UserMeasurements) {
  const res = await api.put('/users/me/measurements', measurements);
  return res.data;
}

export { mutationKeys } from './mutation-keys';
