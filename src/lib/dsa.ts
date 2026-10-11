// DSA implementations for the recommendation engine.
// Each function is used in the real recommendation pipeline — not decorative.

// ─── Edit Distance (Levenshtein) ─────────────────────────────────────────────
// O(m*n) DP table. Used for spell correction in search.
export function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,        // deletion
        dp[i][j - 1] + 1,        // insertion
        dp[i - 1][j - 1] + cost  // substitution
      );
    }
  }

  return dp[m][n];
}

// ─── String Similarity ───────────────────────────────────────────────────────
// Normalized similarity = 1 - (editDistance / maxLen). Range [0, 1].
export function stringSimilarity(a: string, b: string): number {
  const s1 = a.toLowerCase().trim();
  const s2 = b.toLowerCase().trim();
  if (s1 === s2) return 1;
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1;
  return 1 - editDistance(s1, s2) / maxLen;
}

// ─── Hashing (djb2) ──────────────────────────────────────────────────────────
// Used to hash genre/category tags into a fixed-size bitset for fast
// Jaccard similarity comparison. O(k) per string.
export function djb2Hash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & 0xffffffff;
  }
  return Math.abs(hash);
}

// Build a bloom-filter-like bitset from an array of tags.
// Returns a Set<number> of bit positions.
export function hashTagSet(tags: string[], bitSize = 128): Set<number> {
  const bits = new Set<number>();
  for (const tag of tags) {
    const h = djb2Hash(tag.toLowerCase());
    bits.add(h % bitSize);
  }
  return bits;
}

// ─── Jaccard Similarity on Hashed Sets ───────────────────────────────────────
// |A ∩ B| / |A ∪ B|. O(|A|+|B|). Used for item-item similarity by genre/tags.
export function jaccardSimilarity(setA: Set<number>, setB: Set<number>): number {
  if (setA.size === 0 && setB.size === 0) return 0;
  let intersection = 0;
  for (const v of setA) {
    if (setB.has(v)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

// Convenience: compute Jaccard similarity between two raw tag arrays.
export function tagJaccard(tagsA: string[], tagsB: string[]): number {
  return jaccardSimilarity(hashTagSet(tagsA), hashTagSet(tagsB));
}

// ─── Cosine Similarity for User Vectors ──────────────────────────────────────
// Users are represented as preference vectors keyed by genre/category.
// Cosine = dot(A,B) / (|A| * |B|). O(n) where n = vector length.
export function cosineSimilarity(
  vecA: Record<string, number>,
  vecB: Record<string, number>
): number {
  const keys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (const key of keys) {
    const a = vecA[key] || 0;
    const b = vecB[key] || 0;
    dot += a * b;
    magA += a * a;
    magB += b * b;
  }

  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

// ─── Randomized Candidate Selection ──────────────────────────────────────────
// Instead of scoring every item (O(N) per request), randomly sample k
// candidates from the pool, then score only those. Reduces per-request
// complexity from O(N * D) to O(k * D). Uses a seeded RNG for
// reproducibility within a session.
export function makeRNG(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function randomCandidateSelection<T>(
  pool: T[],
  k: number,
  rng: () => number
): T[] {
  if (pool.length <= k) return [...pool];
  const indices = new Set<number>();
  while (indices.size < k) {
    indices.add(Math.floor(rng() * pool.length));
  }
  return [...indices].map((i) => pool[i]);
}

// ─── Recommendation Scoring ──────────────────────────────────────────────────
// Weighted sum of normalized signals. Each signal is [0,1].
// Weights sum to 1.0 so the final score is [0,1] → multiply by 100 for %.
export interface ScoreSignals {
  genreMatch: number;    // similarity to user's preferred genres
  userRating: number;    // alignment with user's past ratings
  searchRelevance: number; // match with user's search history
  itemSimilarity: number;  // similarity to items the user interacted with
  similarUser: number;     // preference overlap with similar users
  popularity: number;      // global rating normalized
}

const WEIGHTS = {
  genreMatch: 0.20,
  userRating: 0.15,
  searchRelevance: 0.20,
  itemSimilarity: 0.20,
  similarUser: 0.15,
  popularity: 0.10,
};

export function computeScore(signals: ScoreSignals): number {
  const score =
    signals.genreMatch * WEIGHTS.genreMatch +
    signals.userRating * WEIGHTS.userRating +
    signals.searchRelevance * WEIGHTS.searchRelevance +
    signals.itemSimilarity * WEIGHTS.itemSimilarity +
    signals.similarUser * WEIGHTS.similarUser +
    signals.popularity * WEIGHTS.popularity;
  return Math.round(Math.min(1, Math.max(0, score)) * 100);
}

// ─── Ranking (QuickSort partition) ───────────────────────────────────────────
// Sort items by score descending. O(N log N).
export function rankByScore<T extends { score: number }>(items: T[]): T[] {
  return quickSort([...items], (a, b) => b.score - a.score);
}

function quickSort<T>(arr: T[], compare: (a: T, b: T) => number): T[] {
  if (arr.length <= 1) return arr;
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter((x) => compare(x, pivot) < 0);
  const mid = arr.filter((x) => compare(x, pivot) === 0);
  const right = arr.filter((x) => compare(x, pivot) > 0);
  return [...quickSort(left, compare), ...mid, ...quickSort(right, compare)];
}

// ─── Spell Correction via Edit Distance ──────────────────────────────────────
// Finds the closest match in a dictionary by minimum edit distance.
// O(D * M * N) where D = dictionary size, M/N = string lengths.
export function spellCorrect(
  query: string,
  dictionary: { id: string; name: string }[],
  threshold = 0.5
): { id: string; name: string; editDistance: number; similarity: number } | null {
  let best: { id: string; name: string; editDistance: number; similarity: number } | null = null;
  for (const entry of dictionary) {
    const dist = editDistance(query.toLowerCase(), entry.name.toLowerCase());
    const sim = stringSimilarity(query, entry.name);
    if (!best || dist < best.editDistance) {
      best = { ...entry, editDistance: dist, similarity: sim };
    }
  }
  if (best && best.similarity >= threshold) return best;
  return null;
}

// ─── Fuzzy Search ────────────────────────────────────────────────────────────
// Returns all items sorted by similarity, above a threshold.
export function fuzzySearch(
  query: string,
  dictionary: { id: string; name: string }[],
  threshold = 0.3
): { id: string; name: string; similarity: number; editDistance: number }[] {
  const results = dictionary.map((entry) => {
    const sim = stringSimilarity(query, entry.name);
    const dist = editDistance(query.toLowerCase(), entry.name.toLowerCase());
    return { ...entry, similarity: sim, editDistance: dist };
  });
  return results
    .filter((r) => r.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity);
}
