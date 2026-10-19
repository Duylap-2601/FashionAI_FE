import { PolicyPage } from '@/features/policies/components/policy-page';
import { RETURN_POLICY } from '@/features/policies/constants/return-policy';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `${RETURN_POLICY.title} | FashionAI`,
  description: RETURN_POLICY.summary,
};

export default function Page() {
  return <PolicyPage policy={RETURN_POLICY} />;
}
