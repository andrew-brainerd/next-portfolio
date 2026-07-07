'use client';

import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';

import { getRecipeIdeas } from '@/api/oishii';
import { brandContainedButtonSx } from '@/components/scorebook/fieldStyles';
import type { PantryDetail, RecipeIdeasResult } from '@/types/oishii';

interface RecipeIdeasPanelProps {
  pantry: PantryDetail;
}

// Suggests recipes from the pantry's current ingredients, filtered by the combined
// dietary preferences of whoever you're "cooking for". Selecting everyone (the
// default) omits forUserIds so the backend cooks for the whole pantry.
export const RecipeIdeasPanel = ({ pantry }: RecipeIdeasPanelProps) => {
  const allMemberIds = pantry.members.map(m => m.userId);
  const [selectedIds, setSelectedIds] = useState<string[]>(allMemberIds);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RecipeIdeasResult | null>(null);

  const isEmptyPantry = pantry.items.length === 0;

  const toggleMember = (userId: string) => {
    setSelectedIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleGetIdeas = async () => {
    setLoading(true);
    setError(null);
    try {
      // Selecting everyone means "cook for the whole pantry" — send no filter.
      const forUserIds = selectedIds.length === allMemberIds.length ? undefined : selectedIds;
      const ideas = await getRecipeIdeas(pantry.id, forUserIds);
      setResult(ideas);
    } catch (err) {
      console.error(err);
      setError('Could not fetch recipe ideas. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isEmptyPantry) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-700 p-4 text-sm text-neutral-300">
        Add some items to this pantry to get recipe ideas.
      </div>
    );
  }

  const appliedRestrictions = result ? [...result.appliedIntolerances, ...result.appliedDiets] : [];

  return (
    <div className="space-y-5">
      <div className="max-w-2xl rounded-xl border border-neutral-700 bg-neutral-800 p-6">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-400">Cooking for</h3>
        <div className="mb-4 flex flex-wrap gap-2">
          {pantry.members.map(member => {
            const selected = selectedIds.includes(member.userId);
            return (
              <Chip
                key={member.userId}
                label={member.displayName}
                clickable
                color={selected ? 'primary' : 'default'}
                variant={selected ? 'filled' : 'outlined'}
                onClick={() => toggleMember(member.userId)}
              />
            );
          })}
        </div>
        <Button
          variant="contained"
          onClick={handleGetIdeas}
          disabled={loading || selectedIds.length === 0}
          sx={brandContainedButtonSx}
        >
          {loading ? 'Finding recipes…' : 'Get recipe ideas'}
        </Button>
        {selectedIds.length === 0 && (
          <p className="mt-2 text-xs text-neutral-500">Pick at least one person to cook for.</p>
        )}
      </div>

      {error && <Alert severity="error">{error}</Alert>}

      {result && (
        <div className="space-y-4">
          {appliedRestrictions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-neutral-400">Hiding recipes with:</span>
              {appliedRestrictions.map(restriction => (
                <Chip key={restriction} label={restriction} size="small" color="warning" variant="outlined" />
              ))}
            </div>
          )}

          {result.recipes.length === 0 ? (
            <div className="rounded-lg border border-dashed border-neutral-700 p-4 text-sm text-neutral-300">
              No recipe ideas matched this pantry and these preferences. Try adding more items or loosening
              restrictions.
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.recipes.map(recipe => {
                const readyToMake = recipe.missedIngredientCount === 0;
                const card = (
                  <div className="flex h-full flex-col overflow-hidden rounded-lg border border-neutral-700 bg-neutral-800 transition hover:border-brand-500">
                    {recipe.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="h-40 w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-40 w-full items-center justify-center bg-neutral-900 text-neutral-600">
                        No image
                      </div>
                    )}
                    <div className="flex flex-1 flex-col gap-2 p-4">
                      <h4 className="font-semibold text-white">{recipe.title}</h4>
                      <div>
                        {readyToMake ? (
                          <span className="inline-block rounded bg-green-900 px-2 py-0.5 text-xs font-medium text-green-200">
                            Ready to make
                          </span>
                        ) : (
                          <span className="inline-block rounded bg-amber-900 px-2 py-0.5 text-xs font-medium text-amber-200">
                            {recipe.missedIngredientCount} missing
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400">
                        Uses {recipe.usedIngredientCount} pantry item
                        {recipe.usedIngredientCount === 1 ? '' : 's'} · {recipe.missedIngredientCount} to buy
                      </p>
                      {recipe.diets.length > 0 && (
                        <div className="mt-auto flex flex-wrap gap-1 pt-1">
                          {recipe.diets.map(diet => (
                            <span
                              key={diet}
                              className="rounded bg-neutral-700 px-1.5 py-0.5 text-[10px] font-medium capitalize text-neutral-200"
                            >
                              {diet}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );

                return (
                  <li key={recipe.id}>
                    {recipe.sourceUrl ? (
                      <a
                        href={recipe.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block h-full"
                      >
                        {card}
                      </a>
                    ) : (
                      card
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
