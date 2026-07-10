'use client';

import { useEffect, useState } from 'react';

import type { ApiUsage } from 'types/watch';
import { getWatchUsage } from 'api/watch';
import { Loading } from 'components/Loading';

const barColor = (percent: number): string =>
  percent >= 90 ? 'bg-red-500' : percent >= 70 ? 'bg-amber-500' : 'bg-brand-500';

const formatDate = (iso: string | null): string | null => {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatUpdated = (ms: number): string =>
  ms > 0
    ? `Updated ${new Date(ms).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`
    : 'No requests recorded yet';

export const UsageDashboard = () => {
  const [usage, setUsage] = useState<ApiUsage[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getWatchUsage().then(result => {
      if (active) {
        setUsage(result ?? []);
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loading />
      </div>
    );
  }

  if (!usage || usage.length === 0) {
    return <p className="py-10 text-center text-sm text-neutral-500">No usage data yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {usage.map(api => {
        const stats =
          api.quota !== null && api.used !== null
            ? {
                percent: Math.min(100, Math.round((api.used / api.quota) * 100)),
                remaining: Math.max(0, api.quota - api.used),
                quota: api.quota,
                used: api.used
              }
            : null;
        const reset = formatDate(api.resetAt);

        return (
          <div key={api.provider} className="rounded-lg border border-neutral-700 bg-neutral-900/50 p-4">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-semibold text-white">{api.label}</h3>
              {stats && <span className="text-xs text-neutral-400">{stats.percent}%</span>}
            </div>

            {stats ? (
              <>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-800">
                  <div className={`h-full rounded-full ${barColor(stats.percent)}`} style={{ width: `${stats.percent}%` }} />
                </div>
                <p className="mt-2 text-sm text-neutral-300">
                  {stats.used.toLocaleString()} / {stats.quota.toLocaleString()} used
                  <span className="text-neutral-500"> · {stats.remaining.toLocaleString()} left</span>
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  {reset ? `Resets ${reset}` : 'Resets monthly'} · {formatUpdated(api.updatedAt)}
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm text-neutral-400">No monthly limit tracked.</p>
            )}
          </div>
        );
      })}
    </div>
  );
};
