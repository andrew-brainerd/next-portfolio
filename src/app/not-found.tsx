import Link from 'next/link';

const NotFound = () => {
  return (
    <div className="p-12 flex flex-col items-center gap-4 text-center">
      <h1 className="text-3xl font-bold">404 — Page not found</h1>
      <Link href="/" className="underline hover:text-brand-400 transition-colors">
        Go home
      </Link>
    </div>
  );
};

export default NotFound;
