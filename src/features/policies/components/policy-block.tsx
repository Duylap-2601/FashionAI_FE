import type { PolicyBlock as PolicyBlockData, PolicyLink, PolicyListItem } from '@/features/policies/types/policy';
import { AlertTriangle, ChevronRight, Info } from 'lucide-react';
import Link from 'next/link';

function PolicyListEntry({ item }: { item: PolicyListItem }) {
  if (typeof item === 'string') return <li>{item}</li>;
  return (
    <li>
      <strong className="font-semibold text-neutral-900">{item.term}:</strong> {item.text}
    </li>
  );
}

function PolicyInlineLink({ link }: { link: PolicyLink }) {
  return (
    <Link
      href={link.href}
      className="inline-flex w-fit items-center gap-1 font-semibold text-brand-navy hover:underline"
    >
      {link.label}
      <ChevronRight className="h-4 w-4" aria-hidden />
    </Link>
  );
}

export function PolicyBlock({ block }: { block: PolicyBlockData }) {
  switch (block.type) {
    case 'paragraph':
      return <p>{block.text}</p>;

    case 'list': {
      const ListTag = block.ordered ? 'ol' : 'ul';
      return (
        <ListTag className={`flex flex-col gap-2 pl-5 marker:text-brand-navy ${block.ordered ? 'list-decimal marker:font-semibold' : 'list-disc'}`}>
          {block.items.map((item) => (
            <PolicyListEntry key={typeof item === 'string' ? item : item.term} item={item} />
          ))}
        </ListTag>
      );
    }

    case 'table':
      return (
        <>
          <div className={`overflow-x-auto rounded-xl border border-neutral-200 ${block.compact ? '' : 'hidden md:block'}`}>
            <table className="w-full text-left text-body-sm">
              {block.caption && <caption className="sr-only">{block.caption}</caption>}
              <thead className="bg-brand-cream text-neutral-900">
                <tr>
                  {block.columns.map((column) => (
                    <th key={column} scope="col" className="px-4 py-3 font-semibold">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row) => (
                  <tr key={row[0]} className="border-t border-neutral-100 align-top">
                    {row.map((cell, index) => (
                      <td
                        key={`${row[0]}-${block.columns[index]}`}
                        className={`px-4 py-3 ${index === 0 ? 'font-medium text-neutral-900' : ''}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!block.compact && (
            <ul className="flex flex-col gap-3 md:hidden">
              {block.rows.map((row) => (
                <li key={row[0]} className="rounded-xl border border-neutral-200 bg-white p-4">
                  <p className="font-semibold text-neutral-900">{row[0]}</p>
                  <dl className="mt-2 flex flex-col gap-1.5 text-body-sm">
                    {row.slice(1).map((cell, index) => (
                      <div key={`${row[0]}-${block.columns[index + 1]}`} className="grid grid-cols-[112px_minmax(0,1fr)] gap-3">
                        <dt className="text-neutral-500">{block.columns[index + 1]}</dt>
                        <dd>{cell}</dd>
                      </div>
                    ))}
                  </dl>
                </li>
              ))}
            </ul>
          )}
        </>
      );

    case 'note': {
      const isWarning = block.tone === 'warning';
      const Icon = isWarning ? AlertTriangle : Info;
      return (
        <div
          className={`flex gap-3 rounded-xl border p-4 ${isWarning ? 'border-semantic-warning/30 bg-semantic-warning/5' : 'border-brand-taupe bg-brand-cream'}`}
        >
          <Icon
            className={`mt-0.5 h-5 w-5 shrink-0 ${isWarning ? 'text-semantic-warning' : 'text-brand-navy'}`}
            aria-hidden
          />
          <div className="flex flex-col gap-2">
            <p>{block.text}</p>
            {block.link && <PolicyInlineLink link={block.link} />}
          </div>
        </div>
      );
    }

    case 'link':
      return <PolicyInlineLink link={block.link} />;
  }
}
