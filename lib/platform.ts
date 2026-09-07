export function isCapacitorNative(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window as any).Capacitor?.isNativePlatform?.();
}

export function isCapacitorWebView(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window as any).Capacitor;
}
