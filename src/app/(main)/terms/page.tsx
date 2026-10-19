import { PolicyPage } from '@/features/policies/components/policy-page';
import { TERMS_OF_SERVICE } from '@/features/policies/constants/terms-of-service';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `${TERMS_OF_SERVICE.title} | FashionAI`,
  description: TERMS_OF_SERVICE.summary,
};

export default function Page() {
  return <PolicyPage policy={TERMS_OF_SERVICE} />;
}
