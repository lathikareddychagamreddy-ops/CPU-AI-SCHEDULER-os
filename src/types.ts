export interface Movie {
  id: string;
  title: string;
  genres: string[];
  poster_gradient: string;
  rating: number;
  year: number;
  description: string;
  director: string;
  cast: string[];
  duration_min: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  image_url: string;
  rating: number;
  description: string;
  tags: string[];
}

export type ActivityType =
  | 'search'
  | 'view_movie'
  | 'view_product'
  | 'watch_movie'
  | 'purchase_product'
  | 'rate_movie'
  | 'rate_product'
  | 'add_watchlist'
  | 'add_cart'
  | 'add_wishlist';

export type ItemType = 'movie' | 'product';

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  item_type: ItemType;
  item_id: string | null;
  item_name: string | null;
  query: string | null;
  rating_value: number | null;
  created_at: string;
}

export interface RatingRecord {
  id: string;
  user_id: string;
  item_type: ItemType;
  item_id: string;
  rating_value: number;
}

export interface RecommendationResult {
  item: Movie | Product;
  itemType: ItemType;
  score: number;
  reasons: string[];
  factors: {
    genreMatch: number;
    userRating: number;
    searchRelevance: number;
    itemSimilarity: number;
    similarUser: number;
    popularity: number;
  };
}

export interface SearchSuggestion {
  id: string;
  name: string;
  type: ItemType;
  editDistance: number;
  similarity: number;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
