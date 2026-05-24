'use client';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const RouteError = ({ reset }: ErrorProps) => {
  return (
    <div className="p-6 flex flex-col gap-3">
      <p className="text-lg">Something went wrong.</p>
      <button
        onClick={reset}
        className="self-start px-4 py-2 rounded bg-neutral-700 hover:bg-neutral-600 transition-colors cursor-pointer"
        type="button"
      >
        Try again
      </button>
    </div>
  );
};

export default RouteError;
