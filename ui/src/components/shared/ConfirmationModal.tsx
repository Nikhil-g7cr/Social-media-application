import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiAlertTriangle, FiX, FiCheckCircle, FiInfo } from 'react-icons/fi';

export type IconType = 'warning' | 'success' | 'info' | 'error';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  icon?: IconType;
  requireTextMatch?: string;
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  icon = 'warning',
  requireTextMatch,
  isLoading = false,
}) => {
  const [inputText, setInputText] = useState('');
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      // Small delay to allow CSS transition to work
      setTimeout(() => setIsVisible(true), 10);
      setInputText(''); // Reset input on open
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsRendered(false), 300); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered) return null;

  const isConfirmDisabled = requireTextMatch ? inputText !== requireTextMatch : false;

  const handleConfirm = () => {
    if (!isConfirmDisabled && !isLoading) {
      onConfirm();
    }
  };

  const getIconElement = () => {
    switch (icon) {
      case 'success':
        return <FiCheckCircle className="w-6 h-6 text-emerald-500" />;
      case 'info':
        return <FiInfo className="w-6 h-6 text-blue-500" />;
      case 'error':
      case 'warning':
      default:
        return <FiAlertTriangle className="w-6 h-6 text-rose-500" />;
    }
  };

  const getIconBackground = () => {
    switch (icon) {
      case 'success':
        return 'bg-emerald-100';
      case 'info':
        return 'bg-blue-100';
      case 'error':
      case 'warning':
      default:
        return 'bg-rose-100';
    }
  };

  const getConfirmButtonClasses = () => {
    const baseClasses = "px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center min-w-[100px]";
    
    if (isConfirmDisabled || isLoading) {
      return `${baseClasses} bg-gray-100 text-gray-400 cursor-not-allowed`;
    }

    switch (icon) {
      case 'success':
        return `${baseClasses} bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm`;
      case 'info':
        return `${baseClasses} bg-blue-600 hover:bg-blue-700 text-white shadow-sm`;
      case 'error':
      case 'warning':
      default:
        return `${baseClasses} bg-rose-600 hover:bg-rose-700 text-white shadow-sm`;
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Modal content */}
      <div 
        className={`relative bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md p-6 overflow-hidden transition-all duration-300 transform ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getIconBackground()}`}>
            {getIconElement()}
          </div>
          <div className="pt-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <div className="text-gray-600 text-sm">
              {description}
            </div>
          </div>
        </div>

        {requireTextMatch && (
          <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To confirm, type <span className="font-bold font-mono text-gray-900 select-all">{requireTextMatch}</span> in the field below.
            </label>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                inputText === requireTextMatch 
                  ? 'border-emerald-300 focus:ring-emerald-200 bg-emerald-50/30' 
                  : inputText.length > 0 && inputText !== requireTextMatch
                    ? 'border-rose-300 focus:ring-rose-200'
                    : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-400'
              }`}
              placeholder={requireTextMatch}
            />
            {inputText.length > 0 && inputText !== requireTextMatch && (
              <p className="text-xs text-rose-500 mt-2">
                Please type "{requireTextMatch}" exactly to continue.
              </p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all duration-200 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isConfirmDisabled || isLoading}
            className={getConfirmButtonClasses()}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmationModal;
