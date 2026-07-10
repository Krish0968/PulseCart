import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../api';
import { CreditCard, MapPin, AlertCircle, CheckCircle } from 'lucide-react';

export default function Checkout() {
  const { cartItems, cartTotal, clearCart, fetchCart } = useCart();
  const navigate = useNavigate();

  // Form Fields
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('USA');
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [paymentSimulation, setPaymentSimulation] = useState('SUCCESS'); // SUCCESS or FAILED

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const shippingAddress = `${street}, ${city}, ${state}, ${zip}, ${country}`;

    try {
      const response = await api.post('/checkout', {
        shippingAddress,
        paymentMethod,
        mockPaymentStatus: paymentSimulation
      });

      const order = response.data;
      
      // Refresh context cart state
      await fetchCart();

      // Navigate to confirmation page
      navigate(`/order-confirmation?orderNumber=${order.orderNumber}&orderId=${order.id}`);
    } catch (err) {
      setError(typeof err === 'string' ? err : err.response?.data?.message || 'Checkout failed.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="text-sm text-gray-500">You must add products before checking out.</p>
        <Link to="/" className="inline-block rounded-lg bg-primary-600 px-6 py-2 text-sm font-semibold text-white shadow">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-8">Secure Checkout</h1>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700 mb-6">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns - Form Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Details */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
              <MapPin className="h-5 w-5 text-primary-600" />
              <span>Shipping Address</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="123 Main St"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Seattle"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">State / Province</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="WA"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">ZIP / Postal Code</label>
                  <input
                    type="text"
                    required
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="98101"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Country</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="USA"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
              <CreditCard className="h-5 w-5 text-primary-600" />
              <span>Payment Simulation</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Payment Method</label>
                <div className="flex gap-4">
                  <label className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 p-4 cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CREDIT_CARD"
                      checked={paymentMethod === 'CREDIT_CARD'}
                      onChange={() => setPaymentMethod('CREDIT_CARD')}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">Credit Card (Mock)</span>
                  </label>
                  <label className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 p-4 cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="PAYPAL"
                      checked={paymentMethod === 'PAYPAL'}
                      onChange={() => setPaymentMethod('PAYPAL')}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">PayPal (Mock)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Simulate Transaction Outcome</label>
                <div className="flex gap-4">
                  <label className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50/20 p-4 cursor-pointer hover:bg-green-50/50">
                    <input
                      type="radio"
                      name="paymentSimulation"
                      value="SUCCESS"
                      checked={paymentSimulation === 'SUCCESS'}
                      onChange={() => setPaymentSimulation('SUCCESS')}
                      className="text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm font-bold text-green-700">Payment SUCCESS</span>
                  </label>
                  <label className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50/20 p-4 cursor-pointer hover:bg-red-50/50">
                    <input
                      type="radio"
                      name="paymentSimulation"
                      value="FAILED"
                      checked={paymentSimulation === 'FAILED'}
                      onChange={() => setPaymentSimulation('FAILED')}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm font-bold text-red-700">Payment FAILURE (Decline)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Review Items & Submit */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Review Items</h2>

            {/* Items list */}
            <div className="max-h-48 overflow-y-auto space-y-4 pr-1">
              {cartItems.map((item) => {
                const price = item.product.discountPrice || item.product.price;
                return (
                  <div key={item.id} className="flex justify-between items-center text-xs">
                    <div className="flex-1 pr-2">
                      <span className="font-semibold text-gray-900 line-clamp-1">{item.product.productName}</span>
                      <span className="text-gray-400">Qty: {item.quantity}</span>
                    </div>
                    <span className="font-bold text-gray-900">${(price * item.quantity).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>

            <hr className="border-gray-100" />

            {/* Total Pricing */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>
                <span className="text-green-600 font-semibold">Free</span>
              </div>
              <hr className="border-gray-100 my-2" />
              <div className="flex justify-between text-lg font-black text-gray-900">
                <span>Total Amount</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Action button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center rounded-lg bg-primary-600 py-3 text-sm font-bold text-white shadow hover:bg-primary-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? 'Processing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
