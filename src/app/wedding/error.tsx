'use client';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const RouteError = ({ reset }: ErrorProps) => {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-[#ede6e1] p-6">
      <p className="text-lg text-[#000000]">Something went wrong.</p>
      <button
        onClick={reset}
        className="rounded-lg bg-[#d4a770] px-4 py-2 text-[#000000] transition-colors hover:bg-[#c99755] cursor-pointer"
        type="button"
      >
        Try again
      </button>
    </div>
  );
};

export default RouteError;
