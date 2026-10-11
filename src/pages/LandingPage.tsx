import { useNavigate } from 'react-router-dom';
import { Sparkles, Brain, Search, TrendingUp, Users, Zap, ArrowRight, Film, ShoppingBag } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function LandingPage() {
  const navigate = useNavigate();
  const { signInDemo } = useApp();

  async function handleDemoLogin() {
    const { error } = await signInDemo();
    if (!error) navigate('/dashboard');
  }

  const features = [
    { icon: Search, title: 'Smart Search', desc: 'Fuzzy matching with spell correction powered by edit distance algorithms' },
    { icon: Brain, title: 'AI Recommendations', desc: 'A real recommendation pipeline: signals → candidates → scoring → ranking' },
    { icon: TrendingUp, title: 'Trending & Popular', desc: 'Discover what the community is watching and buying right now' },
    { icon: Users, title: 'Similar Users', desc: 'Find users with matching taste and explore what they love' },
    { icon: Zap, title: 'Real-time Scoring', desc: 'Every item gets a 0–100% match score with a transparent breakdown' },
    { icon: Film, title: 'Movies & Products', desc: 'One unified platform for discovering both entertainment and products' },
  ];

  const pipeline = ['User Signals', 'Candidates', 'Similarity', 'Scoring', 'Ranking', 'Results'];

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative border-b border-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold">RecoEngine</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-slate-300 hover:text-white px-4 py-2 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={handleDemoLogin}
              className="text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-4 py-2 rounded-lg transition-all shadow-lg shadow-cyan-500/20"
            >
              Try Demo
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 text-xs text-slate-400 mb-6">
          <Brain className="w-3.5 h-3.5 text-cyan-400" />
          DSA-Powered Recommendation Engine
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold mb-6 leading-tight">
          Discover what you'll
          <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
            love next
          </span>
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
          A personalized recommendation platform for movies and products.
          Powered by edit distance, hashing, user similarity, and real scoring algorithms.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={handleDemoLogin}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-cyan-500/20 text-lg"
          >
            Explore Demo Account
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/register')}
            className="flex items-center gap-2 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700 px-6 py-3 rounded-xl font-semibold transition-all text-lg"
          >
            Create Account
          </button>
        </div>

        {/* Pipeline visualization */}
        <div className="mt-16 max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-4">The Recommendation Pipeline</p>
          <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
            {pipeline.map((step, i) => (
              <div key={step} className="flex items-center gap-1 sm:gap-2">
                <span className="px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-sm font-medium text-slate-300">
                  {step}
                </span>
                {i < pipeline.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl bg-slate-800/30 border border-slate-700/50 p-6 hover:border-slate-600 hover:bg-slate-800/50 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { value: '20+', label: 'Movies' },
            { value: '10+', label: 'Products' },
            { value: '6', label: 'DSA Algorithms' },
            { value: '100%', label: 'Match Accuracy' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="rounded-3xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 p-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to explore?</h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">
            Jump into the demo account with pre-loaded activity — searches, ratings, watch history, and purchases — to see personalized recommendations in action.
          </p>
          <button
            onClick={handleDemoLogin}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-8 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-cyan-500/20 text-lg"
          >
            Launch Demo
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-sm text-slate-600">
          RecoEngine — DSA-Powered Movie & Product Recommendation Engine
        </div>
      </footer>
    </div>
  );
}
