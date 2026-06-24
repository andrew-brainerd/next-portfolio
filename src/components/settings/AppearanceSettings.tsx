import { themes } from 'hooks/useTheme';
import { ThemeCard } from 'components/settings/ThemeCard';
import { Win95Toggle } from 'components/settings/Win95Toggle';

export const AppearanceSettings = () => (
  <main className="min-h-screen py-12 px-6">
    <div className="container mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Appearance</h1>
      <p className="text-neutral-400 mb-8">Make it yours — no account required.</p>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-neutral-200">Color Theme</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {themes.map(theme => (
            <ThemeCard key={theme.name} theme={theme} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 text-neutral-200">Presentation</h2>
        <Win95Toggle />
      </section>
    </div>
  </main>
);
