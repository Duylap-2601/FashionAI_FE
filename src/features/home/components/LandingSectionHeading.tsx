import { cn } from '@/components/ui/utils';
import React from 'react';

interface LandingSectionHeadingProps {
  chapter: string;
  eyebrow: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  inverted?: boolean;
  className?: string;
}

export function LandingSectionHeading({
  chapter,
  eyebrow,
  title,
  description,
  action,
  inverted = false,
  className,
}: LandingSectionHeadingProps) {
  return (
    <div
      className={cn(
        'border-t pt-5',
        inverted ? 'border-landing-paper/15' : 'border-landing-line',
        className,
      )}
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex items-start gap-3 sm:gap-4">
          <span
            className={cn(
              'shrink-0 pt-1 font-mono text-lg tracking-[0.2em]',
              inverted ? 'text-landing-brass' : 'text-landing-brass-ink',
            )}
          >
            {chapter}
          </span>
          <div className="min-w-0">
            <p
              className={cn(
                'text-2xl font-semibold uppercase tracking-[0.22em]',
                inverted ? 'text-landing-brass' : 'text-landing-brass-ink',
              )}
            >
              {eyebrow}
            </p>
            {title && <h2
              className={cn(
                'mt-3 font-display text-landing-h2',
                inverted ? 'text-landing-paper' : 'text-landing-obsidian',
              )}
            >
              {title}
            </h2>}
            {description ? (
              <p
                className={cn(
                  'mt-4 max-w-xl text-landing-body',
                  inverted ? 'text-landing-paper/65' : 'text-landing-muted',
                )}
              >
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {action ? <div className="shrink-0 md:pb-1">{action}</div> : null}
      </div>
    </div>
  );
}
