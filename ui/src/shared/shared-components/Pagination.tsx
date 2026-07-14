import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaginationProps {
  /** The currently active page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of items across all pages */
  totalItems: number;
  /** Number of items shown per page */
  pageSize: number;
  /** Callback fired when the user selects a new page */
  onPageChange: (page: number) => void;
  /** Optional extra class names for the container */
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Builds the array of page tokens to display.
 * Numbers are actual page numbers; `null` represents an ellipsis gap.
 *
 * Example for currentPage=5, totalPages=10:
 *   [1, null, 4, 5, 6, null, 10]
 */
function buildPageTokens(
  currentPage: number,
  totalPages: number
): (number | null)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const tokens: (number | null)[] = [];

  // Always show first page
  tokens.push(1);

  if (currentPage > 3) {
    tokens.push(null); // left ellipsis
  }

  // Window around current page
  const rangeStart = Math.max(2, currentPage - 1);
  const rangeEnd = Math.min(totalPages - 1, currentPage + 1);

  for (let p = rangeStart; p <= rangeEnd; p++) {
    tokens.push(p);
  }

  if (currentPage < totalPages - 2) {
    tokens.push(null); // right ellipsis
  }

  // Always show last page
  tokens.push(totalPages);

  return tokens;
}

// ─── Component ────────────────────────────────────────────────────────────────

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className = '',
}) => {
  // Don't render anything if there is only one page or no items
  if (totalPages <= 1) return null;

  const firstItem = (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(currentPage * pageSize, totalItems);

  const tokens = buildPageTokens(currentPage, totalPages);

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/50 ${className}`}
    >
      {/* Item count label */}
      <p className="text-sm text-gray-500 select-none shrink-0">
        Showing{' '}
        <span className="font-semibold text-gray-700">{firstItem}</span>
        {' – '}
        <span className="font-semibold text-gray-700">{lastItem}</span>
        {' of '}
        <span className="font-semibold text-gray-700">{totalItems}</span>
      </p>

      {/* Page controls */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className={`
            flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition
            ${
              currentPage === 1
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:bg-white hover:shadow-sm hover:text-blue-600 border border-transparent hover:border-gray-200'
            }
          `}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page numbers */}
        {tokens.map((token, idx) =>
          token === null ? (
            <span
              key={`ellipsis-${idx}`}
              className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm select-none"
            >
              …
            </span>
          ) : (
            <button
              key={token}
              onClick={() => onPageChange(token)}
              aria-label={`Page ${token}`}
              aria-current={token === currentPage ? 'page' : undefined}
              className={`
                w-9 h-9 rounded-lg text-sm font-medium transition
                ${
                  token === currentPage
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-200 cursor-default'
                    : 'text-gray-600 hover:bg-white hover:shadow-sm hover:text-blue-600 border border-transparent hover:border-gray-200'
                }
              `}
            >
              {token}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className={`
            flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition
            ${
              currentPage === totalPages
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:bg-white hover:shadow-sm hover:text-blue-600 border border-transparent hover:border-gray-200'
            }
          `}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
