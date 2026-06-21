import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface ErrorDisplayProps {
  title?: string;
  error?: any;
  message?: string;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  title = "Something went wrong", 
  error, 
  message, 
  onRetry, 
  className = "",
  compact = false
}) => {
  // Extract error message from RTK Query error or standard Error
  let errorMessage = message || "An unexpected error occurred. Please try again later.";
  
  if (error) {
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error.data && typeof error.data.message === 'string') {
      errorMessage = error.data.message;
    } else if (error.data && typeof error.data === 'string') {
      errorMessage = error.data;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.error) {
      errorMessage = error.error;
    }
  }

  if (compact) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 text-center text-red-500 bg-red-50 rounded-lg border border-red-100 ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>
        <p className="text-xs text-red-400 mb-3">{errorMessage}</p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
          >
            <RefreshCcw className="w-3 h-3" />
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-500 mb-6 max-w-md">{errorMessage}</p>
      
      {onRetry && (
        <button 
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-2.5 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
        >
          <RefreshCcw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorDisplay;
