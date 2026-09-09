import type { AuthInvalidatedEvent, AuthInvalidatedListener } from '@/features/auth/types/auth-events';

const listeners = new Set<AuthInvalidatedListener>();

export function subscribeAuthInvalidated(listener: AuthInvalidatedListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitAuthInvalidated(event: AuthInvalidatedEvent = {}) {
  listeners.forEach((listener) => listener(event));
}
