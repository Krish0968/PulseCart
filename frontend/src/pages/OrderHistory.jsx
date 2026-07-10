import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { ShoppingBag, Calendar, CreditCard, Eye, AlertCircle } from 'lucide-react';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/orders');
        setOrders(response.data || []);
      } catch (err) {
        console.error('Error fetching order history:', err);
        setError('Failed to fetch order history. Try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">DELIVERED</span>;
      case 'COMPLETED':
        return <span className="bg-green-50 text-green-700 border border-green-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">COMPLETED</span>;
      case 'PENDING':
        return <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">PENDING</span>;
      default:
        return <span className="bg-gray-50 text-gray-700 border border-gray-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-8">My Orders</h1>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700 mb-6">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-20 rounded-3xl border-2 border-dashed border-gray-200 bg-white space-y-4">
          <div className="flex justify-center text-gray-400">
            <ShoppingBag className="h-16 w-16" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">No orders found</h2>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            You haven't placed any orders yet. Once you place an order, it will appear here.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center rounded-full bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-primary-700"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              {/* Order Meta info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="font-black text-gray-900 text-base tracking-wide uppercase">
                    {order.orderNumber}
                  </span>
                  {getStatusBadge(order.status)}
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    Total: <strong className="text-gray-800">${order.totalAmount.toFixed(2)}</strong>
                  </span>
                </div>
                <p className="text-xs text-gray-400 line-clamp-1">Ship to: {order.shippingAddress}</p>
              </div>

              {/* View details action */}
              <div>
                <Link
                  to={`/orders/${order.id}`}
                  className="flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <Eye className="h-4 w-4 text-gray-400" />
                  <span>View Details</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
