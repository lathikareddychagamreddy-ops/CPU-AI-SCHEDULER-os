import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingCart, Plus, Check } from 'lucide-react';
import type { Product, RecommendationResult } from '@/types';
import { useApp } from '@/context/AppContext';
import { ScoreBadge } from '@/components/ScoreBadge';

interface ProductCardProps {
  product: Product;
  recommendation?: RecommendationResult;
  showReason?: boolean;
}

export function ProductCard({ product, recommendation, showReason }: ProductCardProps) {
  const { wishlistIds, toggleWishlist, addToCart, userRatings, logActivity } = useApp();
  const inWishlist = wishlistIds.has(product.id);
  const userRating = userRatings.get(product.id);

  const handleClick = () => {
    logActivity('view_product', 'product', product.id, product.name);
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-slate-800/40 border border-slate-700/50 transition-all duration-300 hover:scale-[1.02] hover:border-slate-600 hover:shadow-xl hover:shadow-cyan-500/10">
      <Link to={`/product/${product.id}`} onClick={handleClick}>
        {/* Image */}
        <div className="relative aspect-square bg-slate-900 overflow-hidden">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {recommendation && (
            <div className="absolute top-2 right-2 z-10">
              <ScoreBadge score={recommendation.score} size="sm" />
            </div>
          )}
        </div>
      </Link>

      {/* Wishlist button */}
      <button
        onClick={() => toggleWishlist(product.id, product.name)}
        className="absolute top-2 left-2 z-10 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        aria-label="Toggle wishlist"
      >
        {inWishlist ? <Heart className="w-4 h-4 fill-rose-500 text-rose-500" /> : <Heart className="w-4 h-4" />}
      </button>

      {/* Info */}
      <div className="p-3 space-y-2">
        <Link to={`/product/${product.id}`} onClick={handleClick}>
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-sm text-white truncate">{product.name}</h4>
          </div>
          <p className="text-xs text-slate-500">{product.brand} · {product.category}</p>
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span className="text-xs font-medium">{product.rating.toFixed(1)}</span>
          </div>
          <span className="text-lg font-bold text-white">${product.price.toFixed(2)}</span>
        </div>

        {userRating && (
          <div className="flex items-center gap-1 text-xs text-amber-400">
            <Star className="w-3 h-3 fill-amber-400" />
            <span>Your rating: {userRating}/5</span>
          </div>
        )}

        {showReason && recommendation && recommendation.reasons.length > 0 && (
          <p className="text-xs text-slate-400 italic line-clamp-2">
            {recommendation.reasons[0]}
          </p>
        )}

        {/* Add to cart */}
        <button
          onClick={() => addToCart(product.id, product.name, product.price)}
          className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-medium py-2 transition-all"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          Add to Cart
        </button>
      </div>
    </div>
  );
}
