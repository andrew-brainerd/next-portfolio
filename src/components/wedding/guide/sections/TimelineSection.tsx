'use client';

import { useWeddingClockOffset } from '@/components/wedding/WeddingClock';
import { useNow } from '@/hooks/useNow';
import type { ScheduleItem } from '@/types/wedding';
import { getNowNext } from '@/utils/scheduleTime';
import { GuideSection } from '../GuideSection';

interface TimelineSectionProps {
  schedule: ScheduleItem[];
  weddingDate: string;
  timeZone: string;
  initialNow: number;
}

export const TimelineSection = ({ schedule, weddingDate, timeZone, initialNow }: TimelineSectionProps) => {
  const now = useNow(initialNow, useWeddingClockOffset());
  const state = getNowNext(schedule, weddingDate, timeZone, now);
  const current = state.phase === 'day' ? state.current : undefined;

  return (
    <GuideSection id="timeline" title="Timeline">
      <ol className="space-y-1">
        {schedule.map(item => {
          const isNow = item === current;
          return (
            <li
              key={`${item.time}-${item.title}`}
              aria-current={isNow ? 'time' : undefined}
              className={`flex gap-4 rounded-lg px-3 py-2 ${isNow ? 'bg-[var(--sb-gold)]/25 ring-1 ring-[var(--sb-gold)]' : ''}`}
            >
              <span className="w-20 shrink-0 text-right text-sm font-semibold text-[var(--sb-crimson)]">
                {item.time}
                {item.endTime && <span className="block text-xs font-normal opacity-70">to {item.endTime}</span>}
              </span>
              <div>
                <p className="font-semibold">
                  {item.title}
                  {isNow && (
                    <span className="ml-2 rounded-full bg-[var(--sb-crimson)] px-2 py-0.5 align-middle text-xs font-normal text-[var(--sb-white)]">
                      Now
                    </span>
                  )}
                </p>
                {item.description && <p className="text-sm opacity-80">{item.description}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </GuideSection>
  );
};
