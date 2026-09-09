'use client';

export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="flex-1">
        <h3 className="text-body-lg font-semibold text-neutral-900">{title}</h3>
        {subtitle && <p className="text-body-sm text-neutral-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="h-px flex-1 bg-neutral-100 self-center ml-4 mt-1" />
    </div>
  );
}
