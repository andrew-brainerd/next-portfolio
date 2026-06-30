'use client';

import { ProfilePictureSettings } from 'components/settings/ProfilePictureSettings';
import { DisplayNameSettings } from 'components/settings/DisplayNameSettings';
import { ThemeSelector } from 'components/settings/ThemeSelector';

export const SettingsHub = () => (
  <main className="min-h-screen py-12 px-6">
    <div className="container mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Settings</h1>
      <p className="text-neutral-400 mb-8">Manage your account and appearance.</p>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-neutral-200">Account</h2>
        <ProfilePictureSettings />
        <DisplayNameSettings />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2 text-neutral-200">Theme</h2>
        <p className="text-neutral-400 text-sm mb-4">Pick a color scheme or switch to Windows 95 mode.</p>
        <ThemeSelector />
      </section>
    </div>
  </main>
);
