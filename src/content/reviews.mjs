// Social proof from the Google Business Profile (figures checked 2026-10-07).
// Update `count` / `value` from time to time — they are shown as-is on the site.
export const googleRating = {
  value: 4.8,
  count: 178,
  url: 'https://www.google.com/maps/place/pizzeri+fastfood+Another+level/@39.8766471,20.0041593,17z/data=!4m8!3m7!1s0x135b155860bb98b7:0x733958142549576f!8m2!3d39.8766471!4d20.0041593!9m1!1b1!16s%2Fg%2F11whpg4dfm',
};

// Topics Google highlights across the reviews, with how many reviews mention them.
export const mentions = [
  { id: 'staff', count: 22, label: { sq: 'Stafi i sjellshëm', en: 'Friendly staff', it: 'Personale gentile' } },
  { id: 'food', count: 12, label: { sq: 'Ushqim i shijshëm', en: 'Delicious food', it: 'Cibo deliziosa' } },
  { id: 'portions', count: 6, label: { sq: 'Porcione të mëdha', en: 'Large portions', it: 'Porzioni abbondanti' } },
  { id: 'clean', count: 5, label: { sq: 'Pastërti', en: 'Cleanliness', it: 'Pulizia' } },
  { id: 'fresh', count: 3, label: { sq: 'Përbërës të freskët', en: 'Fresh ingredients', it: 'Ingredienti freschi' } },
];

// Guest reviews shown as cards — paste the text exactly as written on Google.
// Initials only, for the reviewers' privacy. `lang` is the language the review was written in.
// Example: { initials: 'A. B.', rating: 5, lang: 'en', date: '2026-09', text: '…' }
export const reviews = [];
