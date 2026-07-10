import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';
import { Filter, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductListing() {
  const { categorySlug } = useParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  
  // Filtering & Sorting State
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedStock, setSelectedStock] = useState('All');
  const [sortOption, setSortOption] = useState('newest');
  const [priceRange, setPriceRange] = useState(1500); // Max slider price
  
  // Pagination State
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Extract unique brands for brand filters dynamically!
  const [availableBrands, setAvailableBrands] = useState([]);

  useEffect(() => {
    // Fetch all categories for sidebar filter
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
        if (categorySlug) {
          const current = res.data.find(c => c.slug === categorySlug);
          if (!current) {
            setError('Category not found');
            return;
          }
          setCurrentCategory(current);
        } else {
          setCurrentCategory(null);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, [categorySlug]);

  useEffect(() => {
    const fetchProducts = async () => {
      // If categories check already marked category as not found, skip fetching
      if (error === 'Category not found') return;
      
      setLoading(true);
      setError('');
      try {
        let endpoint = '/products';
        if (categorySlug) {
          endpoint = `/products/category/${categorySlug}`;
        }
        
        // Include page/size params
        const response = await api.get(`${endpoint}?page=${page}&size=12`);
        const content = response.data.content || [];
        setProducts(content);
        setTotalPages(response.data.totalPages || 0);

        // Extract unique brands from fetched list dynamically for filters
        const brands = ['All', ...new Set(content.map(p => p.brand))];
        setAvailableBrands(brands);
      } catch (err) {
        console.error('Error fetching catalog:', err);
        if (err.response?.status === 404) {
          setError('Category not found');
        } else {
          setError('Failed to fetch catalog. Make sure the database is seeded.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categorySlug, page, error]);

  // Apply UI Filters on fetched results (or backend filters)
  const getFilteredProducts = () => {
    let filtered = [...products];

    // Filter by Brand
    if (selectedBrand !== 'All') {
      filtered = filtered.filter(p => p.brand === selectedBrand);
    }

    // Filter by Stock Status
    if (selectedStock === 'InStock') {
      filtered = filtered.filter(p => p.stockQuantity > 0);
    } else if (selectedStock === 'OutOfStock') {
      filtered = filtered.filter(p => p.stockQuantity <= 0);
    }

    // Filter by Price Range
    filtered = filtered.filter(p => {
      const price = p.discountPrice || p.price;
      return price <= priceRange;
    });

    // Apply Sorting
    if (sortOption === 'price-low') {
      filtered.sort((a, b) => {
        const pa = a.discountPrice || a.price;
        const pb = b.discountPrice || b.price;
        return pa - pb;
      });
    } else if (sortOption === 'price-high') {
      filtered.sort((a, b) => {
        const pa = a.discountPrice || a.price;
        const pb = b.discountPrice || b.price;
        return pb - pa;
      });
    } else if (sortOption === 'rating') {
      filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    }
    
    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  if (error === 'Category not found') {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center space-y-6">
        <div className="inline-flex p-4 rounded-full bg-amber-50 text-amber-600">
          <Filter className="h-12 w-12" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Category Not Found</h1>
          <p className="text-sm text-gray-500">
            The category you are looking for does not exist or has no active products.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Link
            to="/"
            className="rounded-lg bg-primary-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-primary-700 transition-all"
          >
            Go Home
          </Link>
          <Link
            to="/products"
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-all"
          >
            All Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <nav className="text-xs text-gray-500 mb-1">
            <Link to="/" className="hover:text-primary-600">Home</Link>
            <span className="mx-1.5">/</span>
            <span className="text-gray-900 font-medium">
              {currentCategory ? currentCategory.name : 'All Products'}
            </span>
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            {currentCategory ? currentCategory.name : 'Store Catalog'}
          </h1>
          {currentCategory?.description && (
            <p className="text-xs text-gray-500 mt-1 max-w-2xl">{currentCategory.description}</p>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-500 uppercase">Sort by:</label>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 shrink-0 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-6 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <SlidersHorizontal className="h-4.5 w-4.5 text-primary-600" />
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Filters</h2>
            </div>

            {/* Category Filter list (Only visible when browsing all) */}
            {!categorySlug && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Categories</h3>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-2">
                  <Link
                    to="/products"
                    className="block px-2.5 py-1.5 text-xs font-semibold rounded-md bg-primary-50 text-primary-700"
                  >
                    All Categories
                  </Link>
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      to={`/category/${c.slug}`}
                      className="block px-2.5 py-1.5 text-xs text-gray-600 rounded-md hover:bg-gray-50 hover:text-primary-600 transition-colors"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Brand Filter */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Brand</h3>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
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
                <span className="text-xs font-black text-gray-900">${priceRange}</span>
              </div>
              <input
                type="range"
                min="10"
                max="1500"
                step="20"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
            </div>

            {/* Stock Filter */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Availability</h3>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="stock"
                    checked={selectedStock === 'All'}
                    onChange={() => setSelectedStock('All')}
                    className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span>All Items</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="stock"
                    checked={selectedStock === 'InStock'}
                    onChange={() => setSelectedStock('InStock')}
                    className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span>Exclude Out-of-Stock</span>
                </label>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Catalog Grid */}
        <main className="flex-1 space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-80 bg-gray-100 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 p-6 text-sm text-red-700 text-center shadow-inner">
              {error}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 rounded-2xl border-2 border-dashed border-gray-200 bg-white">
              <h3 className="text-sm font-semibold text-gray-900">No products found</h3>
              <p className="mt-1 text-xs text-gray-500">Try adjusting your filters or search options.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                  <button
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
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
                    onClick={() => setPage(page + 1)}
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
