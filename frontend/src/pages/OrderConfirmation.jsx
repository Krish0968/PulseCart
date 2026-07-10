import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('orderNumber') || 'UNKNOWN';
  const orderId = searchParams.get('orderId');

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center space-y-8">
      {/* Checkmark Icon */}
      <div className="flex justify-center text-green-500 animate-bounce">
        <CheckCircle className="h-16 w-16" />
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Order Placed!</h1>
        <p className="text-sm text-gray-500">
          Thank you for shopping with PulseCart. Your order has been placed successfully and mock payment was approved.
        </p>
      </div>

      {/* Details Box */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <div className="text-sm">
          <span className="text-gray-400 font-medium">Order Number:</span>
          <span className="block font-black text-gray-900 mt-1 uppercase text-lg tracking-wider">
            {orderNumber}
          </span>
        </div>
        <hr className="border-gray-100" />
        <div className="text-xs text-gray-500">
          <span>Estimated Delivery:</span>
          <span className="block font-semibold text-gray-800 mt-0.5">3-5 Business Days</span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col gap-3">
        {orderId && (
          <Link
            to="/orders"
            className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-primary-600 py-3 text-sm font-semibold text-white shadow hover:bg-primary-700 transition-colors"
          >
            <span>View Order History</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
        <Link
          to="/"
          className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ShoppingBag className="h-4.5 w-4.5 text-gray-400" />
          <span>Continue Shopping</span>
        </Link>
      </div>
    </div>
  );
}
