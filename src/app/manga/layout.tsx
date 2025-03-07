export interface MangaLayoutProps {
  children: React.ReactNode;
}

export default function MangaLayout({ children }: MangaLayoutProps) {
  return <div className="w-full h-screen bg-fuchsia-950 p-20">{children}</div>;
}
