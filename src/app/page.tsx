import { HomeTabs } from 'components/HomeTabs';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="relative bg-[var(--color-brand-300)]/10 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
        <div className="relative container mx-auto px-6 py-10 sm:py-14 text-center">
          <div>
            <h1 className="font-roboto font-bold tracking-tight text-3xl sm:text-4xl lg:text-5xl text-white mb-3 drop-shadow-lg">
              Andrew J. Brainerd
            </h1>
            <p className="text-[var(--color-hero-text)] text-sm sm:text-base lg:text-lg font-light max-w-2xl mx-auto">
              Software Engineer & Pretty Nice Guy
            </p>
          </div>
        </div>
      </header>

      <HomeTabs />
    </main>
  );
}
