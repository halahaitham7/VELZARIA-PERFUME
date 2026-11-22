/**
 * Data for the "Create Your Perfume" experience.
 *
 * Every option carries explicit weights toward the five essences
 * (sovereign, romantic, conqueror, artist, spark). Results are calculated
 * from these weights in lib/recommend.js — nothing is random.
 */

export const PERSONALITY = [
  { id: 'confident', label: 'Confident and ambitious', hint: 'You set the direction.', w: { sovereign: 3, conqueror: 2 } },
  { id: 'romantic', label: 'Romantic and feminine', hint: 'You lead with tenderness.', w: { romantic: 3, sovereign: 1 } },
  { id: 'creative', label: 'Creative and artistic', hint: 'You see what others miss.', w: { artist: 3, spark: 1 } },
  { id: 'social', label: 'Social and adventurous', hint: 'You light up the room.', w: { spark: 3, conqueror: 1 } },
  { id: 'calm', label: 'Calm and elegant', hint: 'Your presence is quiet and certain.', w: { sovereign: 2, romantic: 1, artist: 1 } },
  { id: 'independent', label: 'Independent and determined', hint: 'You never wait for permission.', w: { conqueror: 3, sovereign: 1 } },
];

export const LIFESTYLE = [
  { id: 'travel', label: 'Traveling and exploring', w: { conqueror: 2, spark: 2 } },
  { id: 'art', label: 'Art, music, and nature', w: { artist: 3 } },
  { id: 'fashion', label: 'Fashion and beauty', w: { romantic: 2, sovereign: 1 } },
  { id: 'leadership', label: 'Leadership and business', w: { sovereign: 3, conqueror: 1 } },
  { id: 'events', label: 'Social events and meeting people', w: { spark: 3 } },
  { id: 'quiet', label: 'Quiet moments and relaxation', w: { romantic: 2, artist: 1 } },
];

/** position: where the note usually sits in a fragrance pyramid. */
export const NOTE_GROUPS = [
  {
    family: 'Floral',
    notes: [
      { id: 'rose', label: 'Rose', position: 'heart', color: '#D7A09B', in: ['sovereign', 'romantic', 'conqueror'] },
      { id: 'jasmine', label: 'Jasmine', position: 'heart', color: '#EFE5C9', in: ['sovereign', 'artist', 'spark'] },
      { id: 'peony', label: 'Peony', position: 'heart', color: '#E6B5BD', in: ['romantic'] },
      { id: 'violet', label: 'Violet', position: 'heart', color: '#A492B8', in: ['artist', 'conqueror'] },
    ],
  },
  {
    family: 'Sweet',
    notes: [
      { id: 'vanilla', label: 'Vanilla', position: 'base', color: '#E8D6B0', in: ['sovereign', 'romantic', 'conqueror', 'spark'] },
      { id: 'tonka', label: 'Tonka', position: 'base', color: '#8C6B50', in: ['conqueror', 'sovereign'] },
      { id: 'caramel', label: 'Caramel', position: 'base', color: '#C48D55', in: ['spark'] },
    ],
  },
  {
    family: 'Woody',
    notes: [
      { id: 'sandalwood', label: 'Sandalwood', position: 'base', color: '#C9A47F', in: ['sovereign', 'spark'] },
      { id: 'cedarwood', label: 'Cedarwood', position: 'base', color: '#A3805C', in: ['conqueror', 'artist'] },
      { id: 'vetiver', label: 'Vetiver', position: 'base', color: '#7F7D57', in: ['conqueror', 'artist'] },
    ],
  },
  {
    family: 'Fresh',
    notes: [
      { id: 'bergamot', label: 'Bergamot', position: 'top', color: '#C8D17C', in: ['sovereign', 'romantic', 'conqueror', 'artist'] },
      { id: 'citrus', label: 'Citrus', position: 'top', color: '#EDB65F', in: ['spark'] },
      { id: 'greentea', label: 'Green Tea', position: 'heart', color: '#A7B788', in: ['artist'] },
    ],
  },
  {
    family: 'Oriental',
    notes: [
      { id: 'amber', label: 'Amber', position: 'base', color: '#C98B47', in: ['sovereign', 'conqueror', 'spark'] },
      { id: 'saffron', label: 'Saffron', position: 'top', color: '#C45A33', in: ['sovereign', 'conqueror'] },
      { id: 'musk', label: 'Musk', position: 'base', color: '#E6DCD2', in: ['sovereign', 'romantic', 'artist', 'spark'] },
    ],
  },
  {
    family: 'Fruity',
    notes: [
      { id: 'pear', label: 'Pear', position: 'top', color: '#CED49B', in: ['romantic'] },
      { id: 'raspberry', label: 'Raspberry', position: 'heart', color: '#BF4A5F', in: ['spark'] },
      { id: 'lychee', label: 'Lychee', position: 'top', color: '#F0CFCD', in: ['romantic'] },
    ],
  },
];

