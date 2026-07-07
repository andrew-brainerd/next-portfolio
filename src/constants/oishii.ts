// Dietary option lists mirrored from the brainerd-api /oishii backend (Spoonacular's
// supported intolerance/diet values). Kept lowercased to match what the API stores
// and filters against.
export const OISHII_INTOLERANCES = [
  'dairy',
  'egg',
  'gluten',
  'grain',
  'peanut',
  'seafood',
  'sesame',
  'shellfish',
  'soy',
  'sulfite',
  'tree nut',
  'wheat'
] as const;

export const OISHII_DIETS = [
  'gluten free',
  'ketogenic',
  'vegetarian',
  'lacto-vegetarian',
  'ovo-vegetarian',
  'vegan',
  'pescetarian',
  'paleo',
  'primal',
  'low fodmap',
  'whole30'
] as const;
