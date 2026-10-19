import type { LucideIcon } from 'lucide-react';

export type PolicySlug = 'return-policy' | 'warranty' | 'size-guide' | 'privacy' | 'terms';

/** A list entry: plain text, or a bold term followed by its explanation. */
export type PolicyListItem = string | { term: string; text: string };

export type PolicyBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: PolicyListItem[]; ordered?: boolean }
  /** Tables stack into cards on phones unless `compact` (short cells that fit a narrow screen). */
  | { type: 'table'; columns: string[]; rows: string[][]; caption?: string; compact?: boolean }
  | { type: 'note'; tone: 'info' | 'warning'; text: string; link?: PolicyLink }
  | { type: 'link'; link: PolicyLink };

export interface PolicyLink {
  label: string;
  href: string;
}

export interface PolicySection {
  /** Anchor id, unique within the document. */
  id: string;
  title: string;
  blocks: PolicyBlock[];
}

export interface PolicyHighlight {
  label: string;
  value: string;
}

export interface PolicyDocument {
  slug: PolicySlug;
  title: string;
  summary: string;
  /** Display date, dd/mm/yyyy. */
  updatedAt: string;
  highlights?: PolicyHighlight[];
  sections: PolicySection[];
}

export interface PolicyNavItem {
  slug: PolicySlug;
  href: `/${PolicySlug}`;
  label: string;
  icon: LucideIcon;
}
