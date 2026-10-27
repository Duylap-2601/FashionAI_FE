'use client';

import { AtelierLoader } from '@/components/ui/AtelierLoader';
import { useAuthStore } from '@/features/auth/store/authStore';
import { ChatWindow } from '@/features/chat/components/ChatWindow';
import { isUuid } from '@/features/chat/services/chat-utils';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useState } from 'react';

function ChatContent() {
  const searchParams = useSearchParams();
  const status = useAuthStore((state) => state.status);

  const rawSessionId = searchParams.get('session');
  const sessionId = isUuid(rawSessionId) ? rawSessionId : undefined;
  const productId = searchParams.get('productId') || undefined;
  const message = searchParams.get('message') || undefined;
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>(sessionId || undefined);

  const handleSessionChange = useCallback((newSessionId: string | null) => {
    setSelectedSessionId(newSessionId || undefined);

    const nextUrl = newSessionId ? `/chat?session=${encodeURIComponent(newSessionId)}` : '/chat';
    if (window.location.pathname + window.location.search !== nextUrl) {
      window.history.replaceState(window.history.state, '', nextUrl);
    }
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex min-h-[calc(100dvh-73px)] items-center justify-center bg-landing-paper">
        <AtelierLoader size="md" label="Đang khởi tạo trợ lý AI" />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <ChatWindow
        initialSessionId={selectedSessionId}
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
        <div className="flex min-h-[calc(100dvh-73px)] items-center justify-center bg-landing-paper">
          <AtelierLoader size="md" label="Đang luồn chỉ" />
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
