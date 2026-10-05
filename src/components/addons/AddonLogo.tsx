import Image from 'next/image';
import { addonMonogram } from '@/utils/addons';

interface AddonLogoProps {
  name: string;
  src?: string | null;
}

export const AddonLogo = ({ name, src }: AddonLogoProps) =>
  src ? (
    <Image src={src} alt="" width={64} height={64} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
  ) : (
    <div
      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-brand-400/40 to-brand-600/40 text-xl font-bold text-white"
      aria-hidden="true"
    >
      {addonMonogram(name)}
    </div>
  );
