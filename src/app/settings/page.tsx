'use client';

import { themes } from 'hooks/useTheme';
import ThemeCard from 'components/settings/ThemeCard';

export default function SettingsPage() {
  return (
    <main className="min-h-screen py-12 px-6">
      <div className="container mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-neutral-200">Color Theme</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {themes.map(theme => (
              <ThemeCard key={theme.name} theme={theme} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
