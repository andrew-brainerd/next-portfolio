'use client';

import { ThemeConfig, ThemeName, useTheme } from 'hooks/useTheme';

interface ThemeCardProps {
  theme: ThemeConfig;
}

export default function ThemeCard({ theme }: ThemeCardProps) {
  const { theme: currentTheme, setTheme } = useTheme();
  const isActive = currentTheme === theme.name;

  const handleClick = () => {
    setTheme(theme.name as ThemeName);
  };

  return (
    <button
      onClick={handleClick}
      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
        isActive
          ? 'border-brand-500 bg-neutral-700/50'
          : 'border-neutral-500 hover:border-neutral-400 bg-neutral-700/30'
      }`}
      type="button"
    >
      <div className="flex gap-2 mb-3 justify-center">
        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.primary }} />
        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.secondary }} />
        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.tertiary }} />
      </div>
      <div className="text-sm font-medium text-center">{theme.label}</div>
      {isActive && <div className="text-xs text-brand-400 mt-1 text-center">Active</div>}
    </button>
  );
}
