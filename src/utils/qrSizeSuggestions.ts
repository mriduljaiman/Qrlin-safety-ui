// Suggested print dimensions (cm) per category - just a starting point so
// users aren't guessing what size sticker to print; still fully editable.
const SUGGESTED_SIZES_CM: Record<string, { width: number; height: number }> = {
  mobile: { width: 3, height: 3 },
  earpods: { width: 2, height: 2 },
  'school bag / travel bag': { width: 5, height: 5 },
  'children safety': { width: 4, height: 6 },
  'person safety': { width: 4, height: 6 },
  'vehicle safety': { width: 8, height: 8 },
  pet: { width: 3, height: 3 },
  jewellery: { width: 1.5, height: 1.5 },
  keys: { width: 3, height: 3 },
  wallet: { width: 4, height: 6 },
  backpack: { width: 5, height: 5 },
  luggage: { width: 6, height: 9 },
  bike: { width: 6, height: 6 },
  bicycle: { width: 6, height: 6 },
  car: { width: 8, height: 8 },
  laptop: { width: 4, height: 4 },
  tablet: { width: 4, height: 4 },
  camera: { width: 3, height: 3 },
  drone: { width: 4, height: 4 },
  watch: { width: 2, height: 2 },
  'medicine kit': { width: 5, height: 5 },
  umbrella: { width: 3, height: 3 },
  'water bottle': { width: 4, height: 4 },
  headphones: { width: 3, height: 3 },
};

const DEFAULT_SIZE_CM = { width: 5, height: 5 };

export function getSuggestedSizeCm(category: string | null | undefined): { width: number; height: number } {
  if (!category) return DEFAULT_SIZE_CM;
  return SUGGESTED_SIZES_CM[category.trim().toLowerCase()] || DEFAULT_SIZE_CM;
}
