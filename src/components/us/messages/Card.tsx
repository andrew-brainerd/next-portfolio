import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  note?: string;
  className?: string;
  children: ReactNode;
}

export const Card = ({ title, note, className = '', children }: CardProps) => (
  <section className={`rounded-lg border border-neutral-700 bg-neutral-800 p-5 ${className}`}>
    {title && <h2 className="text-sm font-semibold tracking-wide text-white">{title}</h2>}
    {note && <p className="mt-0.5 mb-4 text-xs text-neutral-400">{note}</p>}
    {children}
  </section>
);
