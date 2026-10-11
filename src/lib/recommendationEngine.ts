import type { Movie, Product, UserActivity, RecommendationResult, ItemType } from '@/types';
import { DEMO_MOVIES, DEMO_PRODUCTS } from '@/lib/demoData';
import {
  tagJaccard,
  cosineSimilarity,
  computeScore,
  rankByScore,
  randomCandidateSelection,
  makeRNG,
  type ScoreSignals,
} from '@/lib/dsa';
import { SIMILAR_USERS } from '@/lib/demoUser';

// Build a user's preference vector from their activity.
// Genres → weighted by rating_value; product categories → weighted by views/purchases.
export function buildUserVector(activities: UserActivity[]): {
  genrePrefs: Record<string, number>;
  categoryPrefs: Record<string, number>;
  ratedMovies: Map<string, number>;
  ratedProducts: Map<string, number>;
  searchTerms: string[];
  interactedMovies: Set<string>;
  interactedProducts: Set<string>;
} {
  const genrePrefs: Record<string, number> = {};
  const categoryPrefs: Record<string, number> = {};
  const ratedMovies = new Map<string, number>();
  const ratedProducts = new Map<string, number>();
  const searchTerms: string[] = [];
  const interactedMovies = new Set<string>();
  const interactedProducts = new Set<string>();

  for (const act of activities) {
    if (act.activity_type === 'search' && act.query) {
      searchTerms.push(act.query.toLowerCase());
    }

    if (act.item_type === 'movie' && act.item_id) {
      const movie = DEMO_MOVIES.find((m) => m.id === act.item_id);
      if (!movie) continue;

      if (act.activity_type === 'rate_movie' && act.rating_value) {
        ratedMovies.set(act.item_id, act.rating_value);
        for (const g of movie.genres) {
          genrePrefs[g] = (genrePrefs[g] || 0) + act.rating_value;
        }
      }
      if (['watch_movie', 'view_movie', 'add_watchlist'].includes(act.activity_type)) {
        interactedMovies.add(act.item_id);
        for (const g of movie.genres) {
          genrePrefs[g] = (genrePrefs[g] || 0) + 2;
        }
      }
    }

    if (act.item_type === 'product' && act.item_id) {
      const product = DEMO_PRODUCTS.find((p) => p.id === act.item_id);
      if (!product) continue;

      if (act.activity_type === 'rate_product' && act.rating_value) {
        ratedProducts.set(act.item_id, act.rating_value);
        categoryPrefs[product.category] = (categoryPrefs[product.category] || 0) + act.rating_value;
      }
      if (['view_product', 'purchase_product', 'add_cart', 'add_wishlist'].includes(act.activity_type)) {
        interactedProducts.add(act.item_id);
        categoryPrefs[product.category] = (categoryPrefs[product.category] || 0) + 2;
      }
    }
  }

  return {
    genrePrefs,
    categoryPrefs,
    ratedMovies,
    ratedProducts,
    searchTerms,
    interactedMovies,
    interactedProducts,
  };
}

// Compute genre match signal for a movie [0, 1]
function genreMatchScore(movie: Movie, genrePrefs: Record<string, number>): number {
  if (Object.keys(genrePrefs).length === 0) return 0.3;
  let total = 0;
  let max = 0;
  for (const g of movie.genres) {
    total += genrePrefs[g] || 0;
  }
  const maxPossible = Math.max(...Object.values(genrePrefs)) * movie.genres.length;
  return maxPossible > 0 ? Math.min(1, total / maxPossible) : 0.3;
}

// Compute search relevance signal [0, 1]
function searchRelevanceScore(
  item: Movie | Product,
  itemType: ItemType,
  searchTerms: string[]
): number {
  if (searchTerms.length === 0) return 0;
  const name = itemType === 'movie' ? (item as Movie).title : (item as Product).name;
  const nameLower = name.toLowerCase();
  const tags = itemType === 'movie'
    ? (item as Movie).genres.join(' ').toLowerCase()
    : (item as Product).tags.join(' ').toLowerCase();

  let maxRelevance = 0;
  for (const term of searchTerms) {
    if (nameLower.includes(term)) {
      maxRelevance = Math.max(maxRelevance, 1);
    } else if (tags.includes(term)) {
      maxRelevance = Math.max(maxRelevance, 0.7);
    } else if (term.split(' ').some((w) => nameLower.includes(w) || tags.includes(w))) {
      maxRelevance = Math.max(maxRelevance, 0.4);
    }
  }
  return maxRelevance;
}

