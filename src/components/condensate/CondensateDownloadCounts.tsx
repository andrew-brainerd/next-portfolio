import type { CondensateDownloadCounts as Counts } from '@/types/apps';
import { downloadsByVersion } from '@/utils/condensateDownloadCounts';

const VERSIONS_SHOWN = 10;

const Stat = ({ label, value, hint }: { label: string; value: number; hint: string }) => (
  <div className="rounded-lg border border-neutral-700 px-4 py-3">
    <p className="text-2xl font-semibold tabular-nums text-white">{value.toLocaleString()}</p>
    <p className="text-sm text-neutral-300">{label}</p>
    <p className="text-xs text-neutral-500">{hint}</p>
  </div>
);

export const CondensateDownloadCounts = ({ counts }: { counts: Counts }) => {
  const versions = downloadsByVersion(counts).slice(0, VERSIONS_SHOWN);
  return (
    <div className="mt-6">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-300">Download counts</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="From this site" value={counts.bySource.site} hint="Download buttons" />
        <Stat label="Updates" value={counts.bySource.updater} hint="In-app updater" />
        <Stat label="Other links" value={counts.bySource.direct} hint="Shared or old links" />
      </div>
      {versions.length > 0 && (
        <table className="mt-4 w-full text-sm">
          <thead className="text-left text-neutral-500">
            <tr>
              <th className="py-1 font-normal">Version</th>
              <th className="py-1 text-right font-normal">Site</th>
              <th className="py-1 text-right font-normal">Updates</th>
              <th className="py-1 text-right font-normal">Other</th>
            </tr>
          </thead>
          <tbody className="tabular-nums text-neutral-300">
            {versions.map(row => (
              <tr key={row.version} className="border-t border-neutral-800">
                <td className="py-1 font-mono">{row.version}</td>
                <td className="py-1 text-right">{row.site}</td>
                <td className="py-1 text-right">{row.updater}</td>
                <td className="py-1 text-right">{row.direct}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="mt-2 text-xs text-neutral-500">Counted per download, not per person. Only site admins see these.</p>
    </div>
  );
};
