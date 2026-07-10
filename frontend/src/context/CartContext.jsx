import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchCart = async () => {
    if (!user) {
      setCartItems([]);
      return;
    }
    setLoading(true);
    try {
      const response = await api.get('/cart');
      setCartItems(response.data.items || []);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (product, quantity = 1) => {
    if (!user) {
      throw 'Please log in to add items to your cart.';
    }
    try {
      const response = await api.post('/cart/items', { productId: product.id, quantity });
      setCartItems(response.data.items || []);
    } catch (error) {
      throw error.response?.data?.message || 'Failed to add item to cart.';
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const response = await api.put(`/cart/items/${itemId}`, { quantity });
      setCartItems(response.data.items || []);
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update item quantity.';
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const response = await api.delete(`/cart/items/${itemId}`);
      setCartItems(response.data.items || []);
    } catch (error) {
      throw error.response?.data?.message || 'Failed to remove item from cart.';
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setCartItems([]);
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  const cartCount = Array.isArray(cartItems) 
    ? cartItems.reduce((acc, item) => acc + (item?.quantity || 0), 0) 
    : 0;

  const cartTotal = Array.isArray(cartItems)
    ? cartItems.reduce((acc, item) => {
        if (!item) return acc;
        const productInfo = item.product || {};
        const price = productInfo.discountPrice !== null && productInfo.discountPrice !== undefined 
          ? productInfo.discountPrice 
          : (productInfo.price !== null && productInfo.price !== undefined 
              ? productInfo.price 
              : (item.discountPrice !== null && item.discountPrice !== undefined 
                  ? item.discountPrice 
                  : (item.price || 0)));
        const qty = item.quantity || 0;
        return acc + Number(price) * Number(qty);
      }, 0)
    : 0;

  return (
    <CartContext.Provider value={{ cartItems, loading, addToCart, updateQuantity, removeFromCart, clearCart, cartCount, cartTotal, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
