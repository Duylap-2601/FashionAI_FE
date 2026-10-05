'use client';

import type { Gender } from '@/features/measurements/types/profile-measurements-page';

export function BodyDiagram({ values, gender }: { values: Record<string, string>; gender: Gender }) {
  const isFemale = gender === 'female';
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
          <defs>
            <linearGradient id="bodyDiagramSkin" x1="55" y1="18" x2="146" y2="390" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F8FAFF" />
              <stop offset="1" stopColor="#E8EDFF" />
            </linearGradient>
            <filter id="bodyDiagramShadow" x="18" y="10" width="164" height="395" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#64748B" floodOpacity="0.10" />
            </filter>
          </defs>

          <g filter="url(#bodyDiagramShadow)">
            <path
              d="M100 20 C114 20 124 31 124 47 C124 65 114 78 100 78 C86 78 76 65 76 47 C76 31 86 20 100 20 Z"
              fill="url(#bodyDiagramSkin)"
              stroke="#8EA2FF"
              strokeWidth="2"
            />
            <path d="M90 77 C92 86 108 86 110 77" stroke="#8EA2FF" strokeWidth="2" />

            {isFemale ? (
              <path
                d="M83 86 C70 91 62 103 58 121 C53 145 48 181 42 219 C41 226 47 231 54 229 L66 225 C72 190 76 156 80 128 C82 116 86 109 94 107 L100 108 L106 107 C114 109 118 116 120 128 C124 156 128 190 134 225 L146 229 C153 231 159 226 158 219 C152 181 147 145 142 121 C138 103 130 91 117 86 C113 101 111 115 115 130 C119 145 126 166 127 190 C128 211 117 229 113 247 C110 261 113 280 119 305 L130 379 C131 386 126 392 119 392 L107 392 C102 348 99 310 100 277 C101 310 98 348 93 392 L81 392 C74 392 69 386 70 379 L81 305 C87 280 90 261 87 247 C83 229 72 211 73 190 C74 166 81 145 85 130 C89 115 87 101 83 86 Z"
                fill="url(#bodyDiagramSkin)"
                stroke="#8EA2FF"
                strokeWidth="2"
              />
            ) : (
              <path
                d="M82 86 C68 91 58 104 55 123 C51 151 47 181 40 219 C39 226 45 232 52 230 L64 227 C70 194 73 160 78 129 C80 116 85 109 94 107 L100 108 L106 107 C115 109 120 116 122 129 C127 160 130 194 136 227 L148 230 C155 232 161 226 160 219 C153 181 149 151 145 123 C142 104 132 91 118 86 C113 103 111 123 115 144 L121 204 C123 223 118 237 114 252 C111 266 114 290 120 320 L129 379 C130 386 125 392 118 392 L106 392 L100 285 L94 392 L82 392 C75 392 70 386 71 379 L80 320 C86 290 89 266 86 252 C82 237 77 223 79 204 L85 144 C89 123 87 103 82 86 Z"
                fill="url(#bodyDiagramSkin)"
                stroke="#8EA2FF"
                strokeWidth="2"
              />
            )}
          </g>

          <path d="M100 88 L100 252" stroke="#CBD5FF" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.85" />
          <path d="M69 189 C88 194 112 194 131 189" stroke="#FCD34D" strokeWidth="1.7" strokeDasharray="4 4" opacity="0.72" />
          <path d="M77 128 C91 133 109 133 123 128" stroke="#CBD5FF" strokeWidth="1.1" strokeDasharray="3 4" opacity="0.65" />
          <path d="M79 247 C92 252 108 252 121 247" stroke="#CBD5FF" strokeWidth="1.1" strokeDasharray="3 4" opacity="0.65" />
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
