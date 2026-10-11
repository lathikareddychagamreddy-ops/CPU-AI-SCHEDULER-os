import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { DEMO_USER_EMAIL, DEMO_USER_PASSWORD, DEMO_ACTIVITY_SEEDS } from '@/lib/demoUser';
import type { UserActivity, ActivityType, ItemType } from '@/types';

interface AppContextValue {
  // Auth
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  signInDemo: () => Promise<{ error: string | null }>;

  // Activity
  activities: UserActivity[];
  logActivity: (
    activityType: ActivityType,
    itemType: ItemType,
    itemId: string | null,
    itemName: string | null,
    query?: string,
    ratingValue?: number
  ) => Promise<void>;
  refreshActivities: () => Promise<void>;

  // Ratings
  userRatings: Map<string, number>;
  rateItem: (itemType: ItemType, itemId: string, itemName: string, rating: number) => Promise<void>;

  // Watchlist
  watchlistIds: Set<string>;
  toggleWatchlist: (movieId: string, movieName: string) => Promise<void>;

  // Wishlist
  wishlistIds: Set<string>;
  toggleWishlist: (productId: string, productName: string) => Promise<void>;

  // Cart
  cartItems: { productId: string; productName: string; quantity: number; price: number }[];
  addToCart: (productId: string, productName: string, price: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  cartCount: number;

  // Toasts
  toasts: { id: string; message: string; type: 'success' | 'error' | 'info' }[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [userRatings, setUserRatings] = useState<Map<string, number>>(new Map());
  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(new Set());
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [cartItems, setCartItems] = useState<
    { productId: string; productName: string; quantity: number; price: number }[]
  >([]);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([]);

  // ── Toast helpers ──
  function showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }

  function dismissToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  // ── Auth state ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, sess) => {
      (async () => {
        setSession(sess);
        setUser(sess?.user ?? null);
        if (sess?.user) {
          await loadUserData(sess.user.id);
        } else {
          setActivities([]);
          setUserRatings(new Map());
          setWatchlistIds(new Set());
          setWishlistIds(new Set());
          setCartItems([]);
        }
      })();
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  async function loadUserData(userId: string) {
    const [actRes, ratingsRes, watchRes, wishRes, cartRes] = await Promise.all([
      supabase.from('user_activity').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('ratings').select('*').eq('user_id', userId),
      supabase.from('watchlist').select('movie_id').eq('user_id', userId),
      supabase.from('wishlist').select('product_id').eq('user_id', userId),
      supabase.from('cart').select('product_id, quantity').eq('user_id', userId),
    ]);

    if (actRes.data) setActivities(actRes.data as UserActivity[]);

    const ratingsMap = new Map<string, number>();
    if (ratingsRes.data) {
      for (const r of ratingsRes.data) {
        ratingsMap.set(r.item_id, r.rating_value);
      }
    }
    setUserRatings(ratingsMap);

    const watchSet = new Set<string>();
    if (watchRes.data) {
      for (const w of watchRes.data) watchSet.add(w.movie_id);
    }
    setWatchlistIds(watchSet);

    const wishSet = new Set<string>();
    if (wishRes.data) {
      for (const w of wishRes.data) wishSet.add(w.product_id);
    }
    setWishlistIds(wishSet);

    // Cart needs product info for names/prices — load from local DEMO_PRODUCTS
    const cart: { productId: string; productName: string; quantity: number; price: number }[] = [];
    if (cartRes.data) {
      const { DEMO_PRODUCTS } = await import('@/lib/demoData');
      for (const c of cartRes.data) {
        const product = DEMO_PRODUCTS.find((p) => p.id === c.product_id);
        if (product) {
          cart.push({ productId: c.product_id, productName: product.name, quantity: c.quantity, price: product.price });
        }
      }
    }
    setCartItems(cart);
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      await supabase.from('profiles').insert({
        user_id: data.user.id,
        display_name: email.split('@')[0],
      });
    }
    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function signInDemo() {
    // Try to sign in with demo credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email: DEMO_USER_EMAIL,
      password: DEMO_USER_PASSWORD,
    });

