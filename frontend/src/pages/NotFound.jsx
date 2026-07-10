import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center space-y-6">
      <div className="inline-flex p-4 rounded-full bg-red-50 text-red-600">
        <ShieldAlert className="h-12 w-12" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-gray-900">Page Not Found</h1>
        <p className="text-sm text-gray-500">
          The page you are looking for does not exist or has been moved.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
          Browse Products
        </Link>
      </div>
    </div>
  );
}
