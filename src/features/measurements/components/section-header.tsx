'use client';

export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5 flex items-baseline gap-4">
      <h3 className="shrink-0 font-display text-xl leading-tight text-landing-obsidian">{title}</h3>
      {subtitle ? <p className="hidden shrink-0 text-xs text-landing-muted sm:block">{subtitle}</p> : null}
      <span aria-hidden="true" className="h-px flex-1 self-center bg-landing-line" />
    </div>
  );
}
