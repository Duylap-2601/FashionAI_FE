import { PolicyPage } from '@/features/policies/components/policy-page';
import { SIZE_GUIDE } from '@/features/policies/constants/size-guide';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `${SIZE_GUIDE.title} | FashionAI`,
  description: SIZE_GUIDE.summary,
};

export default function Page() {
  return <PolicyPage policy={SIZE_GUIDE} />;
}
