import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 mt-auto border-t border-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-white text-lg font-bold">PulseCart</h3>
            <p className="text-sm">
              Discover a personalized shopping experience with real-time recommendations tailored to your unique preferences.
            </p>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Categories</Link></li>
              <li><Link to="/search?sort=popularity" className="hover:text-white transition-colors">Trending Now</Link></li>
              <li><Link to="/search?sort=newest" className="hover:text-white transition-colors">New Arrivals</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Azure Features</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="text-gray-500">Azure SQL Database</span></li>
              <li><span className="text-gray-500">Azure Blob Storage</span></li>
              <li><span className="text-gray-500">Azure Functions CPU</span></li>
              <li><span className="text-gray-500">Application Insights</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/support#faq" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="/support#shipping" className="hover:text-white transition-colors">Shipping & Delivery</a></li>
              <li><a href="/support#returns" className="hover:text-white transition-colors">Returns & Refunds</a></li>
              <li><a href="/support#contact" className="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-xs text-gray-600">
          <p>© {new Date().getFullYear()} PulseCart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
