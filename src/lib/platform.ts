import { Capacitor } from '@capacitor/core';

type CapacitorWindow = Window & {
  Capacitor?: unknown;
};

export function isCapacitorNative(): boolean {
  if (typeof window === 'undefined') return false;
  return Capacitor.isNativePlatform();
}

export function isCapacitorWebView(): boolean {
  if (typeof window === 'undefined') return false;
  return typeof (window as CapacitorWindow).Capacitor !== 'undefined';
}

