'use client';

import type { Gender } from '@/features/measurements/types/profile-measurements-page';

export function BodyDiagram({ values, gender }: { values: Record<string, string>; gender: Gender }) {
  const filledPoints = [
    { id: 'neck', label: 'Cổ', y: '13%' },
    { id: 'shoulder', label: 'Vai', y: '22%' },
    { id: 'chest', label: 'Ngực', y: '31%' },
    { id: 'waist', label: 'Eo', y: '45%' },
    { id: 'hip', label: 'Hông', y: '55%' },
    { id: 'thigh', label: 'Đùi', y: '63%' },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[180px]" style={{ height: 380 }}>
        <svg viewBox="0 0 200 420" className="w-full h-full" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="100" cy="50" rx="19" ry="21" fill="#EEF2FF" stroke="#A5B4FC" strokeWidth="2" />
          <path d="M91,70 L91,82 M109,70 L109,82" stroke="#A5B4FC" strokeWidth="2" />
          <path
            d="M91,82 C68,84 57,98 57,114 L62,196 L84,196 L79,228 L121,228 L116,196 L138,196 L143,114 C143,98 132,84 109,82 Z"
            fill="#EEF2FF" stroke="#A5B4FC" strokeWidth="2"
          />
          <path d="M57,114 L42,212 L54,212" stroke="#A5B4FC" strokeWidth="2" fill="none" />
          <path d="M143,114 L158,212 L146,212" stroke="#A5B4FC" strokeWidth="2" fill="none" />
          <path d="M79,228 L73,385 L96,385 L100,295 L104,385 L127,385 L121,228 Z" fill="#EEF2FF" stroke="#A5B4FC" strokeWidth="2" />
          <line x1="100" y1="84" x2="100" y2="225" stroke="#C7D2FE" strokeWidth="1" strokeDasharray="4 3" />
          <line x1="57" y1="190" x2="143" y2="190" stroke="#FCD34D" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
        </svg>

        {filledPoints.map(point => {
          const filled = !!values[point.id];
          return (
            <div
              key={point.id}
              className="absolute flex items-center gap-1.5 left-0 right-0"
              style={{ top: point.y, justifyContent: 'flex-end', paddingRight: '12px' }}
            >
              <span className={`text-[10px] font-medium ${filled ? 'text-brand-navy' : 'text-neutral-400'}`}>
                {point.label}
              </span>
              <div className={`w-2.5 h-2.5 rounded-full border-2 border-white shadow transition-colors ${filled ? 'bg-brand-navy' : 'bg-neutral-300'
                }`} />
            </div>
          );
        })}
      </div>

      <div className="w-full mt-4 px-2">
        {(() => {
          const keyFields = ['height', 'weight', 'shoulder', 'chest', 'waist', 'hip', 'inseam'];
          const filled = keyFields.filter(k => !!values[k]).length;
          const pct = Math.round((filled / keyFields.length) * 100);
          return (
            <>
              <div className="flex justify-between mb-1.5">
                <span className="text-label-sm text-neutral-500">Độ hoàn thiện</span>
                <span className="text-label-sm font-semibold text-brand-navy">{pct}%</span>
              </div>
              <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-navy rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-label-sm text-neutral-400 mt-2 text-center">
                {filled}/{keyFields.length} số đo cơ bản
              </p>
            </>
          );
        })()}
      </div>
    </div>
  );
}
