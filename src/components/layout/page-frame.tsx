import type React from 'react';

export function PageHeader({
  title,
  subtitle,
  cta,
  breadcrumbs
}: {
  title: string;
  subtitle?: React.ReactNode;
  cta?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
}) {
  return (
    <div className="bg-white border-b border-neutral-200 w-full">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-12">
        {breadcrumbs && <div className="mb-4">{breadcrumbs}</div>}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-heading-h2 font-semibold text-brand-navy">{title}</h1>
            {subtitle && <p className="text-body-md text-neutral-600 mt-2">{subtitle}</p>}
          </div>
          {cta && <div>{cta}</div>}
        </div>
      </div>
    </div>
  );
}

export function PageContent({ children }: { children: React.ReactNode }) {
  return (
    <main className="w-full max-w-[1200px] mx-auto p-4 md:p-8">
      {children}
    </main>
  );
}
