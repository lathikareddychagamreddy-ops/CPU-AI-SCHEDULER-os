import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, Search, Users, Play, ShoppingBag, ArrowRight, Info } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {
  generateRecommendations,
  getContinueWatching,
  getBasedOnSearches,
  getTrendingMovies,
  getPopularProducts,
  getSimilarUsers,
} from '@/lib/recommendationEngine';
import { MovieCard } from '@/components/MovieCard';
import { ProductCard } from '@/components/ProductCard';
import { ScoreBadge } from '@/components/ScoreBadge';

export function DashboardPage() {
  const { activities, user } = useApp();

  const recs = useMemo(() => generateRecommendations(activities, 10), [activities]);
  const continueWatching = useMemo(() => getContinueWatching(activities), [activities]);
  const basedOnSearches = useMemo(() => getBasedOnSearches(activities), [activities]);
  const trending = useMemo(() => getTrendingMovies(6), []);
  const popular = useMemo(() => getPopularProducts(4), []);
  const similarUsers = useMemo(() => getSimilarUsers(), []);

  const displayName = user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">
            Welcome back, {displayName}
          </h1>
          <p className="text-slate-400 text-sm">
            Here's what we think you'll love, based on your activity
          </p>
        </div>

        {/* Recommended For You — Movies */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold">Recommended For You</h2>
            </div>
            <Link to="/movies" className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recs.movies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {recs.movies.slice(0, 10).map((rec) => (
                <MovieCard key={rec.item.id} movie={rec.item} recommendation={rec} showReason />
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-8 text-center text-slate-500">
              <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
              Start searching and rating to get personalized recommendations
            </div>
          )}
        </section>

        {/* Recommended Products */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold">Products You Might Like</h2>
            </div>
            <Link to="/products" className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recs.products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {recs.products.map((rec) => (
                <ProductCard key={rec.item.id} product={rec.item} recommendation={rec} showReason />
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-8 text-center text-slate-500">
              Browse some products to get recommendations
            </div>
          )}
        </section>

        {/* Continue Watching */}
        {continueWatching.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Play className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold">Continue Watching</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {continueWatching.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </section>
        )}

        {/* Based on Your Searches */}
        {(basedOnSearches.movies.length > 0 || basedOnSearches.products.length > 0) && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold">Based on Your Searches</h2>
            </div>
            {basedOnSearches.movies.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
                {basedOnSearches.movies.slice(0, 5).map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            )}
            {basedOnSearches.products.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {basedOnSearches.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Trending Movies */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold">Trending Movies</h2>
            </div>
            <Link to="/movies" className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {trending.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>

        {/* Popular Products */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold">Popular Products</h2>
            </div>
            <Link to="/products" className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {popular.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Similar Users */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold">Similar Users Like You</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {similarUsers.map((user) => (
              <div
                key={user.name}
                className="rounded-2xl bg-slate-800/40 border border-slate-700/50 p-5 hover:border-slate-600 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-sm">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.likedItems.length} liked items</p>
                    </div>
                  </div>
                  <ScoreBadge score={user.matchPercent} size="sm" />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {user.likedItems.slice(0, 3).map((item) => (
                    <span key={item} className="text-xs px-2 py-1 rounded-lg bg-slate-700/50 text-slate-300">
                      {item}
                    </span>
                  ))}
                  {user.likedItems.length > 3 && (
                    <span className="text-xs px-2 py-1 text-slate-500">
                      +{user.likedItems.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
