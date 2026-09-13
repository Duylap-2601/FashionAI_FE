import type { MeasurementsCompletenessResponse } from '@/features/measurements/types/measurements-completeness';
import type { UserMeasurements } from '@/features/measurements/types/measurements';
import { http } from '@/lib/http';

export async function fetchMeasurements(): Promise<UserMeasurements> {
  return (await http.get<UserMeasurements>('/users/me/measurements')) || {};
}

export async function fetchMeasurementsCompleteness(): Promise<MeasurementsCompletenessResponse> {
  return http.get<MeasurementsCompletenessResponse>('/users/me/measurements/completeness');
}

export { queryKeys } from './query-keys';
