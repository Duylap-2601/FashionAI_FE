'use client';

import React from 'react';
import { WifiOff, RotateCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-6 text-center font-sans text-neutral-800">
      <div className="w-20 h-20 bg-brand-navy/5 rounded-2xl flex items-center justify-center mb-6 text-brand-navy border border-brand-navy/10 animate-pulse">
        <WifiOff className="w-10 h-10" />
      </div>

      <h1 className="text-heading-h2 font-bold text-brand-navy mb-3">Mất kết nối Internet</h1>
      <p className="text-body-md text-neutral-500 mb-8 max-w-sm">
        Ứng dụng FashionAI cần kết nối mạng để xử lý dữ liệu hoặc chạy tính năng thử đồ ảo AI.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          onClick={handleReload}
          className="flex-1 h-12 bg-brand-navy hover:bg-brand-navy/90 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer border-0 shadow-sm"
        >
          <RotateCw className="w-4 h-4" /> Thử lại
        </button>
        
        <Link
          href="/"
          className="flex-1 h-12 bg-white hover:bg-neutral-50 text-neutral-700 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors border border-neutral-200 shadow-sm"
        >
          <Home className="w-4 h-4 text-brand-navy" /> Trang chủ
        </Link>
      </div>

      <p className="text-label-sm text-neutral-400 mt-12">
        Các dữ liệu giỏ hàng và số đo đã lưu cục bộ sẽ tự động đồng bộ khi trực tuyến trở lại.
      </p>
    </div>
  );
}
