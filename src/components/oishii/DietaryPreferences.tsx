'use client';

import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';

import { setPreferences } from '@/api/oishii';
import { OISHII_DIETS, OISHII_INTOLERANCES } from '@/constants/oishii';
import { brandContainedButtonSx } from '@/components/scorebook/fieldStyles';
import type { DietaryPreferences as DietaryPreferencesType } from '@/types/oishii';

interface DietaryPreferencesProps {
  initialPreferences: DietaryPreferencesType;
}

// Personal dietary preferences drive which recipe ideas get filtered out for this
// user (used by the "cooking for" control in RecipeIdeasPanel). Chips are toggled
// locally and persisted in one PUT when the user hits Save.
export const DietaryPreferences = ({ initialPreferences }: DietaryPreferencesProps) => {
  const [intolerances, setIntolerances] = useState<string[]>(initialPreferences.intolerances);
  const [diets, setDiets] = useState<string[]>(initialPreferences.diets);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const toggle = (
    value: string,
    selected: string[],
    setSelected: (next: string[]) => void
  ) => {
    setSaved(false);
    setSelected(selected.includes(value) ? selected.filter(v => v !== value) : [...selected, value]);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const result = await setPreferences({ intolerances, diets });
      setIntolerances(result.intolerances);
      setDiets(result.diets);
      setSaved(true);
    } catch (err) {
      console.error(err);
      setError('Could not save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="flex max-w-xl flex-col gap-4 rounded-xl border border-neutral-700 bg-neutral-800 p-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Dietary preferences</h2>
        <p className="mt-1 text-sm text-neutral-300">
          Recipe ideas will hide anything that clashes with the diets and intolerances you pick here.
        </p>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-400">Intolerances</h3>
        <div className="flex flex-wrap gap-2">
          {OISHII_INTOLERANCES.map(value => {
            const selected = intolerances.includes(value);
            return (
              <Chip
                key={value}
                label={value}
                clickable
                color={selected ? 'primary' : 'default'}
                variant={selected ? 'filled' : 'outlined'}
                onClick={() => toggle(value, intolerances, setIntolerances)}
                sx={{ textTransform: 'capitalize' }}
              />
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-400">Diets</h3>
        <div className="flex flex-wrap gap-2">
          {OISHII_DIETS.map(value => {
            const selected = diets.includes(value);
            return (
              <Chip
                key={value}
                label={value}
                clickable
                color={selected ? 'primary' : 'default'}
                variant={selected ? 'filled' : 'outlined'}
                onClick={() => toggle(value, diets, setDiets)}
                sx={{ textTransform: 'capitalize' }}
              />
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="contained" onClick={handleSave} disabled={saving} sx={brandContainedButtonSx}>
          {saving ? 'Saving…' : 'Save preferences'}
        </Button>
      </div>

      {saved && <Alert severity="success">Preferences saved.</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
    </section>
  );
};