// Compute item similarity signal using Jaccard on genre/tag hashes [0, 1]
function itemSimilarityScore(
  item: Movie | Product,
  itemType: ItemType,
  interactedMovies: Set<string>,
  interactedProducts: Set<string>,
  ratedMovies: Map<string, number>,
  ratedProducts: Map<string, number>
): number {
  const itemTags = itemType === 'movie'
    ? (item as Movie).genres
    : (item as Product).tags;

  let maxSim = 0;
  if (itemType === 'movie') {
    for (const id of interactedMovies) {
      const other = DEMO_MOVIES.find((m) => m.id === id);
      if (other) {
        const sim = tagJaccard(itemTags, other.genres);
        const ratingWeight = (ratedMovies.get(id) || 3) / 5;
        maxSim = Math.max(maxSim, sim * ratingWeight);
      }
    }
  } else {
    for (const id of interactedProducts) {
      const other = DEMO_PRODUCTS.find((p) => p.id === id);
      if (other) {
        const sim = tagJaccard(itemTags, other.tags);
        const ratingWeight = (ratedProducts.get(id) || 3) / 5;
        maxSim = Math.max(maxSim, sim * ratingWeight);
      }
    }
  }
  return maxSim;
}

// Compute similar-user signal [0, 1]
function similarUserScore(itemName: string): number {
  let max = 0;
  for (const user of SIMILAR_USERS) {
    if (user.likedItems.some((name) => name.toLowerCase() === itemName.toLowerCase())) {
      max = Math.max(max, user.matchPercent / 100);
    }
  }
  return max;
}

// ─── Main Recommendation Pipeline ────────────────────────────────────────────
// USER SIGNALS → CANDIDATES → SIMILARITY → SCORING → RANKING → RESULTS
export function generateRecommendations(
  activities: UserActivity[],
  itemCount: number = 12
): { movies: RecommendationResult[]; products: RecommendationResult[] } {
  const userVec = buildUserVector(activities);
  const rng = makeRNG(Date.now() % 2147483647);

  // ── Candidate Generation (randomized selection from un-interacted items) ──
  const moviePool = DEMO_MOVIES.filter((m) => !userVec.interactedMovies.has(m.id));
  const productPool = DEMO_PRODUCTS.filter((p) => !userVec.interactedProducts.has(p.id));

  // Sample candidates (randomized selection reduces scoring complexity)
  const movieCandidates = randomCandidateSelection(moviePool, Math.min(moviePool.length, 15), rng);
  const productCandidates = randomCandidateSelection(productPool, Math.min(productPool.length, 8), rng);

  // ── Scoring ──
  const scoreMovie = (movie: Movie): RecommendationResult => {
    const signals: ScoreSignals = {
      genreMatch: genreMatchScore(movie, userVec.genrePrefs),
      userRating: userVec.ratedMovies.size > 0 ? movie.rating / 5 : 0.3,
      searchRelevance: searchRelevanceScore(movie, 'movie', userVec.searchTerms),
      itemSimilarity: itemSimilarityScore(
        movie, 'movie', userVec.interactedMovies, userVec.interactedProducts,
        userVec.ratedMovies, userVec.ratedProducts
      ),
      similarUser: similarUserScore(movie.title),
      popularity: movie.rating / 5,
    };
    const score = computeScore(signals);

    const reasons: string[] = [];
    if (signals.genreMatch > 0.5) reasons.push(`Matches your favorite genres: ${movie.genres.filter((g) => userVec.genrePrefs[g]).join(', ')}`);
    if (signals.searchRelevance > 0.5) reasons.push('Relevant to your recent searches');
    if (signals.itemSimilarity > 0.5) reasons.push('Similar to movies you\'ve watched and rated highly');
    if (signals.similarUser > 0.5) reasons.push('Loved by users with similar taste to yours');
    if (signals.popularity > 0.8) reasons.push('Highly rated by the community');
    if (reasons.length === 0) reasons.push('Trending now in your preferred categories');

    return { item: movie, itemType: 'movie', score, reasons, factors: signals };
  };

  const scoreProduct = (product: Product): RecommendationResult => {
    const signals: ScoreSignals = {
      genreMatch: categoryMatchScore(product, userVec.categoryPrefs),
      userRating: userVec.ratedProducts.size > 0 ? product.rating / 5 : 0.3,
      searchRelevance: searchRelevanceScore(product, 'product', userVec.searchTerms),
      itemSimilarity: itemSimilarityScore(
        product, 'product', userVec.interactedMovies, userVec.interactedProducts,
        userVec.ratedMovies, userVec.ratedProducts
      ),
      similarUser: 0,
      popularity: product.rating / 5,
    };
    const score = computeScore(signals);

    const reasons: string[] = [];
    if (signals.genreMatch > 0.5) reasons.push(`In ${product.category}, a category you frequently browse`);
    if (signals.searchRelevance > 0.5) reasons.push('Matches your recent product searches');
    if (signals.itemSimilarity > 0.5) reasons.push('Similar to products you\'ve viewed and rated');
    if (signals.popularity > 0.8) reasons.push('Top-rated by shoppers');
    if (reasons.length === 0) reasons.push('Popular right now in your interested categories');

    return { item: product, itemType: 'product', score, reasons, factors: signals };
  };

  // ── Parallel/Concurrent Processing ──
  // Score movies and products simultaneously (Promise.all pattern, but synchronous here)
  const scoredMovies = movieCandidates.map(scoreMovie);
  const scoredProducts = productCandidates.map(scoreProduct);

  // ── Ranking ──
  const rankedMovies = rankByScore(scoredMovies).slice(0, itemCount);
  const rankedProducts = rankByScore(scoredProducts).slice(0, itemCount);

  return { movies: rankedMovies, products: rankedProducts };
}

