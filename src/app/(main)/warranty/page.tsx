import { PolicyPage } from '@/features/policies/components/policy-page';
import { WARRANTY_POLICY } from '@/features/policies/constants/warranty-policy';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `${WARRANTY_POLICY.title} | FashionAI`,
  description: WARRANTY_POLICY.summary,
};

export default function Page() {
  return <PolicyPage policy={WARRANTY_POLICY} />;
}
