import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Manga Search',
  description: 'Search and browse manga collection'
};

export interface MangaLayoutProps {
  children: React.ReactNode;
}

export default function MangaLayout({ children }: MangaLayoutProps) {
  return <div className="w-full h-full bg-neutral-600 p-20">{children}</div>;
}
