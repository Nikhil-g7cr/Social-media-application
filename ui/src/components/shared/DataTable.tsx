import React, { useState, useEffect } from 'react';

interface Column {
  key: string;
  label: string;
  render?: (val: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  actions?: (row: any) => React.ReactNode;
  pageSize?: number;
}

const DataTable: React.FC<DataTableProps> = ({ columns, data, actions, pageSize = 10 }) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 whenever data changes (e.g. tab switch, filter toggle)
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Clamp current page in case data shrinks
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const pageData = data.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Build page number buttons (show at most 5, centred around current page)
  const buildPageNumbers = () => {
    const delta = 2; // pages to show on either side of current
    const range: number[] = [];
    const start = Math.max(1, safePage - delta);
    const end = Math.min(totalPages, safePage + delta);

    for (let i = start; i <= end; i++) range.push(i);

    // Prepend "1 ..." if needed
    if (start > 2) range.unshift(-1, 1); // -1 = ellipsis
    else if (start === 2) range.unshift(1);

    // Append "... last" if needed
    if (end < totalPages - 1) range.push(-2, totalPages); // -2 = ellipsis
    else if (end === totalPages - 1) range.push(totalPages);

    return range;
  };

  return (
    <div className="flex flex-col gap-0">
      {/* Table */}
      <div className={`overflow-x-auto border border-gray-200 ${totalPages > 1 ? 'rounded-t-lg' : 'rounded-lg'}`}>
        <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
          <thead className="ltr:text-left rtl:text-right">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="whitespace-nowrap px-4 py-3 font-semibold text-xs uppercase tracking-wider text-gray-500 text-left bg-white border-b border-gray-200"
                >
                  {col.label}
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-gray-500 text-right bg-white border-b border-gray-200">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pageData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No data available.
                </td>
              </tr>
            ) : (
              pageData.map((row, i) => (
                <tr key={row.id || row.ID || startIndex + i} className="hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col.key} className="whitespace-nowrap px-4 py-2.5 text-sm text-gray-700">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="whitespace-nowrap px-4 py-2.5 text-right">
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer — only rendered when there is more than one page */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-t-0 border-gray-200 rounded-b-lg">
          {/* Item count */}
          <p className="text-xs text-gray-500">
            Showing{' '}
            <span className="font-medium text-gray-700">{startIndex + 1}</span>
            {' '}–{' '}
            <span className="font-medium text-gray-700">{endIndex}</span>
            {' '}of{' '}
            <span className="font-medium text-gray-700">{totalItems}</span>
          </p>

          {/* Page controls */}
          <div className="flex items-center gap-1">
            {/* Previous */}
            <button
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage === 1}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>

            {/* Page numbers */}
            {buildPageNumbers().map((num, idx) =>
              num < 0 ? (
                <span key={`ellipsis-${idx}`} className="px-1.5 text-gray-400 text-xs select-none">
                  …
                </span>
              ) : (
                <button
                  key={num}
                  onClick={() => goToPage(num)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    num === safePage
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {num}
                </button>
              )
            )}

            {/* Next */}
            <button
              onClick={() => goToPage(safePage + 1)}
              disabled={safePage === totalPages}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
