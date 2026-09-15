'use client';

import { LogOut } from 'lucide-react';
import React, { useEffect } from 'react';

interface AppExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExit: () => void;
}

export function AppExitModal({ isOpen, onClose, onExit }: AppExitModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-modal-title"
      aria-describedby="exit-modal-desc"
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-neutral-100 text-center animate-in zoom-in-95 duration-200 relative">
        <div className="w-14 h-14 rounded-2xl bg-neutral-100 text-brand-navy flex items-center justify-center mx-auto mb-4">
          <LogOut className="w-7 h-7 text-neutral-800" />
        </div>

        <h3 id="exit-modal-title" className="text-xl font-bold text-brand-navy">
          Thoát ứng dụng?
        </h3>
        <p id="exit-modal-desc" className="text-sm text-neutral-500 mt-2 mb-6 leading-relaxed">
          Bạn có chắc chắn muốn đóng ứng dụng FashionAI không?
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-neutral-200 text-neutral-700 font-medium text-sm hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
          >
            Ở lại
          </button>
          <button
            type="button"
            onClick={onExit}
            className="flex-1 px-4 py-3 rounded-xl bg-brand-navy text-white font-medium text-sm hover:bg-brand-navy/90 active:bg-brand-navy/95 transition-colors shadow-xs"
          >
            Thoát
          </button>
        </div>
      </div>
    </div>
  );
}
