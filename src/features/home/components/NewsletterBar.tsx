'use client';

import { LandingSectionHeading } from '@/features/home/components/LandingSectionHeading';
import { ArrowRight } from 'lucide-react';
import React, { useId, useState } from 'react';

type SubmitState = 'idle' | 'error' | 'success';

export function NewsletterBar() {
  const emailId = useId();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<SubmitState>('idle');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = email.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus('error');
      return;
    }

    setStatus('success');
    setEmail('');
  };

  return (
    <section id="newsletter" className="scroll-mt-24 bg-landing-paper py-16 md:py-24">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-16">
          <div className="lg:col-span-6">
            <LandingSectionHeading
              chapter="07"
              eyebrow="Newsletter"
              title={<>The <em className="font-normal italic text-landing-oxblood">Quiet</em> Issue.</>}
              description="Mỗi tháng một lần: bộ sưu tập mới, lookbook và ghi chú từ studio. Không thêm noise vào hộp thư của bạn."
            />
          </div>

          <div className="lg:col-span-6">
            <form
              onSubmit={handleSubmit}
              className="border border-landing-line/70 bg-landing-ivory p-5 md:p-8"
              noValidate
            >
              <label htmlFor={emailId} className="text-[10px] font-semibold uppercase tracking-[0.18em] text-landing-brass-ink">
                Email của bạn
              </label>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <input
                  id={emailId}
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (status !== 'idle') setStatus('idle');
                  }}
                  placeholder="ban@congty.vn"
                  autoComplete="email"
                  aria-invalid={status === 'error'}
                  aria-describedby={`${emailId}-status`}
                  className="h-12 min-w-0 flex-1 border-b border-landing-obsidian/25 bg-transparent px-0 text-sm text-landing-obsidian placeholder:text-landing-muted/60 focus:border-landing-oxblood focus:outline-none"
                />
                <button
                  type="submit"
                  className="group inline-flex h-12 items-center justify-center gap-2 bg-landing-oxblood px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-landing-paper transition-colors hover:bg-landing-obsidian"
                >
                  Đăng ký
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>

              <div id={`${emailId}-status`} aria-live="polite" className="mt-3 min-h-5">
                {status === 'error' ? (
                  <p className="text-xs text-destructive">
                    Vui lòng nhập một địa chỉ email hợp lệ.
                  </p>
                ) : null}
                {status === 'success' ? (
                  <p className="text-xs text-landing-sage-ink">
                    Cảm ơn bạn. Bản tin đầu tiên sẽ đến sớm.
                  </p>
                ) : null}
              </div>

              <p className="mt-2 text-[10px] leading-relaxed text-landing-muted">
                Bằng cách đăng ký, bạn đồng ý nhận email từ StAle. Có thể hủy bất cứ lúc nào.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
