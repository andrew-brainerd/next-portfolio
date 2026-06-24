import { StartLogo } from '@/components/win95/Win95Icons';

interface Win95DialogProps {
  title: string;
  width?: string;
  children: React.ReactNode;
}

/** Centered Win95 dialog shell with a blue title bar — used by the auth screens. */
export const Win95Dialog = ({ title, width = 'w-80', children }: Win95DialogProps) => (
  <div className="flex h-full items-center justify-center p-4 text-[11px]">
    <div className={`win95-raised ${width} max-w-full`}>
      <div className="win95-title-bar">
        <span className="win95-title-text">
          <StartLogo />
          {title}
        </span>
      </div>
      <div className="p-3">{children}</div>
    </div>
  </div>
);
