import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Star, ShoppingCart } from 'lucide-react';
import { getProductImage } from '../utils/imageResolver';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const handleAddToCart = async (e) => {
    e.preventDefault(); // Prevent navigating to details on click
    setAdding(true);
    setError('');
    try {
      await addToCart(product, 1);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to add item');
      setTimeout(() => setError(''), 3000);
    } finally {
      setAdding(false);
    }
  };

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const rating = product.averageRating || 0.0;
  const isOutOfStock = product.stockQuantity <= 0;

  const imageUrl = getProductImage(product);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-lg">
      <Link to={`/product/${product.slug}`} className="block relative overflow-hidden aspect-video bg-gray-100">
        {hasDiscount && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
            Save
          </span>
        )}
        <img
          src={imageUrl}
          alt={product.name}
          className="h-full w-full object-contain object-center transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400';
          }}
        />
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
            <span className="rounded-md bg-red-600 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {/* Brand & Category */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span className="font-semibold text-primary-600 uppercase tracking-wider">{product.brand}</span>
          <span className="bg-gray-100 px-2 py-0.5 rounded-full">{product.categoryName}</span>
        </div>

        {/* Product Title */}
        <Link to={`/product/${product.slug}`} className="block flex-1">
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="mt-1 text-xs text-gray-500 line-clamp-2 min-h-[2rem]">
            {product.shortDescription || product.description}
          </p>
        </Link>

        {/* Ratings */}
        <div className="mt-2.5 flex items-center gap-1">
          <div className="flex items-center text-amber-500">
            <Star className={`h-4.5 w-4.5 fill-current ${rating > 0 ? '' : 'text-gray-300'}`} />
          </div>
          <span className="text-xs font-bold text-gray-700">{rating.toFixed(1)}</span>
          <span className="text-xs text-gray-400">({product.reviewCount || 0})</span>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
          <div className="flex flex-col">
            {hasDiscount ? (
              <>
                <span className="text-lg font-black text-gray-900">${product.discountPrice.toFixed(2)}</span>
                <span className="text-xs text-gray-400 line-through">${product.price.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-lg font-black text-gray-900">${product.price.toFixed(2)}</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding}
            className={`flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : adding
                ? 'bg-primary-500 text-white cursor-wait'
                : 'bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>{adding ? 'Adding...' : 'Add'}</span>
          </button>
        </div>

        {error && (
          <div className="absolute bottom-1 left-0 right-0 bg-red-500 text-white text-[10px] text-center py-1 animate-pulse">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
