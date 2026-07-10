import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Star, ShoppingCart, ShieldCheck, Truck, RefreshCw, AlertTriangle, MessageSquare, CheckCircle } from 'lucide-react';
import { getProductImage } from '../utils/imageResolver';

export default function ProductDetails() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Review states
  const [hasPurchased, setHasPurchased] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  // Edit review states
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editReviewText, setEditReviewText] = useState('');

  const fetchProductDetails = async () => {
    try {
      const prodRes = await api.get(`/products/${slug}`);
      setProduct(prodRes.data);

      // Fetch reviews
      try {
        const revRes = await api.get(`/reviews/product/${prodRes.data.id}`);
        setReviews(revRes.data || []);
      } catch (revErr) {
        console.log('Reviews API fail or empty:', revErr);
      }

      // Check if user has purchased this product
      if (user) {
        try {
          const purchaseRes = await api.get(`/reviews/product/${prodRes.data.id}/check-purchase`);
          setHasPurchased(purchaseRes.data);
        } catch (purErr) {
          console.warn('Could not verify purchase status:', purErr);
        }
      }
    } catch (err) {
      console.error('Failed to load product details:', err);
      setError('Product not found or database connection failed.');
    }
  };

  useEffect(() => {
    setLoading(true);
    setError('');
    
    // Fetch product details
    fetchProductDetails().finally(() => {
      setLoading(false);
    });

    // Log PRODUCT_VIEW Interaction to backend
    const logProductView = async () => {
      if (user && product) {
        try {
          await api.post('/interactions', {
            productId: product.id,
            interactionType: 'PRODUCT_VIEW',
            weight: 1
          });
        } catch (intErr) {
          console.warn('Could not log interaction:', intErr);
        }
      }
    };
    
    if (product) {
      logProductView();
    }
  }, [slug, user, product?.id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setAdding(true);
    setSuccessMsg('');
    try {
      await addToCart(product, quantity);
      
      // Log ADD_TO_CART Interaction
      try {
        await api.post('/interactions', {
          productId: product.id,
          interactionType: 'ADD_TO_CART',
          weight: 3
        });
      } catch (intErr) {
        console.warn('Could not log interaction:', intErr);
      }

      setSuccessMsg('Added to cart successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to add item.');
      setTimeout(() => setError(''), 4000);
    } finally {
      setAdding(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    setSubmittingReview(true);

    try {
      await api.post('/reviews', {
        productId: product.id,
        rating: userRating,
        reviewText: reviewText
      });

      setReviewSuccess('Thank you! Your review has been submitted.');
      setReviewText('');
      setUserRating(5);
      
      // Reload product details to update average rating and review list
      await fetchProductDetails();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      await fetchProductDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete review.');
    }
  };

  const handleEditSubmit = async (e, reviewId) => {
    e.preventDefault();
    try {
      await api.put(`/reviews/${reviewId}`, {
        productId: product.id,
        rating: editRating,
        reviewText: editReviewText
      });
      setEditingReviewId(null);
      await fetchProductDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update review.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !product || !product.id || product.price === undefined || product.price === null) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-900">Unable to load product</h2>
        <p className="mt-2 text-sm text-gray-500">{error || 'The requested product does not exist.'}</p>
        <Link to="/products" className="mt-6 inline-block text-sm font-semibold text-primary-600 hover:underline">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const isLowStock = (product.stockQuantity || 0) > 0 && (product.stockQuantity || 0) <= 5;
  const isOutOfStock = (product.stockQuantity || 0) <= 0;
  const price = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Product Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left Side: Product Image */}
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden aspect-video flex items-center justify-center p-4">
          <img
            src={getProductImage(product)}
            alt={product.name}
            className="max-h-full max-w-full object-contain rounded-2xl"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400';
            }}
          />
        </div>

        {/* Right Side: Product Meta & Purchase */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Category / Brand */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1 rounded-full">
                {product.brand}
              </span>
              <span className="text-xs text-gray-400">/</span>
              <span className="text-xs font-semibold text-gray-500">{product.categoryName}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-black text-gray-900 leading-tight">{product.name}</h1>

            {/* Ratings */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center text-amber-500">
                <Star className="h-5 w-5 fill-current" />
              </div>
              <span className="text-sm font-bold text-gray-700">{(product.averageRating || 0).toFixed(1)}</span>
              <span className="text-sm text-gray-400">({product.reviewCount || 0} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-3xl font-black text-gray-900">${price.toFixed(2)}</span>
              {hasDiscount && (
                <span className="text-sm text-gray-400 line-through">${product.price.toFixed(2)}</span>
              )}
            </div>

            <hr className="border-gray-200" />

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Product Overview</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          </div>

          {/* Action Box */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4 shadow-sm">
            {/* Stock Level Alerts */}
            <div className="flex items-center gap-2 text-xs">
              {isOutOfStock ? (
                <span className="flex items-center gap-1 font-bold text-red-600">
                  <AlertTriangle className="h-4 w-4" /> Temporarily Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="flex items-center gap-1 font-bold text-amber-600">
                  <AlertTriangle className="h-4 w-4" /> Only {product.stockQuantity} items left!
                </span>
              ) : (
                <span className="font-semibold text-green-600">In Stock (Available: {product.stockQuantity})</span>
              )}
            </div>

            {/* Purchase Form */}
            <div className="flex flex-col sm:flex-row gap-4">
              {!isOutOfStock && (
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden shrink-0">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 bg-gray-50 hover:bg-gray-100 font-semibold"
                  >
                    -
                  </button>
                  <span className="px-5 py-2 text-sm font-semibold text-center w-12">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    className="px-3 py-2 bg-gray-50 hover:bg-gray-100 font-semibold"
                  >
                    +
                  </button>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || adding}
                className="flex-grow flex justify-center items-center gap-2 rounded-lg bg-primary-600 py-3 px-6 text-sm font-bold text-white shadow hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>{adding ? 'Adding...' : 'Add to Cart'}</span>
              </button>
            </div>

            {successMsg && (
              <div className="text-xs text-green-600 font-semibold text-center animate-bounce">{successMsg}</div>
            )}
            {error && (
              <div className="text-xs text-red-600 font-semibold text-center animate-pulse">{error}</div>
            )}
          </div>

          {/* Key Trust Flags */}
          <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-500 pt-2 text-center">
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="h-5 w-5 text-gray-400" />
              <span>1 Year Warranty</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Truck className="h-5 w-5 text-gray-400" />
              <span>Free Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <RefreshCw className="h-5 w-5 text-gray-400" />
              <span>30 Day Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews & Ratings Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-10 pt-10 border-t border-gray-200">
        {/* Left Side: Submit Review */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Share Your Experience</h2>
          
          {user ? (
            hasPurchased ? (
              <form onSubmit={handleReviewSubmit} className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4 shadow-sm">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Your Rating</label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setUserRating(star)}
                        className={`text-2xl ${star <= userRating ? 'text-amber-500' : 'text-gray-300'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Review Details</label>
                  <textarea
                    required
                    rows={4}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="What did you think of the product? Share its pros, cons, and performance..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-primary-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-primary-600 py-2.5 text-xs font-bold text-white shadow hover:bg-primary-700 disabled:bg-gray-400"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>{submittingReview ? 'Submitting...' : 'Post Review'}</span>
                </button>

                {reviewSuccess && (
                  <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold justify-center">
                    <CheckCircle className="h-4.5 w-4.5" />
                    <span>{reviewSuccess}</span>
                  </div>
                )}
                {reviewError && (
                  <div className="text-[10px] text-red-600 font-bold text-center">
                    {reviewError}
                  </div>
                )}
              </form>
            ) : (
              <div className="rounded-2xl bg-amber-50/50 border border-amber-100 p-5 space-y-2 text-center text-xs text-amber-800">
                <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto" />
                <h4 className="font-bold">Verified Purchases Only</h4>
                <p className="text-[11px] text-amber-600">
                  To ensure quality, only customers who purchased this item from PulseCart can leave a rating or review.
                </p>
              </div>
            )
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 text-center text-xs text-gray-500 shadow-sm space-y-3">
              <p>Please log in to write a review.</p>
              <Link
                to="/login"
                className="inline-block rounded-lg bg-primary-50 px-4 py-2 font-semibold text-primary-700 hover:bg-primary-100 transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Right Side: Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Customer Ratings</h2>
          <div className="space-y-4">
            {reviews.map((rev) => {
              const isOwner = user && user.email === rev.userEmail;
              const isAdmin = user && user.roles?.includes('ROLE_ADMIN');
              return (
                <div key={rev.id} className="p-5 rounded-2xl border border-gray-100 bg-white space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800">{rev.userFirstName} {rev.userLastName} ({rev.userEmail})</span>
                    <div className="flex items-center text-amber-500 gap-0.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`h-3.5 w-3.5 fill-current ${
                            idx < (editingReviewId === rev.id ? editRating : rev.rating) ? 'text-amber-500' : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {editingReviewId === rev.id ? (
                    <form onSubmit={(e) => handleEditSubmit(e, rev.id)} className="space-y-3 pt-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setEditRating(star)}
                            className={`text-lg ${star <= editRating ? 'text-amber-500' : 'text-gray-300'}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                      <textarea
                        required
                        value={editReviewText}
                        onChange={(e) => setEditReviewText(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-primary-500"
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="rounded bg-primary-600 px-3 py-1 text-[10px] font-bold text-white shadow hover:bg-primary-700"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingReviewId(null)}
                          className="rounded border border-gray-300 bg-white px-3 py-1 text-[10px] font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <p className="text-xs text-gray-600 leading-relaxed">{rev.reviewText}</p>
                      <div className="flex items-center justify-between gap-4 pt-1">
                        <p className="text-[10px] text-gray-400">Posted on: {new Date(rev.createdAt || Date.now()).toLocaleDateString()}</p>
                        <div className="flex items-center gap-2">
                          {isOwner && (
                            <button
                              onClick={() => {
                                setEditingReviewId(rev.id);
                                setEditRating(rev.rating);
                                setEditReviewText(rev.reviewText);
                              }}
                              className="text-[10px] text-indigo-600 hover:underline font-bold"
                            >
                              Edit
                            </button>
                          )}
                          {(isOwner || isAdmin) && (
                            <button
                              onClick={() => handleDeleteReview(rev.id)}
                              className="text-[10px] text-red-500 hover:underline font-bold"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
            {reviews.length === 0 && (
              <p className="text-sm text-gray-500">No reviews yet for this product. Be the first to share your experience!</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
