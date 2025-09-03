import React from 'react';
import { Link } from 'react-router-dom';

export default function LoginRedirect() {
  const hasUser = !!localStorage.getItem('user');
  const hasToken = !!localStorage.getItem('token');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Authentication Required</h1>
          <p className="text-slate-600">You need to log in to access this page.</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Debug Information:</h3>
          <div className="text-xs text-blue-700 space-y-1">
            <p>User in localStorage: {hasUser ? '✅ Yes' : '❌ No'}</p>
            <p>Token in localStorage: {hasToken ? '✅ Yes' : '❌ No'}</p>
            {hasUser && (
              <p>User data: {localStorage.getItem('user')?.substring(0, 50)}...</p>
            )}
            {hasToken && (
              <p>Token preview: {localStorage.getItem('token')?.substring(0, 20)}...</p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <Link
            to="/login"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors block text-center"
          >
            Go to Login
          </Link>
          
          <button
            onClick={() => {
              localStorage.removeItem('user');
              localStorage.removeItem('token');
              window.location.reload();
            }}
            className="w-full bg-red-100 text-red-700 py-2 px-4 rounded-lg hover:bg-red-200 transition-colors"
          >
            Clear Auth Data & Reload
          </button>
        </div>

        <div className="mt-6 text-xs text-slate-500 text-center">
          <p>If you're having trouble logging in, try clearing your browser data or contact support.</p>
          <p className="mt-2">
            <strong>Debug Tip:</strong> Open browser console (F12) and type <code>checkAuth()</code> for more details.
          </p>
        </div>
      </div>
    </div>
  );
}
