import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-10 rounded-2xl shadow-xl flex flex-col items-center text-center max-w-md w-full border border-gray-100">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert size={40} />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-500 mb-8">
          Oops! The page you are looking for doesn't exist, has been moved, or you don't have permission to access it.
        </p>
        <Link 
          to="/" 
          className="w-full px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
