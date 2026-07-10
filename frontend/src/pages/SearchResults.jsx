import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';
import { Filter, SlidersHorizontal, ChevronLeft, ChevronRight, Search } from 'lucide-react';

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read state directly from URL query parameters
  const queryParam = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || 'All';
  const selectedBrand = searchParams.get('brand') || 'All';
  const selectedStock = searchParams.get('stock') || 'All';
  const urlPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : 1500;
  const sortOption = searchParams.get('sort') || 'newest';
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 0;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Local state for smooth price range slider dragging
  const [localPriceRange, setLocalPriceRange] = useState(urlPrice);

  // List of available brands for brand filter
  const [availableBrands, setAvailableBrands] = useState([]);

  // Pagination states
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sync local price range when URL changes (e.g. back/forward nav)
  useEffect(() => {
    setLocalPriceRange(urlPrice);
  }, [urlPrice]);

  useEffect(() => {
    // Fetch all categories for filter dropdown
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
      } catch (err) {
        console.error('Failed to load categories in search:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch search results whenever query, filter options, or page changes
  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      setError('');
      try {
        let endpoint = `/search?q=${encodeURIComponent(queryParam)}&page=${page}&size=12&sort=${sortOption}`;
        
        if (selectedCategory !== 'All') {
          endpoint += `&category=${selectedCategory}`;
        }
        if (selectedBrand !== 'All') {
          endpoint += `&brand=${encodeURIComponent(selectedBrand)}`;
        }
        if (selectedStock === 'InStock') {
          endpoint += `&inStock=true`;
        }
        endpoint += `&maxPrice=${urlPrice}`;

        const response = await api.get(endpoint);
        const content = response.data.content || [];
        setProducts(content);
        setTotalPages(response.data.totalPages || 0);

        // Fetch brands dynamically from results or keep standard list
        const brands = ['All', ...new Set(content.map(p => p.brand))];
        setAvailableBrands(brands);
      } catch (err) {
        console.error('Error during search fetch:', err);
        setError('An error occurred during search. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [queryParam, selectedCategory, selectedBrand, selectedStock, urlPrice, sortOption, page]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'All' || value === '' || value === null || value === undefined) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    // Reset page to 0 when filters/search changes
    if (key !== 'page') {
      newParams.delete('page');
    }
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    if (newPage === 0) {
      newParams.delete('page');
    } else {
      newParams.set('page', newPage.toString());
    }
    setSearchParams(newParams);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2">
            <Search className="h-7 w-7 text-primary-600 animate-pulse" />
            <span>Search Results</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Found {products.length} matches for <strong className="text-gray-900 font-bold">"{queryParam}"</strong>
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-500 uppercase">Sort by:</label>
          <select
            value={sortOption}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 focus:outline-none"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="popularity">Popularity</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar Filters */}
        <aside className="w-full lg:w-64 shrink-0 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-6 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <SlidersHorizontal className="h-4.5 w-4.5 text-primary-600" />
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Refine Search</h2>
            </div>

            {/* Category Filter dropdown */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Category</h3>
              <select
                value={selectedCategory}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 focus:outline-none"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Brand</h3>
              <select
                value={selectedBrand}
                onChange={(e) => updateFilter('brand', e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 focus:outline-none"
              >
                {availableBrands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Max Price</h3>
                <span className="text-xs font-black text-gray-900">${localPriceRange}</span>
              </div>
              <input
                type="range"
                min="10"
                max="1500"
                step="20"
                value={localPriceRange}
                onChange={(e) => setLocalPriceRange(Number(e.target.value))}
                onMouseUp={() => updateFilter('maxPrice', localPriceRange)}
                onTouchEnd={() => updateFilter('maxPrice', localPriceRange)}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
            </div>

            {/* Availability Stock Filter */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Availability</h3>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="stock"
                    checked={selectedStock === 'All'}
                    onChange={() => updateFilter('stock', 'All')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span>All Items</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="stock"
                    checked={selectedStock === 'InStock'}
                    onChange={() => updateFilter('stock', 'InStock')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span>Exclude Out-of-Stock</span>
                </label>
              </div>
            </div>
          </div>
        </aside>

        {/* Results Main Grid */}
        <main className="flex-grow space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-80 bg-gray-100 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 p-6 text-sm text-red-700 text-center">
              {error}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 rounded-2xl border-2 border-dashed border-gray-200 bg-white">
              <h3 className="text-sm font-semibold text-gray-900">No results found</h3>
              <p className="mt-1 text-xs text-gray-500">We couldn't find anything matching your keywords.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                  <button
                    disabled={page === 0}
                    onClick={() => handlePageChange(page - 1)}
                    className="flex items-center gap-1 rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    <ChevronLeft className="h-4.5 w-4.5" />
                    <span>Previous</span>
                  </button>
                  <span className="text-xs font-medium text-gray-500">
                    Page {page + 1} of {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages - 1}
                    onClick={() => handlePageChange(page + 1)}
                    className="flex items-center gap-1 rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4.5 w-4.5" />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