    if (error) {
      // Demo user doesn't exist yet — create it
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: DEMO_USER_EMAIL,
        password: DEMO_USER_PASSWORD,
      });
      if (signUpError) return { error: signUpError.message };

      if (signUpData.user) {
        await supabase.from('profiles').insert({
          user_id: signUpData.user.id,
          display_name: 'Demo User',
        });

        // Seed demo activity
        const now = new Date();
        const activityRows = DEMO_ACTIVITY_SEEDS.map((seed) => ({
          user_id: signUpData.user!.id,
          activity_type: seed.activity_type,
          item_type: seed.item_type,
          item_id: seed.item_id || null,
          item_name: seed.item_name || null,
          query: seed.query || null,
          rating_value: seed.rating_value || null,
          created_at: new Date(now.getTime() - seed.hours_ago * 3600000).toISOString(),
        }));
        await supabase.from('user_activity').insert(activityRows);

        // Seed ratings
        const ratingRows = DEMO_ACTIVITY_SEEDS.filter((s) => s.rating_value && s.item_id).map((s) => ({
          user_id: signUpData.user!.id,
          item_type: s.item_type,
          item_id: s.item_id,
          rating_value: s.rating_value,
        }));
        if (ratingRows.length > 0) {
          await supabase.from('ratings').insert(ratingRows);
        }

        // Seed watchlist
        const watchlistRows = DEMO_ACTIVITY_SEEDS.filter((s) => s.activity_type === 'add_watchlist' && s.item_id).map((s) => ({
          user_id: signUpData.user!.id,
          movie_id: s.item_id,
        }));
        if (watchlistRows.length > 0) {
          await supabase.from('watchlist').insert(watchlistRows);
        }
      }

      // Now sign in
      const { error: signInError2 } = await supabase.auth.signInWithPassword({
        email: DEMO_USER_EMAIL,
        password: DEMO_USER_PASSWORD,
      });
      if (signInError2) return { error: signInError2.message };
    }

    return { error: null };
  }

  async function logActivity(
    activityType: ActivityType,
    itemType: ItemType,
    itemId: string | null,
    itemName: string | null,
    query?: string,
    ratingValue?: number
  ) {
    if (!user) return;
    const row = {
      user_id: user.id,
      activity_type: activityType,
      item_type: itemType,
      item_id: itemId,
      item_name: itemName,
      query: query || null,
      rating_value: ratingValue || null,
    };
    const { data } = await supabase.from('user_activity').insert(row).select().single();
    if (data) {
      setActivities((prev) => [data as UserActivity, ...prev]);
    }
  }

  async function refreshActivities() {
    if (!user) return;
    const { data } = await supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setActivities(data as UserActivity[]);
  }

  async function rateItem(itemType: ItemType, itemId: string, itemName: string, rating: number) {
    if (!user) return;

    // Upsert rating
    const existing = userRatings.get(itemId);
    if (existing) {
      await supabase.from('ratings').update({ rating_value: rating }).eq('user_id', user.id).eq('item_id', itemId);
    } else {
      await supabase.from('ratings').insert({
        user_id: user.id,
        item_type: itemType,
        item_id: itemId,
        rating_value: rating,
      });
    }

    setUserRatings((prev) => {
      const next = new Map(prev);
      next.set(itemId, rating);
      return next;
    });

    await logActivity(
      itemType === 'movie' ? 'rate_movie' : 'rate_product',
      itemType,
      itemId,
      itemName,
      undefined,
      rating
    );

    showToast(`Rated ${itemName} ${rating} star${rating > 1 ? 's' : ''}`, 'success');
  }

  async function toggleWatchlist(movieId: string, movieName: string) {
    if (!user) return;
    if (watchlistIds.has(movieId)) {
      await supabase.from('watchlist').delete().eq('user_id', user.id).eq('movie_id', movieId);
      setWatchlistIds((prev) => {
        const next = new Set(prev);
        next.delete(movieId);
        return next;
      });
      showToast(`Removed ${movieName} from watchlist`, 'info');
    } else {
      await supabase.from('watchlist').insert({ user_id: user.id, movie_id: movieId });
      setWatchlistIds((prev) => new Set(prev).add(movieId));
      await logActivity('add_watchlist', 'movie', movieId, movieName);
      showToast(`Added ${movieName} to watchlist`, 'success');
    }
  }

  async function toggleWishlist(productId: string, productName: string) {
    if (!user) return;
    if (wishlistIds.has(productId)) {
      await supabase.from('wishlist').delete().eq('user_id', user.id).eq('product_id', productId);
      setWishlistIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
      showToast(`Removed ${productName} from wishlist`, 'info');
    } else {
      await supabase.from('wishlist').insert({ user_id: user.id, product_id: productId });
      setWishlistIds((prev) => new Set(prev).add(productId));
      await logActivity('add_wishlist', 'product', productId, productName);
      showToast(`Added ${productName} to wishlist`, 'success');
    }
  }

  async function addToCart(productId: string, productName: string, price: number) {
    if (!user) return;
    const existing = cartItems.find((c) => c.productId === productId);
    if (existing) {
      await supabase.from('cart').update({ quantity: existing.quantity + 1 }).eq('user_id', user.id).eq('product_id', productId);
      setCartItems((prev) =>
        prev.map((c) => (c.productId === productId ? { ...c, quantity: c.quantity + 1 } : c))
      );
    } else {
      await supabase.from('cart').insert({ user_id: user.id, product_id: productId, quantity: 1 });
      setCartItems((prev) => [...prev, { productId, productName, quantity: 1, price }]);
    }
    await logActivity('add_cart', 'product', productId, productName);
    showToast(`Added ${productName} to cart`, 'success');
  }

  async function removeFromCart(productId: string) {
    if (!user) return;
    await supabase.from('cart').delete().eq('user_id', user.id).eq('product_id', productId);
    setCartItems((prev) => prev.filter((c) => c.productId !== productId));
  }

  const cartCount = cartItems.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <AppContext.Provider
      value={{
        session,
        user,
        loading,
        signIn,
        signUp,
        signOut,
        signInDemo,
        activities,
        logActivity,
        refreshActivities,
        userRatings,
        rateItem,
        watchlistIds,
        toggleWatchlist,
        wishlistIds,
        toggleWishlist,
        cartItems,
        addToCart,
        removeFromCart,
        cartCount,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
