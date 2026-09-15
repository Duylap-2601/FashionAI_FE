'use client';

import { AppExitModal } from '@/components/native/AppExitModal';
import { useCartStore } from '@/features/cart/store/cartStore';
import { dispatchEscapeToDom, overlayManager } from '@/lib/overlay-manager';
import { isCapacitorNative } from '@/lib/platform';
import React, { useEffect, useRef, useState } from 'react';

export function NativeBackButtonHandler() {
  const [showExitModal, setShowExitModal] = useState(false);
  const showExitModalRef = useRef(showExitModal);

  useEffect(() => {
    showExitModalRef.current = showExitModal;
  }, [showExitModal]);

  useEffect(() => {
    // Only register hardware back button listener on native platforms (Android APK)
    if (!isCapacitorNative()) return;

    let cleanup: (() => void) | undefined;

    const setupListener = async () => {
      try {
        const { App } = await import('@capacitor/app');

        const listenerHandle = await App.addListener('backButton', ({ canGoBack }) => {
          // 0. If Exit Modal is currently showing, close it
          if (showExitModalRef.current) {
            setShowExitModal(false);
            return;
          }

          // 1. Tier 1: Check registered custom overlays
          if (overlayManager.dismissTop()) {
            return;
          }

          // Check Cart Slide-Over
          if (useCartStore.getState().isCartOpen) {
            useCartStore.getState().setIsCartOpen(false);
            return;
          }

          // Check DOM modals / dialogs (Radix UI, Vaul drawers)
          if (dispatchEscapeToDom()) {
            return;
          }

          // 2. Tier 2: Navigate back in history if available
          if (canGoBack) {
            window.history.back();
            return;
          }

          // 3. Tier 3: At root / no history -> Open exit confirmation modal
          setShowExitModal(true);
        });

        cleanup = () => {
          listenerHandle.remove();
        };
      } catch (err) {
        console.error('Failed to attach Capacitor backButton listener:', err);
      }
    };

    void setupListener();

    return () => {
      cleanup?.();
    };
  }, []);

  const handleExit = async () => {
    try {
      const { App } = await import('@capacitor/app');
      await App.exitApp();
    } catch (err) {
      console.error('Failed to call App.exitApp():', err);
    }
  };

  // If not on native platform, do not render modal
  if (!isCapacitorNative()) {
    return null;
  }

  return (
    <AppExitModal
      isOpen={showExitModal}
      onClose={() => setShowExitModal(false)}
      onExit={handleExit}
    />
  );
}
