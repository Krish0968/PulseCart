import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { Laptop, Gamepad2, Refrigerator, Shirt, BookOpen, Dumbbell, Sparkles, Smile, ArrowRight } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  
  const [categories, setCategories] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recomputing, setRecomputing] = useState(false);

  // Map category slugs to pretty Lucide Icons for high aesthetics
  const getCategoryIcon = (slug) => {
    switch (slug) {
      case 'electronics': return <Laptop className="h-7 w-7 text-indigo-500" />;
      case 'gaming': return <Gamepad2 className="h-7 w-7 text-purple-500" />;
      case 'home-appliances': return <Refrigerator className="h-7 w-7 text-blue-500" />;
      case 'fashion': return <Shirt className="h-7 w-7 text-pink-500" />;
      case 'books': return <BookOpen className="h-7 w-7 text-green-500" />;
      case 'sports-outdoors': return <Dumbbell className="h-7 w-7 text-red-500" />;
      case 'beauty-personal-care': return <Sparkles className="h-7 w-7 text-yellow-500" />;
      case 'toys-games': return <Smile className="h-7 w-7 text-teal-500" />;
      default: return <Sparkles className="h-7 w-7 text-primary-500" />;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch Categories
        const catRes = await api.get('/categories');
        setCategories(catRes.data);

        // Fetch Trending Products
        const prodRes = await api.get('/products?page=0&size=8');
        setTrendingProducts(prodRes.data.content || []);

        // Fetch Personalized Recommendations (if logged in)
        if (user) {
          try {
            const recRes = await api.get('/recommendations');
            setRecommendations(recRes.data || []);
          } catch (recErr) {
            console.log('Recommendations API not available or empty yet:', recErr);
          }
        }
      } catch (err) {
        console.error('Error loading homepage data:', err);
        setError('Failed to load products. Make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleRecomputeRecommendations = async () => {
    setRecomputing(true);
    try {
      await api.post('/recommendations/recompute');
      const recRes = await api.get('/recommendations');
      setRecommendations(recRes.data || []);
    } catch (err) {
      console.error('Failed to recompute recommendations:', err);
    } finally {
      setRecomputing(false);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary-950 via-primary-900 to-indigo-950 text-white rounded-3xl py-20 px-8 md:px-16 mx-auto max-w-7xl mt-6 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-6">
          <span className="inline-flex items-center rounded-full bg-primary-800/60 px-3 py-1 text-xs font-semibold text-primary-200 ring-1 ring-inset ring-primary-500/30">
            Welcome to the future of retail
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
            Experience Personalization Like Never Before
          </h1>
          <p className="text-lg text-primary-200">
            PulseCart tracks your views, search history, and cart behavior to build a custom shopping experience that evolves with your taste.
          </p>
          <div className="flex gap-4">
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary-950 hover:bg-gray-100 transition-colors shadow-lg"
            >
              Browse Catalog
            </Link>
            {!user && (
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-full bg-primary-800/40 border border-primary-500/30 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-800/60 transition-colors"
              >
                Create Account
              </Link>
            )}
          </div>
        </div>
        {/* Abstract background graphics */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 hidden lg:block bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-primary-200 via-primary-500 to-transparent"></div>
      </section>

      {/* Loading Skeleton State */}
      {loading ? (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Categories Grid Skeleton */}
          <div className="space-y-4">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>
          {/* Products Grid Skeleton */}
          <div className="space-y-4">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-80 bg-gray-100 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700 text-center">
              {error}
            </div>
          )}

          {/* Categories Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">Explore Categories</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className="flex flex-col items-center justify-center p-5 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-primary-100 hover:-translate-y-1 transition-all text-center group"
                >
                  <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-primary-50 transition-colors mb-3">
                    {getCategoryIcon(cat.slug)}
                  </div>
                  <span className="text-xs font-semibold text-gray-700 group-hover:text-primary-700">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Recommendations Section (Only when logged in and recommendations exist) */}
          {user && recommendations.length > 0 && (
            <section className="space-y-6 bg-gradient-to-b from-primary-50/50 to-transparent p-6 rounded-3xl border border-primary-100/30">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900">Recommended For You</h2>
                  <p className="text-sm text-gray-500 mt-1">Products handpicked based on your search and purchase history</p>
                </div>
                <button
                  onClick={handleRecomputeRecommendations}
                  disabled={recomputing}
                  className="rounded-full bg-primary-50 border border-primary-200 px-4 py-2 text-xs font-bold text-primary-700 hover:bg-primary-100 transition-colors shadow-sm disabled:opacity-50"
                >
                  {recomputing ? 'Recomputing...' : 'Recompute Recommendations'}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {recommendations.map((prod) => (
                  <div key={prod.id} className="relative">
                    <ProductCard product={prod} />
                    {prod.explanation && (
                      <span className="absolute left-3 top-3 z-20 rounded bg-primary-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider shadow">
                        {prod.explanation}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Trending Products Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Trending Products</h2>
                <p className="text-sm text-gray-500 mt-1">Our most popular and highly rated items available today</p>
              </div>
              <Link to="/products" className="group flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700">
                <span>View all</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {trendingProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
            {trendingProducts.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                No products found. Run SQL seeds to view catalog.
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
