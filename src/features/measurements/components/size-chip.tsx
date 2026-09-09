'use client';

export function SizeChip({
  label, selected, onClick
}: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`px-4 py-2 rounded-lg border text-label-md font-medium transition-all ${selected
          ? 'bg-brand-navy text-white border-brand-navy shadow-sm'
          : 'border-neutral-200 text-neutral-600 hover:border-brand-navy/40 bg-white'
        }`}
    >
      {label}
    </button>
  );
}
