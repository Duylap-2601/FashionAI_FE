import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { PageHeader } from '@/components/layout/page-frame';
import { PolicyBlock } from '@/features/policies/components/policy-block';
import { POLICY_CONTACT, POLICY_NAV_ITEMS } from '@/features/policies/constants/policy-nav';
import type { PolicyDocument, PolicySection, PolicySlug } from '@/features/policies/types/policy';
import { CalendarDays, Mail, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';

function PolicyNav({ activeSlug }: { activeSlug: PolicySlug }) {
  return (
    <nav aria-label="Chính sách và hướng dẫn">
      <p className="mb-3 text-label-sm font-bold uppercase tracking-[0.12em] text-neutral-500">Chính sách</p>
      <ul className="flex flex-col gap-1">
        {POLICY_NAV_ITEMS.map(({ slug, href, label, icon: Icon }) => {
          const isActive = slug === activeSlug;
          return (
            <li key={slug}>
              <Link
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-body-sm transition-colors ${isActive ? 'bg-brand-navy/5 font-semibold text-brand-navy' : 'text-neutral-700 hover:bg-neutral-100 hover:text-brand-navy'}`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function PolicyToc({ sections }: { sections: PolicySection[] }) {
  return (
    <ol className="flex flex-col gap-2 text-body-sm">
      {sections.map((section, index) => (
        <li key={section.id}>
          <a href={`#${section.id}`} className="flex gap-2 text-neutral-600 transition-colors hover:text-brand-navy">
            <span className="w-5 shrink-0 text-neutral-400">{index + 1}.</span>
            {section.title}
          </a>
        </li>
      ))}
    </ol>
  );
}

function PolicyContactCard() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-brand-cream p-5 md:p-6">
      <h2 className="text-heading-h3 font-semibold text-neutral-900">Cần hỗ trợ thêm?</h2>
      <p className="mt-1 text-body-sm text-neutral-600">Đội ngũ chăm sóc khách hàng StAle. luôn sẵn sàng giải đáp cho bạn.</p>
      <div className="mt-4 grid gap-3 text-body-sm text-neutral-700 sm:grid-cols-2">
        <a href={`tel:${POLICY_CONTACT.hotline.replaceAll(' ', '')}`} className="flex items-start gap-2.5 hover:text-brand-navy">
          <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-navy" aria-hidden />
          <span>
            Hotline {POLICY_CONTACT.hotline}
            <span className="block text-label-sm text-neutral-500">{POLICY_CONTACT.hotlineHours}</span>
          </span>
        </a>
        <a href={`mailto:${POLICY_CONTACT.email}`} className="flex items-start gap-2.5 hover:text-brand-navy">
          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-navy" aria-hidden />
          <span>{POLICY_CONTACT.email}</span>
        </a>
        <div className="flex items-start gap-2.5 sm:col-span-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-navy" aria-hidden />
          <span>{POLICY_CONTACT.address}</span>
        </div>
      </div>
    </div>
  );
}

export function PolicyPage({ policy }: { policy: PolicyDocument }) {
  return (
    <>
      <PageHeader
        title={policy.title}
        breadcrumbs={<Breadcrumb items={[{ label: 'Chính sách' }, { label: policy.title }]} />}
        subtitle={
          <>
            <span className="block max-w-3xl">{policy.summary}</span>
            <span className="mt-3 inline-flex items-center gap-1.5 text-body-sm text-neutral-500">
              <CalendarDays className="h-4 w-4" aria-hidden />
              Cập nhật lần cuối: {policy.updatedAt}
            </span>
          </>
        }
      />

      <main className="mx-auto w-full max-w-[1200px] px-4 py-8 md:px-8 md:py-12">
        <nav aria-label="Chọn chính sách" className="-mx-4 mb-6 overflow-x-auto px-4 no-scrollbar lg:hidden">
          <ul className="flex gap-2 whitespace-nowrap">
            {POLICY_NAV_ITEMS.map(({ slug, href, label }) => {
              const isActive = slug === policy.slug;
              return (
                <li key={slug}>
                  <Link
                    href={href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`inline-flex rounded-full border px-3.5 py-1.5 text-body-sm transition-colors ${isActive ? 'border-brand-navy bg-brand-navy font-semibold text-white' : 'border-neutral-200 bg-white text-neutral-700 hover:border-brand-navy hover:text-brand-navy'}`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 flex flex-col gap-8">
              <PolicyNav activeSlug={policy.slug} />
              <div>
                <p className="mb-3 text-label-sm font-bold uppercase tracking-[0.12em] text-neutral-500">Trên trang này</p>
                <PolicyToc sections={policy.sections} />
              </div>
            </div>
          </aside>

          <article className="flex min-w-0 flex-col gap-8">
            {policy.highlights && (
              <dl className="grid gap-3 sm:grid-cols-3">
                {policy.highlights.map((highlight) => (
                  <div key={highlight.label} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                    <dt className="text-label-sm text-neutral-500">{highlight.label}</dt>
                    <dd className="mt-1 text-body-lg font-semibold text-brand-navy">{highlight.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <details className="rounded-xl border border-neutral-200 bg-white p-4 lg:hidden">
              <summary className="cursor-pointer text-body-sm font-semibold text-neutral-900">Mục lục</summary>
              <div className="mt-3">
                <PolicyToc sections={policy.sections} />
              </div>
            </details>

            {policy.sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                aria-labelledby={`${section.id}-title`}
                className="scroll-mt-24 border-t border-neutral-100 pt-8 first-of-type:border-t-0 first-of-type:pt-0"
              >
                <h2 id={`${section.id}-title`} className="mb-4 text-heading-h3 font-semibold text-neutral-900">
                  <span className="mr-2 text-brand-navy">{index + 1}.</span>
                  {section.title}
                </h2>
                <div className="flex flex-col gap-4 text-body-md leading-relaxed text-neutral-700">
                  {section.blocks.map((block, blockIndex) => (
                    <PolicyBlock key={`${section.id}-${blockIndex}`} block={block} />
                  ))}
                </div>
              </section>
            ))}

            <PolicyContactCard />
          </article>
        </div>
      </main>
    </>
  );
}
