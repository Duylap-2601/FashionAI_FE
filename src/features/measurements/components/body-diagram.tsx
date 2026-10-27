'use client';

import type { FigureVariant } from '@/features/measurements/types/profile-measurements-page';
import { cn } from '@/lib/utils';

const POINTS = [
  { id: 'neck', label: 'Cổ', y: '13%' },
  { id: 'shoulder', label: 'Vai', y: '22%' },
  { id: 'chest', label: 'Ngực', y: '31%' },
  { id: 'waist', label: 'Eo', y: '45%' },
  { id: 'hip', label: 'Hông', y: '55%' },
  { id: 'thigh', label: 'Đùi', y: '63%' },
];

const FEMALE_PATH =
  'M83 86 C70 91 62 103 58 121 C53 145 48 181 42 219 C41 226 47 231 54 229 L66 225 C72 190 76 156 80 128 C82 116 86 109 94 107 L100 108 L106 107 C114 109 118 116 120 128 C124 156 128 190 134 225 L146 229 C153 231 159 226 158 219 C152 181 147 145 142 121 C138 103 130 91 117 86 C113 101 111 115 115 130 C119 145 126 166 127 190 C128 211 117 229 113 247 C110 261 113 280 119 305 L130 379 C131 386 126 392 119 392 L107 392 C102 348 99 310 100 277 C101 310 98 348 93 392 L81 392 C74 392 69 386 70 379 L81 305 C87 280 90 261 87 247 C83 229 72 211 73 190 C74 166 81 145 85 130 C89 115 87 101 83 86 Z';

const MALE_PATH =
  'M82 86 C68 91 58 104 55 123 C51 151 47 181 40 219 C39 226 45 232 52 230 L64 227 C70 194 73 160 78 129 C80 116 85 109 94 107 L100 108 L106 107 C115 109 120 116 122 129 C127 160 130 194 136 227 L148 230 C155 232 161 226 160 219 C153 181 149 151 145 123 C142 104 132 91 118 86 C113 103 111 123 115 144 L121 204 C123 223 118 237 114 252 C111 266 114 290 120 320 L129 379 C130 386 125 392 118 392 L106 392 L100 285 L94 392 L82 392 C75 392 70 386 71 379 L80 320 C86 290 89 266 86 252 C82 237 77 223 79 204 L85 144 C89 123 87 103 82 86 Z';

/** Hình minh họa vị trí đo; chấm đổi màu khi trường tương ứng đã có giá trị. */
export function BodyDiagram({ values, figure }: { values: Record<string, string>; figure: FigureVariant }) {
  return (
    <div className="relative mx-auto aspect-[200/420] w-full max-w-[168px]">
      <svg viewBox="0 0 200 420" className="h-full w-full" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path
          d="M100 20 C114 20 124 31 124 47 C124 65 114 78 100 78 C86 78 76 65 76 47 C76 31 86 20 100 20 Z"
          className="fill-landing-ivory stroke-landing-brass"
          strokeWidth="1.5"
        />
        <path d="M90 77 C92 86 108 86 110 77" className="stroke-landing-brass" strokeWidth="1.5" />
        <path d={figure === 'female' ? FEMALE_PATH : MALE_PATH} className="fill-landing-ivory stroke-landing-brass" strokeWidth="1.5" />
        <path d="M100 88 L100 252" className="stroke-landing-taupe" strokeWidth="1" strokeDasharray="4 4" />
        <path d="M69 189 C88 194 112 194 131 189" className="stroke-landing-oxblood/50" strokeWidth="1.2" strokeDasharray="4 4" />
        <path d="M77 128 C91 133 109 133 123 128" className="stroke-landing-taupe" strokeWidth="1" strokeDasharray="3 4" />
        <path d="M79 247 C92 252 108 252 121 247" className="stroke-landing-taupe" strokeWidth="1" strokeDasharray="3 4" />
      </svg>

      {POINTS.map((point) => {
        const filled = Boolean(values[point.id]);
        return (
          <div key={point.id} className="absolute inset-x-0 flex items-center justify-end gap-1.5 pr-2" style={{ top: point.y }}>
            <span className={cn('text-[10px] font-medium', filled ? 'text-landing-oxblood' : 'text-landing-muted')}>{point.label}</span>
            <span
              aria-hidden="true"
              className={cn('h-2 w-2 rounded-full ring-2 ring-landing-paper transition-colors', filled ? 'bg-landing-oxblood' : 'bg-landing-taupe')}
            />
          </div>
        );
      })}
    </div>
  );
}