export const ALL_NOTES = NOTE_GROUPS.flatMap((g) => g.notes.map((n) => ({ ...n, family: g.family })));

export const INTENSITY = [
  {
    id: 'soft',
    label: 'Soft and gentle',
    desc: 'A skin scent, discovered only up close.',
    w: { romantic: 2, artist: 1 },
    concentration: 'Eau de Parfum · approx. 15% · close to the skin',
    advice: 'keep the projection intimate, with a creamy musk base that stays close to you',
  },
  {
    id: 'balanced',
    label: 'Elegant and balanced',
    desc: 'Present, polished, never loud.',
    w: { sovereign: 2, artist: 1 },
    concentration: 'Eau de Parfum · approx. 18% · moderate sillage',
    advice: 'balance every layer so that no single note dominates — polished from first spray to dry-down',
  },
  {
    id: 'bold',
    label: 'Strong and bold',
    desc: 'Remembered after you leave.',
    w: { conqueror: 2, sovereign: 1 },
    concentration: 'Extrait de Parfum · approx. 22% · strong sillage',
    advice: 'build a generous, long-lasting trail that announces you before you speak',
  },
  {
    id: 'deep',
    label: 'Deep and mysterious',
    desc: 'Dark, resinous, slow to reveal.',
    w: { conqueror: 2, sovereign: 1 },
    concentration: 'Extrait de Parfum · approx. 25% · resinous dry-down',
    advice: 'deepen the base with resins and woods so the fragrance unfolds slowly over the evening',
  },
  {
    id: 'fresh',
    label: 'Fresh and energetic',
    desc: 'Bright, airy, full of movement.',
    w: { spark: 2, artist: 1 },
    concentration: 'Eau de Parfum · approx. 15% · bright, sparkling opening',
    advice: 'lift the opening with luminous top notes and keep the base light and transparent',
  },
];

/** Bottle personalisation options for step 6. */
export const TINTS = [
  { id: 'crystal', label: 'Crystal', glass: '#EEF0EE', liquid: '#EBD9B4' },
  { id: 'blush', label: 'Blush', glass: '#F2D4D1', liquid: '#E9B3AE' },
  { id: 'violet', label: 'Violet', glass: '#5E3F78', liquid: '#4A2C63' },
  { id: 'olive', label: 'Olive', glass: '#8C8D5A', liquid: '#6F7344' },
  { id: 'coral', label: 'Coral', glass: '#E6957D', liquid: '#E07F66' },
  { id: 'champagne', label: 'Champagne', glass: '#E8DCC6', liquid: '#D8C29A' },
];

export const CAPS = [
  { id: 'antique', label: 'Antique Gold', colors: ['#8C7754', '#D9C7A3', '#A89070'] },
  { id: 'champagne', label: 'Champagne Gold', colors: ['#A99978', '#F1E7D2', '#C9B894'] },
  { id: 'rose', label: 'Rose Gold', colors: ['#9B6E62', '#F0D2C6', '#C3958A'] },
  { id: 'onyx', label: 'Onyx', colors: ['#211D1B', '#6C625B', '#3A3330'] },
];

export const ENGRAVING_STYLES = [
  { id: 'serif', label: 'Serif capitals' },
  { id: 'italic', label: 'Italic script' },
  { id: 'initials', label: 'Initials only' },
];
