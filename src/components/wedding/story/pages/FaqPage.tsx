import type { FaqItem } from '@/types/wedding';
import { LogisticsPage } from './LogisticsPage';

interface FaqPageProps {
  faq: FaqItem[];
}

export const FaqPage = ({ faq }: FaqPageProps) => (
  <LogisticsPage kicker="Questions" title="Asked & Answered">
    <div className="space-y-4">
      {faq.map(item => (
        <section key={item.question}>
          <p className="font-semibold text-[var(--sb-ink)]">{item.question}</p>
          <p className="mt-1 text-sm">{item.answer}</p>
        </section>
      ))}
    </div>
  </LogisticsPage>
);
