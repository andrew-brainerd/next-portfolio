'use client';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const RouteError = ({ reset }: ErrorProps) => {
  return (
    <div className="storybook flex min-h-dvh flex-col items-center justify-center gap-3 bg-[var(--sb-cream)] p-6">
      <p className="font-garamond text-lg text-[var(--sb-ink)]">Something went wrong.</p>
      <button
        onClick={reset}
        className="rounded-lg bg-[var(--sb-gold)] px-4 py-2 text-[var(--sb-ink)] transition-colors hover:bg-[var(--sb-gold-deep)] cursor-pointer"
        type="button"
      >
        Try again
      </button>
    </div>
  );
};

export default RouteError;
