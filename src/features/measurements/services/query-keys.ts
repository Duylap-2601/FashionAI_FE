// Preserve existing cache prefixes and parameter order, including partial invalidation.
export const queryKeys = {
  measurementsCompleteness: <T extends readonly unknown[]>(...params: T) => ['measurements-completeness', ...params] as const,
  measurements: <T extends readonly unknown[]>(...params: T) => ['measurements', ...params] as const,
};
