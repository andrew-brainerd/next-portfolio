interface LegendProps {
  items: { color: string; label: string }[];
}

export const Legend = ({ items }: LegendProps) => (
  <div className="mb-3 flex flex-wrap items-center gap-4">
    {items.map(({ color, label }) => (
      <span key={label} className="inline-flex items-center gap-1.5 text-xs text-neutral-400">
        <span className="size-2.5 rounded-sm" style={{ background: color }} />
        {label}
      </span>
    ))}
  </div>
);
