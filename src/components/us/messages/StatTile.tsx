interface StatTileProps {
  value: string;
  label: string;
  detail: string;
}

export const StatTile = ({ value, label, detail }: StatTileProps) => (
  <div className="rounded-lg border border-neutral-700 bg-neutral-800 p-4">
    <div className="font-mono text-3xl leading-tight text-white">{value}</div>
    <div className="mt-1 text-xs uppercase tracking-wider text-neutral-400">{label}</div>
    <div className="mt-1.5 text-xs text-neutral-500">{detail}</div>
  </div>
);