function categoryMatchScore(product: Product, categoryPrefs: Record<string, number>): number {
  if (Object.keys(categoryPrefs).length === 0) return 0.3;
  const pref = categoryPrefs[product.category] || 0;
  const max = Math.max(...Object.values(categoryPrefs));
  return max > 0 ? Math.min(1, pref / max) : 0.3;
}

// ─── Continue Watching ───────────────────────────────────────────────────────
export function getContinueWatching(activities: UserActivity[]): Movie[] {
  const watched = activities
    .filter((a) => a.activity_type === 'watch_movie' && a.item_id)
    .map((a) => a.item_id!);
  const movies = watched
    .map((id) => DEMO_MOVIES.find((m) => m.id === id))
    .filter((m): m is Movie => m !== undefined);
  // Deduplicate
  const seen = new Set<string>();
  return movies.filter((m) => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
}

// ─── Based on Your Searches ──────────────────────────────────────────────────
export function getBasedOnSearches(activities: UserActivity[]): { movies: Movie[]; products: Product[] } {
  const searches = activities
    .filter((a) => a.activity_type === 'search' && a.query)
    .map((a) => a.query!.toLowerCase());

  if (searches.length === 0) return { movies: [], products: [] };

  const matchedMovies = DEMO_MOVIES.filter((m) => {
    const text = (m.title + ' ' + m.genres.join(' ') + ' ' + m.director).toLowerCase();
    return searches.some((s) => text.includes(s) || s.split(' ').some((w) => text.includes(w)));
  }).slice(0, 6);

  const matchedProducts = DEMO_PRODUCTS.filter((p) => {
    const text = (p.name + ' ' + p.category + ' ' + p.tags.join(' ') + ' ' + p.brand).toLowerCase();
    return searches.some((s) => text.includes(s) || s.split(' ').some((w) => text.includes(w)));
  }).slice(0, 4);

  return { movies: matchedMovies, products: matchedProducts };
}

// ─── Trending (by rating) ────────────────────────────────────────────────────
export function getTrendingMovies(count = 8): Movie[] {
  return [...DEMO_MOVIES].sort((a, b) => b.rating - a.rating).slice(0, count);
}

export function getPopularProducts(count = 6): Product[] {
  return [...DEMO_PRODUCTS].sort((a, b) => b.rating - a.rating).slice(0, count);
}

// ─── Similar Items (by Jaccard on tags/genres) ───────────────────────────────
export function getSimilarMovies(movieId: string, count = 6): Movie[] {
  const movie = DEMO_MOVIES.find((m) => m.id === movieId);
  if (!movie) return [];
  const scored = DEMO_MOVIES
    .filter((m) => m.id !== movieId)
    .map((m) => ({ movie: m, sim: tagJaccard(movie.genres, m.genres) }));
  return rankByScore(scored.map((s) => ({ ...s, score: s.sim * 100 })))
    .slice(0, count)
    .map((s) => (s as { movie: Movie; sim: number }).movie);
}

export function getSimilarProducts(productId: string, count = 4): Product[] {
  const product = DEMO_PRODUCTS.find((p) => p.id === productId);
  if (!product) return [];
  const scored = DEMO_PRODUCTS
    .filter((p) => p.id !== productId)
    .map((p) => ({ product: p, sim: tagJaccard(product.tags, p.tags) }));
  return rankByScore(scored.map((s) => ({ ...s, score: s.sim * 100 })))
    .slice(0, count)
    .map((s) => (s as { product: Product; sim: number }).product);
}

// ─── Similar Users ───────────────────────────────────────────────────────────
export function getSimilarUsers() {
  return SIMILAR_USERS;
}

// ─── User Similarity via Cosine on Genre Vectors ─────────────────────────────
export function computeUserSimilarity(
  userA: Record<string, number>,
  userB: Record<string, number>
): number {
  return cosineSimilarity(userA, userB);
}
