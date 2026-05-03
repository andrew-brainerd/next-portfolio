import type { ReactNode } from 'react';

export default function RollWithMeLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage:
          'radial-gradient(ellipse 1000px 500px at 50% -100px, color-mix(in srgb, var(--color-hero-via) 22%, transparent), transparent 70%)'
      }}
    >
      {children}
    </div>
  );
}
