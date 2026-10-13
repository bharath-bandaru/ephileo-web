export interface Review {
  /** Shown as first name + last initial; avatars are initials, not profile photos. */
  name: string;
  rating: 1 | 2 | 3 | 4 | 5;
  /** ISO date the review was posted. */
  date: string;
  /** Verbatim review text — don't edit. */
  text: string;
  project: string;
  source: 'Google Play' | 'App Store';
  reply?: { date: string; text: string };
}

export const CHAIN_REACTION_REVIEWS_URL =
  'https://play.google.com/store/apps/details?id=com.bhvp.chainreaction&hl=en&showAllReviews=true';

// Real Google Play reviews of Chain Reaction (screenshots from Oct 4, 2026).
export const reviews: Review[] = [
  {
    name: 'Prasad V.',
    rating: 5,
    date: '2023-01-05',
    text: 'Pretty cool man searched a lot for this kind of pure game,thanks a lot',
    project: 'Chain Reaction',
    source: 'Google Play',
  },
  {
    name: 'Sai Prithvi Y.',
    rating: 5,
    date: '2022-09-06',
    text: 'Great app to play with friends ✌️',
    project: 'Chain Reaction',
    source: 'Google Play',
  },
  {
    name: 'Rhitam B.',
    rating: 4,
    date: '2023-10-26',
    text: 'Nicely developed and clean ui. Mechanics are smooth for players on single device.',
    project: 'Chain Reaction',
    source: 'Google Play',
  },
  {
    name: 'Prateek S.',
    rating: 5,
    date: '2024-04-23',
    text: "Very good game really bit if you can improve the multiplayer option then that would make your game top notch even if the game size increase that doesn't mind",
    project: 'Chain Reaction',
    source: 'Google Play',
  },
  {
    name: 'Grace Institute',
    rating: 4,
    date: '2025-04-27',
    text: 'all good. but need undo option',
    project: 'Chain Reaction',
    source: 'Google Play',
    reply: { date: '2025-08-12', text: 'Update will be in a week. Thank you for the feedback.' },
  },
  {
    name: '][',
    rating: 5,
    date: '2022-09-07',
    text: 'Fun game!',
    project: 'Chain Reaction',
    source: 'Google Play',
  },
  {
    name: 'Angel M.',
    rating: 4,
    date: '2024-04-23',
    text: "Idk why this app doesn't have a review, but this game is not bad.",
    project: 'Chain Reaction',
    source: 'Google Play',
  },
  {
    name: 'Gaurav R.',
    rating: 5,
    date: '2023-12-26',
    text: 'Very good software development',
    project: 'Chain Reaction',
    source: 'Google Play',
  },
  {
    name: 'Mamatha V.',
    rating: 5,
    date: '2026-03-17',
    text: 'excellent',
    project: 'Chain Reaction',
    source: 'Google Play',
  },
];
