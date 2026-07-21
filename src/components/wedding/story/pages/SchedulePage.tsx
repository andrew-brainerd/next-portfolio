import type { ScheduleItem } from '@/types/wedding';
import { LogisticsPage } from './LogisticsPage';

interface SchedulePageProps {
  schedule: ScheduleItem[];
}

export const SchedulePage = ({ schedule }: SchedulePageProps) => (
  <LogisticsPage kicker="The Plan" title="The Day Itself">
    <ol className="space-y-4">
      {schedule.map(item => (
        <li key={`${item.time}-${item.title}`} className="flex gap-4">
          <span className="w-20 shrink-0 text-right text-sm font-semibold text-[var(--sb-crimson)]">{item.time}</span>
          <div>
            <p className="font-semibold text-[var(--sb-ink)]">{item.title}</p>
            {item.description && <p className="text-sm">{item.description}</p>}
          </div>
        </li>
      ))}
    </ol>
  </LogisticsPage>
);
