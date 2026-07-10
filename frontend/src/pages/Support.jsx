import React from 'react';
import { HelpCircle, Truck, RefreshCw, Mail, Phone, ShieldQuestion, MessageSquare } from 'lucide-react';

export default function Support() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Help & Support</h1>
        <p className="mt-3 text-sm text-gray-600 max-w-xl mx-auto">
          Need assistance with your PulseCart orders? Browse our FAQs or contact our support team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Support Categories Navigation */}
        <div className="md:col-span-1 space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-3 sticky top-24">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Help</h3>
            <div className="flex flex-col gap-2">
              <a href="#faq" className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 p-2 hover:bg-indigo-50 rounded-lg transition-colors">
                <ShieldQuestion className="h-4 w-4 text-indigo-500" />
                <span>Frequently Asked Questions</span>
              </a>
              <a href="#shipping" className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 p-2 hover:bg-indigo-50 rounded-lg transition-colors">
                <Truck className="h-4 w-4 text-indigo-500" />
                <span>Shipping & Delivery</span>
              </a>
              <a href="#returns" className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 p-2 hover:bg-indigo-50 rounded-lg transition-colors">
                <RefreshCw className="h-4 w-4 text-indigo-500" />
                <span>Returns & Refunds</span>
              </a>
              <a href="#contact" className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 p-2 hover:bg-indigo-50 rounded-lg transition-colors">
                <Mail className="h-4 w-4 text-indigo-500" />
                <span>Contact Us</span>
              </a>
            </div>
          </div>
        </div>

        {/* Support Details */}
        <div className="md:col-span-2 space-y-8">
          {/* FAQ Section */}
          <section id="faq" className="scroll-mt-24 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <ShieldQuestion className="h-5 w-5 text-indigo-600" />
              <span>Frequently Asked Questions</span>
            </h2>
            <div className="space-y-4 divide-y divide-gray-100">
              <div className="pt-2">
                <h4 className="font-bold text-gray-900 text-sm">How do I track my order?</h4>
                <p className="text-xs text-gray-600 mt-1">
                  You can track your order history directly in the "My Orders" tab within your account dropdown menu. Each completed checkout provides status transitions in real-time.
                </p>
              </div>
              <div className="pt-4">
                <h4 className="font-bold text-gray-900 text-sm">Is my payment details secure?</h4>
                <p className="text-xs text-gray-600 mt-1">
                  Yes, PulseCart uses simulated mock payment services with strict local validation rules, preventing transaction leaks. No actual credit card data is ever collected or processed.
                </p>
              </div>
              <div className="pt-4">
                <h4 className="font-bold text-gray-900 text-sm">Can I edit my review?</h4>
                <p className="text-xs text-gray-600 mt-1">
                  Absolutely! Head to the product page of the product you reviewed. You can dynamically modify your star rating or delete the review.
                </p>
              </div>
            </div>
          </section>

          {/* Shipping Section */}
          <section id="shipping" className="scroll-mt-24 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Truck className="h-5 w-5 text-indigo-600" />
              <span>Shipping & Delivery</span>
            </h2>
            <p className="text-xs text-gray-600">
              We ship to all states across the USA. Deliveries are processed within 24 hours of successful checkouts.
            </p>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="block text-indigo-600 font-extrabold text-sm">Standard Shipping</span>
                <span className="block text-[10px] text-gray-500 mt-0.5">3-5 Business Days</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="block text-indigo-600 font-extrabold text-sm">Express Shipping</span>
                <span className="block text-[10px] text-gray-500 mt-0.5">1-2 Business Days</span>
              </div>
            </div>
          </section>

          {/* Returns Section */}
          <section id="returns" className="scroll-mt-24 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <RefreshCw className="h-5 w-5 text-indigo-600" />
              <span>Returns & Refunds</span>
            </h2>
            <p className="text-xs text-gray-600">
              Our policy allows hassle-free returns within 30 days of purchase. The items must be in original retail condition with tags attached. Refunds are credited to the mock payment issuer instantly.
            </p>
          </section>

          {/* Contact Section */}
          <section id="contact" className="scroll-mt-24 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Mail className="h-5 w-5 text-indigo-600" />
              <span>Contact Us</span>
            </h2>
            <p className="text-xs text-gray-600">
              Have other technical inquiries about our hybrid recommendations engine or cloud deployments? Reach out directly:
            </p>
            <div className="space-y-2 text-xs text-gray-700">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-indigo-500" />
                <span className="font-semibold">support@pulsecart.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-indigo-500" />
                <span>+1 (800) 555-PCART</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
