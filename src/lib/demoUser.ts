import type { ActivityType, ItemType, UserActivity } from '@/types';

// Pre-seeded activity for the demo user. This simulates a real user who
// has searched, rated, watched, and browsed — so recommendations work
// immediately without manual setup.

export interface DemoActivitySeed {
  activity_type: ActivityType;
  item_type: ItemType;
  item_id: string;
  item_name: string;
  query?: string;
  rating_value?: number;
  hours_ago: number;
}

export const DEMO_USER_EMAIL = 'demo@recoengine.ai';
export const DEMO_USER_PASSWORD = 'demo123456';

export const DEMO_ACTIVITY_SEEDS: DemoActivitySeed[] = [
  // Searches
  { activity_type: 'search', item_type: 'movie', item_id: '', item_name: '', query: 'interstellar', hours_ago: 2 },
  { activity_type: 'search', item_type: 'movie', item_id: '', item_name: '', query: 'sci fi movies', hours_ago: 24 },
  { activity_type: 'search', item_type: 'movie', item_id: '', item_name: '', query: 'christopher nolan', hours_ago: 48 },
  { activity_type: 'search', item_type: 'product', item_id: '', item_name: '', query: 'wireless headphones', hours_ago: 5 },
  { activity_type: 'search', item_type: 'product', item_id: '', item_name: '', query: 'mechanical keyboard', hours_ago: 72 },

  // Movie ratings
  { activity_type: 'rate_movie', item_type: 'movie', item_id: 'm-interstellar', item_name: 'Interstellar', rating_value: 5, hours_ago: 3 },
  { activity_type: 'rate_movie', item_type: 'movie', item_id: 'm-dark-knight', item_name: 'The Dark Knight', rating_value: 5, hours_ago: 30 },
  { activity_type: 'rate_movie', item_type: 'movie', item_id: 'm-inception', item_name: 'Inception', rating_value: 4, hours_ago: 50 },
  { activity_type: 'rate_movie', item_type: 'movie', item_id: 'm-matrix', item_name: 'The Matrix', rating_value: 5, hours_ago: 100 },
  { activity_type: 'rate_movie', item_type: 'movie', item_id: 'm-frozen', item_name: 'Frozen', rating_value: 2, hours_ago: 200 },

  // Watch history (partial watches = "continue watching")
  { activity_type: 'watch_movie', item_type: 'movie', item_id: 'm-dune', item_name: 'Dune', hours_ago: 8 },
  { activity_type: 'watch_movie', item_type: 'movie', item_id: 'm-oppenheimer', item_name: 'Oppenheimer', hours_ago: 20 },
  { activity_type: 'watch_movie', item_type: 'movie', item_id: 'm-john-wick', item_name: 'John Wick', hours_ago: 60 },

  // Product views
  { activity_type: 'view_product', item_type: 'product', item_id: 'p-headphones', item_name: 'AuraSound Wireless Headphones', hours_ago: 4 },
  { activity_type: 'view_product', item_type: 'product', item_id: 'p-keyboard', item_name: 'TypeForge Mechanical Keyboard', hours_ago: 72 },
  { activity_type: 'view_product', item_type: 'product', item_id: 'p-speaker', item_name: 'SoundWave Portable Speaker', hours_ago: 6 },

  // Product ratings
  { activity_type: 'rate_product', item_type: 'product', item_id: 'p-headphones', item_name: 'AuraSound Wireless Headphones', rating_value: 5, hours_ago: 4 },
  { activity_type: 'rate_product', item_type: 'product', item_id: 'p-keyboard', item_name: 'TypeForge Mechanical Keyboard', rating_value: 4, hours_ago: 70 },

  // Purchase
  { activity_type: 'purchase_product', item_type: 'product', item_id: 'p-smartwatch', item_name: 'PulseFit Smartwatch Pro', hours_ago: 120 },

  // Watchlist
  { activity_type: 'add_watchlist', item_type: 'movie', item_id: 'm-blade-runner-2049', item_name: 'Blade Runner 2049', hours_ago: 15 },
  { activity_type: 'add_watchlist', item_type: 'movie', item_id: 'm-arrival', item_name: 'Arrival', hours_ago: 40 },
];

// "Similar users" — synthetic preference vectors for the "Similar Users Like You" feature.
export const SIMILAR_USERS = [
  { name: 'Alex K.', matchPercent: 87, likedItems: ['Interstellar', 'Inception', 'Dune', 'Blade Runner 2049', 'The Matrix'] },
  { name: 'Sarah M.', matchPercent: 82, likedItems: ['The Dark Knight', 'Oppenheimer', 'Inception', 'Arrival'] },
  { name: 'James L.', matchPercent: 79, likedItems: ['The Matrix', 'John Wick', 'Mad Max: Fury Road', 'Tenet'] },
  { name: 'Priya R.', matchPercent: 74, likedItems: ['Interstellar', 'Arrival', 'Everything Everywhere All at Once', 'Spirited Away'] },
];
