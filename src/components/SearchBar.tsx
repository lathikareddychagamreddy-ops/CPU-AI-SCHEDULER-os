import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { DEMO_MOVIES, DEMO_PRODUCTS } from '@/lib/demoData';
import { fuzzySearch, spellCorrect } from '@/lib/dsa';
import { useApp } from '@/context/AppContext';

export function SearchBar({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<
    { id: string; name: string; type: 'movie' | 'product'; similarity: number }[]
  >([]);
  const [correction, setCorrection] = useState<{ name: string } | null>(null);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const { logActivity } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);

  const dictionary = [
    ...DEMO_MOVIES.map((m) => ({ id: m.id, name: m.title, type: 'movie' as const })),
    ...DEMO_PRODUCTS.map((p) => ({ id: p.id, name: p.name, type: 'product' as const })),
  ];

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setCorrection(null);
      return;
    }

    // Fuzzy search for suggestions
    const results = fuzzySearch(query, dictionary, 0.3).slice(0, 6);
    setSuggestions(results);

    // Spell correction — only if no exact match and query looks misspelled
    const exactMatch = dictionary.find(
      (d) => d.name.toLowerCase() === query.toLowerCase()
    );
    if (!exactMatch && query.trim().length >= 3) {
      const correction = spellCorrect(query, dictionary, 0.5);
      setCorrection(
        correction && correction.name.toLowerCase() !== query.toLowerCase()
          ? { name: correction.name }
          : null
      );
    } else {
      setCorrection(null);
    }
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSearch() {
    if (query.trim()) {
      logActivity('search', 'movie', null, null, query.trim());
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowResults(false);
    }
  }

  function handleSuggestionClick(suggestion: { id: string; name: string; type: 'movie' | 'product' }) {
    logActivity('search', suggestion.type, suggestion.id, suggestion.name, suggestion.name);
    navigate(`/search?q=${encodeURIComponent(suggestion.name)}`);
    setQuery('');
    setShowResults(false);
  }

  function handleCorrectionClick() {
    if (correction) {
      setQuery(correction.name);
      logActivity('search', 'movie', null, null, correction.name);
      navigate(`/search?q=${encodeURIComponent(correction.name)}`);
      setShowResults(false);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowResults(true)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search movies & products..."
          className={`w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all ${
            compact ? 'py-2' : 'py-2.5'
          }`}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              setCorrection(null);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showResults && (suggestions.length > 0 || correction) && (
        <div className="absolute top-full mt-2 w-full rounded-xl bg-slate-800/95 backdrop-blur-md border border-slate-700 shadow-2xl z-50 overflow-hidden">
          {correction && (
            <button
              onClick={handleCorrectionClick}
              className="w-full px-4 py-2.5 text-left text-sm text-cyan-400 hover:bg-slate-700/50 transition-colors border-b border-slate-700/50"
            >
              Did you mean <span className="font-semibold">"{correction.name}"</span>?
            </button>
          )}
          {suggestions.map((s) => (
            <button
              key={`${s.type}-${s.id}`}
              onClick={() => handleSuggestionClick(s)}
              className="w-full px-4 py-2.5 text-left hover:bg-slate-700/50 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">
                  {s.type}
                </span>
                <span className="text-sm text-slate-200">{s.name}</span>
              </div>
              <span className="text-xs text-slate-500">{Math.round(s.similarity * 100)}% match</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
