'use client';

import { useState, useEffect, useCallback } from 'react';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Nếu người dùng đã đóng hoặc hết 5s trong phiên làm việc này thì không hiện lại
    if (typeof window !== 'undefined' && sessionStorage.getItem('pwa_prompt_dismissed') === 'true') {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Check if app is already installed / running as standalone PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      setIsInstallable(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pwa_prompt_dismissed', 'true');
    }
    setIsInstallable(false);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      dismiss();
    }
    setDeferredPrompt(null);
  };

  return { isInstallable, install, dismiss };
}
