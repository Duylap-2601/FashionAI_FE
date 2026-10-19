import { PolicyPage } from '@/features/policies/components/policy-page';
import { PRIVACY_POLICY } from '@/features/policies/constants/privacy-policy';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `${PRIVACY_POLICY.title} | FashionAI`,
  description: PRIVACY_POLICY.summary,
};

export default function Page() {
  return <PolicyPage policy={PRIVACY_POLICY} />;
}
