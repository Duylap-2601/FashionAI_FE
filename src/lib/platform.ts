type CapacitorWindow = Window & {
  Capacitor?: { isNativePlatform?: () => boolean };
};

export function isCapacitorNative(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window as CapacitorWindow).Capacitor?.isNativePlatform?.();
}

export function isCapacitorWebView(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window as CapacitorWindow).Capacitor;
}
