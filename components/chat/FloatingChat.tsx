import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, RotateCcw, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  role: 'bot' | 'user';
  text: string;
  time: string;
}

const QUICK_REPLIES = [
  'Cách thử đồ ảo?',
  'Làm sao chọn đúng size?',
  'Chính sách đổi trả?',
  'Nâng cấp tài khoản',
];

const BOT_RESPONSES: Record<string, string> = {
  'Cách thử đồ ảo?':
    'Để thử đồ ảo, bạn cần đăng nhập → chọn sản phẩm → nhấn nút "Try-On" → tải ảnh toàn thân lên → AI sẽ ghép trang phục vào ảnh của bạn trong ~20 giây! 🎉',
  'Làm sao chọn đúng size?':
    'Bạn vào mục **Hồ sơ → Số đo cơ thể**, nhập đầy đủ số đo (vai, ngực, eo, hông...). AI sẽ tự động gợi ý size phù hợp cho từng sản phẩm dựa trên số đo của bạn.',
  'Chính sách đổi trả?':
    'StAle. hỗ trợ đổi trả trong **7 ngày** kể từ ngày nhận hàng. Sản phẩm cần còn nguyên tag, chưa qua sử dụng. Liên hệ hotline **1900 xxxx** để được hỗ trợ.',
  'Nâng cấp tài khoản':
    'Gói **Member** có giá 99.000 ₫/tháng — bao gồm 10 lượt Try-On/ngày, ưu tiên xử lý và lịch sử không giới hạn. Gói **VIP** 199.000 ₫/tháng thêm AI Stylist cá nhân hoá. Bạn muốn biết thêm gói nào?',
};

function getTime() {
  return new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'welcome',
    role: 'bot',
    text: 'Xin chào! Tôi là **StAle. Assistant** 👋\nTôi có thể giúp bạn về thử đồ ảo, chọn size, đơn hàng và nhiều hơn nữa. Bạn cần hỗ trợ gì?',
    time: getTime(),
  },
];

function BotMessage({ msg }: { msg: Message }) {
  const formatted = msg.text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');

  return (
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 rounded-full bg-brand-navy flex items-center justify-center shrink-0 mb-0.5">
        <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
      </div>
      <div className="flex flex-col gap-1 max-w-[78%]">
        <div
          className="px-3.5 py-2.5 bg-white border border-neutral-200 rounded-2xl rounded-bl-sm text-body-sm text-neutral-800 shadow-sm"
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
        <span className="text-[10px] text-neutral-400 ml-1">{msg.time}</span>
      </div>
    </div>
  );
}

function UserMessage({ msg }: { msg: Message }) {
  return (
    <div className="flex items-end gap-2 justify-end">
      <div className="flex flex-col gap-1 items-end max-w-[78%]">
        <div className="px-3.5 py-2.5 bg-brand-navy text-white rounded-2xl rounded-br-sm text-body-sm shadow-sm">
          {msg.text}
        </div>
        <span className="text-[10px] text-neutral-400 mr-1">{msg.time}</span>
      </div>
    </div>
  );
}

export function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: text.trim(), time: getTime() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const reply =
        BOT_RESPONSES[text.trim()] ||
        'Cảm ơn bạn đã nhắn tin! Đội ngũ hỗ trợ của StAle. sẽ phản hồi trong thời gian sớm nhất. Bạn cũng có thể thử lại câu hỏi khác nhé.';
      setTyping(false);
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'bot', text: reply, time: getTime() },
      ]);
    }, 1200);
  };

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
    setTyping(false);
    setInput('');
  };

  return (
    <div className="fixed bottom-[88px] md:bottom-6 right-4 md:right-6 z-[60] flex flex-col items-end gap-3">

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-[calc(100vw-32px)] sm:w-[380px] bg-white rounded-2xl shadow-xl border border-neutral-200 flex flex-col overflow-hidden"
            style={{ height: 'min(520px, calc(100dvh - 180px))' }}
          >
            {/* Header */}
            <div className="bg-brand-navy px-4 py-3.5 flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                <Sparkles className="w-4.5 h-4.5 text-brand-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-body-sm">StAle. Assistant</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-white/60 text-label-sm">Trực tuyến · Phản hồi ngay</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleReset}
                  title="Bắt đầu lại"
                  className="w-8 h-8 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 bg-neutral-50">
              {messages.map(msg =>
                msg.role === 'bot'
                  ? <BotMessage key={msg.id} msg={msg} />
                  : <UserMessage key={msg.id} msg={msg} />
              )}

              {/* Typing indicator */}
              {typing && (
                <div className="flex items-end gap-2">
                  <div className="w-7 h-7 rounded-full bg-brand-navy flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
                  </div>
                  <div className="px-3.5 py-3 bg-white border border-neutral-200 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1">
                    {[0, 1, 2].map(i => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies */}
            {messages.length <= 2 && !typing && (
              <div className="px-4 py-2 flex gap-2 flex-wrap border-t border-neutral-100 bg-white shrink-0">
                {QUICK_REPLIES.map(q => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="px-3 py-1.5 rounded-full border border-brand-navy/20 text-label-sm text-brand-navy font-medium hover:bg-brand-navy hover:text-white transition-colors whitespace-nowrap"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-3 py-3 border-t border-neutral-100 bg-white shrink-0 flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                placeholder="Nhắn tin..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/15 focus:outline-none text-body-sm bg-neutral-50 transition-colors"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
                className="w-9 h-9 rounded-xl bg-brand-navy flex items-center justify-center shrink-0 hover:bg-brand-navy/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-brand-navy rounded-full shadow-lg flex items-center justify-center relative hover:bg-brand-navy/90 transition-colors"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-5 h-5 text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle className="w-5 h-5 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread badge */}
        {unread > 0 && !open && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-brand-gold rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white"
          >
            {unread}
          </motion.span>
        )}
      </motion.button>
    </div>
  );
}
