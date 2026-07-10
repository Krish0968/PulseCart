import React from 'react';
import { AlertOctagon } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an uncaught React rendering crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-16 text-center space-y-6">
          <div className="inline-flex p-4 rounded-full bg-red-100 text-red-600">
            <AlertOctagon className="h-12 w-12" />
          </div>
          <div className="space-y-2 max-w-md">
            <h1 className="text-3xl font-black text-gray-900">Something went wrong</h1>
            <p className="text-sm text-gray-500">
              An unexpected error occurred in the application view rendering. Try reloading the page.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-primary-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-primary-700 transition-all"
            >
              Reload Page
            </button>
            <a
              href="/"
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-all"
            >
              Go Home
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
