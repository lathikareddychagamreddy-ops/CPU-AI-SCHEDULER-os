import { Link } from 'react-router-dom';
import { Plus, Check, Star, Clock } from 'lucide-react';
import type { Movie } from '@/types';
import type { RecommendationResult } from '@/types';
import { useApp } from '@/context/AppContext';
import { ScoreBadge } from '@/components/ScoreBadge';

interface MovieCardProps {
  movie: Movie;
  recommendation?: RecommendationResult;
  showReason?: boolean;
}

export function MovieCard({ movie, recommendation, showReason }: MovieCardProps) {
  const { watchlistIds, toggleWatchlist, userRatings, rateItem, logActivity } = useApp();
  const inWatchlist = watchlistIds.has(movie.id);
  const userRating = userRatings.get(movie.id);

  const handleClick = () => {
    logActivity('view_movie', 'movie', movie.id, movie.title);
  };

  return (
    <Link
      to={`/movie/${movie.id}`}
      onClick={handleClick}
      className="group relative block overflow-hidden rounded-2xl bg-slate-800/40 border border-slate-700/50 transition-all duration-300 hover:scale-[1.03] hover:border-slate-600 hover:shadow-2xl hover:shadow-blue-500/10"
    >
      {/* Poster */}
      <div className={`relative aspect-[2/3] bg-gradient-to-br ${movie.poster_gradient} flex items-center justify-center p-4`}>
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
        <h3 className="relative text-center text-2xl font-bold text-white drop-shadow-lg leading-tight">
          {movie.title}
        </h3>

        {/* Score badge */}
        {recommendation && (
          <div className="absolute top-2 right-2 z-10">
            <ScoreBadge score={recommendation.score} size="sm" />
          </div>
        )}

        {/* Watchlist button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWatchlist(movie.id, movie.title);
          }}
          className="absolute bottom-2 right-2 z-10 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          aria-label="Toggle watchlist"
        >
          {inWatchlist ? <Check className="w-4 h-4 text-emerald-400" /> : <Plus className="w-4 h-4" />}
        </button>

        {/* Duration */}
        <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 text-xs text-white/80 bg-black/40 rounded px-1.5 py-0.5">
          <Clock className="w-3 h-3" />
          {movie.duration_min}m
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-semibold text-sm text-white truncate">{movie.title}</h4>
          <span className="text-xs text-slate-500">{movie.year}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span className="text-xs font-medium">{movie.rating.toFixed(1)}</span>
          </div>
          <div className="flex gap-1 flex-wrap">
            {movie.genres.slice(0, 2).map((g) => (
              <span key={g} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-300">
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* User rating */}
        {userRating && (
          <div className="flex items-center gap-1 text-xs text-amber-400">
            <Star className="w-3 h-3 fill-amber-400" />
            <span>Your rating: {userRating}/5</span>
          </div>
        )}

        {/* Reason */}
        {showReason && recommendation && recommendation.reasons.length > 0 && (
          <p className="text-xs text-slate-400 italic line-clamp-2">
            {recommendation.reasons[0]}
          </p>
        )}
      </div>
    </Link>
  );
}
