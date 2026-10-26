'use client';

import type { ChatWindowProps } from '@/features/chat/types/chat-window';
import { AssistantMark } from '@/features/chat/components/assistant-mark';
import { ChatEmptyState } from '@/features/chat/components/ChatEmptyState';
import { ChatInput } from '@/features/chat/components/ChatInput';
import { ChatMessage } from '@/features/chat/components/ChatMessage';
import { SessionSidebar } from '@/features/chat/components/SessionSidebar';
import { useChat } from '@/features/chat/hooks/useChat';
import { useMeasurements } from '@/features/measurements/hooks/useMeasurements';
import { useUserProfile } from '@/features/profile/hooks/use-profile';
import {
  ArrowDown,
  Loader2,
  Menu,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Drawer } from 'vaul';

export function ChatWindow({
  initialSessionId,
  initialProductId,
  initialMessage,
  onSessionChange,
}: ChatWindowProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasAutoSentInitial, setHasAutoSentInitial] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { profile } = useUserProfile();
  const { measurements } = useMeasurements();

  const {
    sessions,
    currentSessionId,
    messages,
    isStreaming,
    isLoadingSession,
    isLoadingSessions,
    error,
    quota,
    activeProduct,
    setActiveProduct,
    sendMessage,
    stopStreaming,
    createSession,
    switchSession,
    deleteSession,
    renameSession,
    clearCurrentChat,
  } = useChat({
    initialSessionId,
    initialProductId,
    onSessionCreated: (newSess) => {
      if (onSessionChange) onSessionChange(newSess.id);
    },
  });

  // Notify parent when session changes
  const handleSelectSession = useCallback(
    (sessionId: string) => {
      switchSession(sessionId);
      if (onSessionChange) onSessionChange(sessionId);
    },
    [switchSession, onSessionChange]
  );

  const handleNewChat = useCallback(() => {
    createSession();
    if (onSessionChange) onSessionChange(null);
  }, [createSession, onSessionChange]);

  // Handle auto-sending initialMessage from deep-link (?message=...&productId=...)
  useEffect(() => {
    if (initialMessage && !hasAutoSentInitial && !isStreaming) {
      setHasAutoSentInitial(true);
      sendMessage(initialMessage, { productId: initialProductId || undefined });
    }
  }, [initialMessage, hasAutoSentInitial, isStreaming, sendMessage, initialProductId]);

  // Auto-scroll to bottom on new messages or streaming tokens if already at bottom
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end',
      });
    }
  }, []);

  useEffect(() => {
    // Màn hình trống (chưa có tin nhắn) giữ ở đầu để lời chào không bị cuộn mất.
    if (messages.length > 0 && (isAtBottom || isStreaming)) {
      scrollToBottom(!isStreaming);
    }
  }, [messages, isStreaming, isAtBottom, scrollToBottom]);

  // Scroll listener to detect if user has scrolled away from bottom
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    setIsAtBottom(distanceToBottom < 80);
  };

  // Find active session title
  const activeSession = sessions.find((s) => s.id === currentSessionId);
  const sessionTitle = activeSession?.title || 'Trợ lý thời trang StAle.';

  return (
    // Chiếm trọn chiều cao dưới header landing (72px + 1px viền).
    <div className="flex h-[calc(100dvh-73px)] w-full overflow-hidden bg-landing-paper text-landing-obsidian">

      {/* Desktop Sidebar (Left Panel) */}
      <div className="hidden h-full w-[280px] shrink-0 md:block lg:w-[320px]">
        <SessionSidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          onDeleteSession={deleteSession}
          onRenameSession={renameSession}
          quota={quota}
          isLoading={isLoadingSessions}
        />
      </div>

      {/* Mobile Sidebar Drawer */}
      <Drawer.Root
        open={isMobileSidebarOpen}
        onOpenChange={setIsMobileSidebarOpen}
        direction="left"
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-50 bg-landing-obsidian/45 md:hidden" />
          <Drawer.Content aria-label="Lịch sử trò chuyện" className="fixed bottom-0 left-0 z-50 flex h-full w-[300px] max-w-[86vw] flex-col bg-landing-ivory outline-none md:hidden">
            <Drawer.Title className="sr-only">Lịch sử trò chuyện</Drawer.Title>
            <SessionSidebar
              sessions={sessions}
              currentSessionId={currentSessionId}
              onSelectSession={handleSelectSession}
              onNewChat={handleNewChat}
              onDeleteSession={deleteSession}
              onRenameSession={renameSession}
              quota={quota}
              onClose={() => setIsMobileSidebarOpen(false)}
              isLoading={isLoadingSessions}
            />
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Main Chat Conversation Area (Right Panel) */}
      <div className="relative flex h-full min-w-0 flex-1 flex-col">

        {/* Top Chat Header */}
        <header className="z-10 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-landing-line/70 bg-landing-paper/95 px-4 backdrop-blur-md md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {/* Mobile Drawer Trigger */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Mở lịch sử trò chuyện"
              className="-ml-2 flex h-10 w-10 items-center justify-center rounded-[2px] text-landing-obsidian transition-colors hover:text-landing-oxblood md:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood"
            >
              <Menu className="h-5 w-5" strokeWidth={1.75} />
            </button>

            <AssistantMark />

            <div className="flex min-w-0 flex-col">
              <h1 className="truncate text-[15px] font-semibold leading-tight text-landing-obsidian">
                {sessionTitle}
              </h1>
              <div className="mt-0.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-landing-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-landing-sage-ink" aria-hidden="true" />
                <span>StAle. AI Assistant</span>
                {activeProduct && (
                  <span className="hidden max-w-[180px] truncate normal-case tracking-normal text-landing-oxblood sm:inline-block">
                    · {activeProduct.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={clearCurrentChat}
                title="Làm mới cuộc trò chuyện"
                aria-label="Làm mới cuộc trò chuyện"
                className="flex h-10 w-10 items-center justify-center rounded-[2px] text-landing-muted transition-colors hover:text-landing-oxblood focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood"
              >
                <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
              </button>
            )}

            {currentSessionId && (
              <button
                type="button"
                onClick={() => deleteSession(currentSessionId)}
                title="Xóa đoạn chat này"
                aria-label="Xóa đoạn chat này"
                className="flex h-10 w-10 items-center justify-center rounded-[2px] text-landing-muted transition-colors hover:text-destructive focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.75} />
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Messages Stream */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="no-scrollbar flex-1 space-y-6 overflow-y-auto px-4 py-6 md:px-8 md:py-8"
        >
          {isLoadingSession ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-landing-muted" role="status">
              <Loader2 className="h-6 w-6 animate-spin text-landing-oxblood" strokeWidth={1.75} />
              <span className="text-sm">Đang tải cuộc trò chuyện…</span>
            </div>
          ) : messages.length === 0 ? (
            <ChatEmptyState
              onSelectPrompt={(text) => sendMessage(text, { productId: activeProduct?.id })}
              userMeasurements={measurements}
              userName={profile?.name}
            />
          ) : (
            messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onRetry={(failedMsg) => {
                  sendMessage(failedMsg.content, {
                    sessionId: failedMsg.sessionId,
                    productId: failedMsg.productId,
                  });
                }}
              />
            ))
          )}

          <div ref={messagesEndRef} className="h-2" />
        </div>

        {/* Floating Scroll To Bottom Button */}
        {!isAtBottom && messages.length > 0 && (
          <button
            type="button"
            onClick={() => scrollToBottom(true)}
            aria-label="Cuộn xuống tin nhắn mới nhất"
            className="absolute bottom-28 right-6 z-20 flex h-10 w-10 items-center justify-center rounded-[2px] border border-landing-line bg-landing-ivory text-landing-obsidian transition-colors animate-in fade-in-0 hover:border-landing-oxblood hover:text-landing-oxblood focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood"
          >
            <ArrowDown className="h-4 w-4" strokeWidth={1.75} />
          </button>
        )}

        {/* Input Area */}
        <div className="mx-auto w-full max-w-4xl shrink-0 px-3 pb-3 pt-2 md:px-6 md:pb-5">
          <ChatInput
            onSend={(text) => sendMessage(text, { productId: activeProduct?.id })}
            isStreaming={isStreaming}
            onStop={stopStreaming}
            attachedProduct={activeProduct}
            onRemoveProduct={() => setActiveProduct(null)}
            placeholder="Hỏi về chọn size, phối đồ, kiểu dáng..."
          />
        </div>
      </div>
    </div>
  );
}
