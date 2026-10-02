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

  const detailList = Array.isArray(data.errors)
    ? data.errors
    : Array.isArray(data.details)
    ? data.details
    : isRecord(data.data) && Array.isArray((data.data as Record<string, unknown>).errors)
    ? ((data.data as Record<string, unknown>).errors as unknown[])
    : undefined;

  if (detailList && detailList.length > 0) {
    const formattedDetails = detailList
      .map((item) => {
        if (typeof item === 'string') return item;
        if (isRecord(item)) {
          if (typeof item.message === 'string') return item.message;
          if (typeof item.msg === 'string') return item.msg;
          if (typeof item.error === 'string') return item.error;
          if (typeof item.field === 'string' && typeof item.message === 'string') return `${item.field}: ${item.message}`;
        }
        return '';
      })
      .filter(Boolean)
      .join(', ');

    if (formattedDetails) {
      const baseMessage = typeof data.message === 'string' && data.message ? data.message : '';
      return baseMessage ? `${baseMessage}: ${formattedDetails}` : formattedDetails;
    }
  }

  for (const value of [data.message, data.error, isRecord(error) ? error.message : undefined]) {
    if (typeof value === 'string' && value) return value;
    if (Array.isArray(value)) {
      const message = value.find((item): item is string => typeof item === 'string' && item.length > 0);
      if (message) return message;
    }
  }
  return fallback;
}
