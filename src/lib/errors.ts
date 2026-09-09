export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function getErrorData(error: unknown): Record<string, unknown> {
  if (!isRecord(error) || !isRecord(error.response)) return {};
  return isRecord(error.response.data) ? error.response.data : {};
}

export function getErrorStatus(error: unknown): number | undefined {
  if (!isRecord(error) || !isRecord(error.response)) return undefined;
  return typeof error.response.status === 'number' ? error.response.status : undefined;
}

export function getErrorMessage(error: unknown, fallback: string): string {
  const data = getErrorData(error);
  for (const value of [data.message, data.error, isRecord(error) ? error.message : undefined]) {
    if (typeof value === 'string' && value) return value;
    if (Array.isArray(value)) {
      const message = value.find((item): item is string => typeof item === 'string' && item.length > 0);
      if (message) return message;
    }
  }
  return fallback;
}
