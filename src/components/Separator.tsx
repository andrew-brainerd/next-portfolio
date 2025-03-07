import { clsx } from 'clsx';

interface SeparatorProps {
  className?: string;
  text?: string;
}

export default function Separator({ className, text }: SeparatorProps) {
  return (
    <div className={clsx('relative mx-auto my-4 w-11/12 border-t-2 border-tailboard-brand-700', className)}>
      {text && (
        <div className="flex justify-center">
          <p className="absolute top-[-15px] bg-white px-4">or</p>
        </div>
      )}
    </div>
  );
}
