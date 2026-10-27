import { Logo } from '@/components/ui/Logo';
import { cn } from '@/components/ui/utils';

type AtelierLoaderSize = 'sm' | 'md' | 'lg';

export interface AtelierLoaderProps {
  size?: AtelierLoaderSize;
  label?: string;
  showBrand?: boolean;
  className?: string;
}

const SIZE_CLASS: Record<AtelierLoaderSize, string> = {
  sm: 'atelier-loader--sm',
  md: 'atelier-loader--md',
  lg: 'atelier-loader--lg',
};

/**
 * Atelier loader: a hairline sewing machine laying a running stitch across a
 * swatch of fabric. Use for page-level and section-level loading states.
 */
export function AtelierLoader({
  size = 'md',
  label,
  showBrand = false,
  className,
}: AtelierLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('atelier-loader', SIZE_CLASS[size], className)}
    >
      {showBrand ? <Logo size="lg" className="atelier-loader__brand" /> : null}

      <svg
        className="atelier-loader__stage"
        viewBox="0 0 120 60"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <g className="atelier-loader__thread">
          <path d="M33 8C50 0 73 3 83 25" />
        </g>

        <g className="atelier-loader__spool">
          <circle cx="30" cy="10" r="5.5" />
          <path d="M30 6.5v7M26.5 10h7" />
        </g>

        <path className="atelier-loader__frame" d="M18 44V14h66v16" />
        <path className="atelier-loader__frame" d="M8 44h104" />
        <circle className="atelier-loader__wheel" cx="12" cy="33" r="4" />
        <path className="atelier-loader__frame" d="M12 33h6" />
        <path className="atelier-loader__foot" d="M79 38h9" />

        <rect
          className="atelier-loader__fabric"
          x="16"
          y="40"
          width="92"
          height="4"
          rx="1"
        />
        <path className="atelier-loader__seam" d="M20 42h64" />

        <g className="atelier-loader__needle">
          <path d="M84 30v13" />
          <path d="M81 33h6" />
        </g>
        <circle className="atelier-loader__eye" cx="84" cy="20" r="1.6" />
      </svg>

      {label ? (
        <p className="atelier-loader__label">{label}</p>
      ) : (
        <span className="sr-only">Đang tải</span>
      )}
    </div>
  );
}

export default AtelierLoader;
