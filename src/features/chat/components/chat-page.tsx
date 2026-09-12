'use client';

import { useAuthStore } from '@/features/auth/store/authStore';
import { ChatWindow } from '@/features/chat/components/ChatWindow';
import { isUuid } from '@/features/chat/services/chat-utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = useAuthStore((state) => state.status);

  const rawSessionId = searchParams.get('session');
  const sessionId = isUuid(rawSessionId) ? rawSessionId : undefined;
  const productId = searchParams.get('productId') || undefined;
  const message = searchParams.get('message') || undefined;

  const handleSessionChange = (newSessionId: string | null) => {
    if (newSessionId) {
      router.replace(`/chat?session=${newSessionId}`, { scroll: false });
    } else {
      router.replace('/chat', { scroll: false });
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-brand-cream">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-brand-navy border-t-transparent rounded-full animate-spin" />
          <span className="text-body-sm font-semibold text-neutral-700">Đang khởi tạo trợ lý AI...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <ChatWindow
        initialSessionId={sessionId}
        initialProductId={productId}
        initialMessage={message}
        onSessionChange={handleSessionChange}
      />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-brand-cream">
          <div className="w-8 h-8 border-3 border-brand-navy border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
