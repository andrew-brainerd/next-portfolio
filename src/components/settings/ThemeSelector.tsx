'use client';

import { useThemeSelection } from 'hooks/useThemeSelection';

export const ThemeSelector = () => {
  const { options, activeId, select } = useThemeSelection();

  return (
    <div className="grid grid-cols-2 gap-4">
      {options.map(option => {
        const isActive = activeId === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => select(option.id)}
            aria-pressed={isActive}
            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
              isActive
                ? 'border-brand-500 bg-neutral-700/50'
                : 'border-neutral-500 hover:border-neutral-400 bg-neutral-700/30'
            }`}
          >
            <div className="flex gap-2 mb-3 justify-center">
              {option.swatches.map((color, index) => (
                <div key={index} className="w-6 h-6 rounded-full" style={{ backgroundColor: color }} />
              ))}
            </div>
            <div className="text-sm font-medium text-center">{option.label}</div>
          </button>
        );
      })}
    </div>
  );
};
