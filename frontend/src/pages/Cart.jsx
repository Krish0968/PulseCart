import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { getProductImage } from '../utils/imageResolver';

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart, loading } = useCart();
  const navigate = useNavigate();
  const [updatingId, setUpdatingId] = useState(null);

  const handleQtyChange = async (itemId, newQty) => {
    setUpdatingId(itemId);
    try {
      await updateQuantity(itemId, newQty);
    } catch (err) {
      alert(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeFromCart(itemId);
    } catch (err) {
      alert(err);
    }
  };

  if (loading && cartItems.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-8">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 rounded-3xl border-2 border-dashed border-gray-200 bg-white space-y-4">
          <div className="flex justify-center text-gray-400">
            <ShoppingBag className="h-16 w-16" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Your cart is empty</h2>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Before checking out, you must add some products to your shopping cart.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-primary-700 transition-colors"
          >
            <span>Start Shopping</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {cartItems.map((item) => {
                  const price = item.product.discountPrice || item.product.price;
                  const itemTotal = price * item.quantity;
                  const imageUrl = getProductImage(item.product);

                  return (
                    <li key={item.id} className="flex p-6 gap-4">
                      {/* Product Image */}
                      <Link to={`/product/${item.product.productSlug}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                        <img
                          src={imageUrl}
                          alt={item.product.productName}
                          className="h-full w-full object-contain object-center"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400';
                          }}
                        />
                      </Link>

                      {/* Item Details */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div className="flex justify-between gap-2">
                          <div>
                            <Link to={`/product/${item.product.productSlug}`} className="text-sm font-semibold text-gray-900 hover:text-primary-600">
                              {item.product.productName}
                            </Link>
                            <p className="mt-0.5 text-xs text-gray-500">Brand: {item.product.productBrand}</p>
                          </div>
                          <span className="text-sm font-bold text-gray-900">${price.toFixed(2)}</span>
                        </div>

                        <div className="flex items-center justify-between pt-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-gray-50 text-xs">
                            <button
                              disabled={updatingId === item.id}
                              onClick={() => handleQtyChange(item.id, item.quantity - 1)}
                              className="px-2.5 py-1.5 hover:bg-gray-100 disabled:opacity-50"
                            >
                              -
                            </button>
                            <span className="px-3 font-semibold text-gray-700">{item.quantity}</span>
                            <button
                              disabled={updatingId === item.id}
                              onClick={() => handleQtyChange(item.id, item.quantity + 1)}
                              className="px-2.5 py-1.5 hover:bg-gray-100 disabled:opacity-50"
                            >
                              +
                            </button>
                          </div>

                          {/* Delete Item */}
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="flex justify-end">
              <button
                onClick={clearCart}
                className="text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Taxes</span>
                  <span>Calculated at checkout</span>
                </div>
                <hr className="border-gray-100" />
                <div className="flex justify-between text-lg font-black text-gray-900">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-primary-600 py-3 text-sm font-bold text-white shadow hover:bg-primary-700 transition-colors"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
