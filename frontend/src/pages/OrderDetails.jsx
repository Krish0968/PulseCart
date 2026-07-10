import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { ArrowLeft, Calendar, MapPin, CreditCard, ShieldAlert } from 'lucide-react';
import { getProductImage } from '../utils/imageResolver';

export default function OrderDetails() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/orders/${orderId}`);
        setOrder(response.data);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Order not found or access denied.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center space-y-4">
        <div className="flex justify-center text-red-500">
          <ShieldAlert className="h-12 w-12" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
        <p className="mt-2 text-sm text-gray-500">{error || 'This order does not belong to you.'}</p>
        <Link to="/orders" className="mt-6 inline-block text-sm font-semibold text-primary-600 hover:underline">
          Back to Order History
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back Button */}
      <div>
        <Link to="/orders" className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-primary-600">
          <ArrowLeft className="h-4.5 w-4.5" />
          <span>Back to Order History</span>
        </Link>
      </div>

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">
            Order Details
          </h1>
          <p className="text-sm font-semibold text-primary-600 uppercase tracking-widest mt-1">
            {order.orderNumber}
          </p>
        </div>
        <span className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Shipping & Date details */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3">
            <MapPin className="h-5 w-5 text-primary-600" />
            <span>Shipping Address</span>
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed font-medium">{order.shippingAddress}</p>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 pt-2 border-t border-gray-100">
            <Calendar className="h-4 w-4" />
            <span>Ordered on {new Date(order.createdAt).toLocaleString()}</span>
          </div>
        </div>

        {/* Payment info */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3">
            <CreditCard className="h-5 w-5 text-primary-600" />
            <span>Payment Summary</span>
          </h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Method:</span>
              <strong className="text-gray-800">{order.paymentMethod}</strong>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <strong className="text-green-600">{order.paymentStatus}</strong>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-100 text-base font-black text-gray-900">
              <span>Total Price:</span>
              <span>${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items list */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Ordered Items</h2>
        </div>
        <ul className="divide-y divide-gray-100">
          {order.items.map((item) => {
            const imageUrl = getProductImage(item);
            return (
              <li key={item.id} className="flex p-6 gap-4">
                {/* Image */}
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                  <img
                    src={imageUrl}
                    alt={item.productName}
                    className="h-full w-full object-contain object-center"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400';
                    }}
                  />
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{item.productName}</h4>
                      <p className="text-xs text-gray-400">Quantity: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-gray-400 pt-1">Unit Price: ${item.price.toFixed(2)}</div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
