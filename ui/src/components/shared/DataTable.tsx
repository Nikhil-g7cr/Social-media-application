import React, { useState, useEffect } from "react";

interface Column {
  key: string;
  label: string;
  render?: (val: any, row: any) => React.ReactNode;
  /** When true, this column is hidden on mobile and shown inside the expanded panel */
  hideOnMobile?: boolean;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  actions?: (row: any) => React.ReactNode;
  pageSize?: number;
  /**
   * Pass this to enable Ant Design-style expandable rows on mobile/tablet.
   * On desktop all columns remain visible and no expand toggle appears.
   */
  expandable?: {
    expandedRowRender: (row: any) => React.ReactNode;
  };
  /** Window width below which "mobile expand" mode activates. Defaults to 768. */
  mobileBreakpoint?: number;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  actions,
  pageSize = 10,
  expandable,
  mobileBreakpoint = 768,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | string | null>(null);

  // Reset to page 1 whenever data changes (tab switch, filter toggle, etc.)
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  // Track viewport width against the breakpoint
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < mobileBreakpoint);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileBreakpoint]);

  // ── Derived state ──────────────────────────────────────────────────────────
  /** True when we should render the compact mobile view with row expansion */
  const mobileExpandMode = isMobile && !!expandable;

  /**
   * On mobile expand mode: hide columns marked hideOnMobile (they appear in
   * the expanded panel instead). On desktop: show everything.
   */
  const visibleColumns = mobileExpandMode
    ? columns.filter((c) => !c.hideOnMobile)
    : columns;

  // Colspan for the expanded content row
  const expandedColspan =
    visibleColumns.length + (actions ? 1 : 0) + (mobileExpandMode ? 1 : 0);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const pageData = data.slice(startIndex, endIndex);

  const goToPage = (page: number) =>
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));

  const toggleExpand = (id: number | string) =>
    setExpandedRow((prev) => (prev === id ? null : id));

  // Build page-number buttons (±2 around current, with ellipsis)
  const buildPageNumbers = () => {
    const delta = 2;
    const range: number[] = [];
    const start = Math.max(1, safePage - delta);
    const end = Math.min(totalPages, safePage + delta);
    for (let i = start; i <= end; i++) range.push(i);
    if (start > 2) range.unshift(-1, 1);
    else if (start === 2) range.unshift(1);
    if (end < totalPages - 1) range.push(-2, totalPages);
    else if (end === totalPages - 1) range.push(totalPages);
    return range;
  };

  return (
    <div className="flex flex-col gap-0">
      {/* ── Table wrapper ───────────────────────────────────────────────────── */}
      <div
        className={`overflow-x-auto border border-gray-200 ${
          totalPages > 1 ? "rounded-t-lg" : "rounded-lg"
        }`}
      >
        <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
          {/* ── Head ──────────────────────────────────────────────────────── */}
          <thead className="ltr:text-left rtl:text-right">
            <tr>
              {/* Empty header for the chevron column (mobile only) */}
              {mobileExpandMode && (
                <th className="w-10 bg-white border-b border-gray-200" />
              )}

              {visibleColumns.map((col) => (
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

          {/* ── Body ──────────────────────────────────────────────────────── */}
          <tbody className="divide-y divide-gray-200">
            {pageData.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (actions ? 1 : 0) +
                    (mobileExpandMode ? 1 : 0)
                  }
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No data available.
                </td>
              </tr>
            ) : (
              pageData.map((row, i) => {
                const rowId = row.id ?? row.ID ?? startIndex + i;
                const isExpanded = expandedRow === rowId;

                return (
                  <React.Fragment key={rowId}>
                    {/* ── Data row ──────────────────────────────────────── */}
                    <tr
                      className={`transition-colors duration-150 ${
                        isExpanded ? "bg-blue-50/40" : "hover:bg-gray-50"
                      }`}
                    >
                      {/* Ant Design-style rotating chevron */}
                      {mobileExpandMode && (
                        <td className="pl-3 pr-1 py-3">
                          <button
                            onClick={() => toggleExpand(rowId)}
                            aria-label={isExpanded ? "Collapse row" : "Expand row"}
                            className={`flex items-center justify-center w-5.5 h-5.5 rounded border transition-all duration-200 ${
                              isExpanded
                                ? "border-blue-300 bg-blue-50 text-blue-500"
                                : "border-gray-200 bg-white text-gray-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50"
                            }`}
                          >
                            {/* Chevron SVG — rotates via inline style for reliable cross-browser animation */}
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2.5}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-3 h-3"
                              style={{
                                transform: isExpanded
                                  ? "rotate(90deg)"
                                  : "rotate(0deg)",
                                transition: "transform 0.2s ease",
                              }}
                            >
                              <path d="M9 18l6-6-6-6" />
                            </svg>
                          </button>
                        </td>
                      )}

                      {/* Data cells */}
                      {visibleColumns.map((col) => (
                        <td
                          key={col.key}
                          className="whitespace-nowrap px-4 py-2.5 text-sm text-gray-700"
                        >
                          {col.render
                            ? col.render(row[col.key], row)
                            : row[col.key]}
                        </td>
                      ))}

                      {/* Actions cell */}
                      {actions && (
                        <td className="whitespace-nowrap px-4 py-2.5 text-right">
                          {actions(row)}
                        </td>
                      )}
                    </tr>

                    {/* ── Expanded detail panel (mobile only) ───────────── */}
                    {mobileExpandMode && isExpanded && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={expandedColspan} className="px-0 pt-0 pb-2">
                          {/*
                           * Ant Design flavour:
                           * - bordered card that looks attached to the row above
                           * - indigo left-accent stripe (Ant's signature for expand panels)
                           */}
                          <div className="mx-3 rounded-b-lg border border-t-0 border-indigo-100 bg-white shadow-sm overflow-hidden">
                            <div className="flex">
                              {/* Left accent stripe */}
                              <div className="w-0.75 shrink-0 bg-indigo-400" />
                              <div className="flex-1 px-4 py-3">
                                {expandable!.expandedRowRender(row)}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination footer ────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-t-0 border-gray-200 rounded-b-lg">
          <p className="text-xs text-gray-500">
            Showing{" "}
            <span className="font-medium text-gray-700">{startIndex + 1}</span>{" "}
            –{" "}
            <span className="font-medium text-gray-700">{endIndex}</span> of{" "}
            <span className="font-medium text-gray-700">{totalItems}</span>
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage === 1}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>

            {buildPageNumbers().map((num, idx) =>
              num < 0 ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-1.5 text-gray-400 text-xs select-none"
                >
                  …
                </span>
              ) : (
                <button
                  key={num}
                  onClick={() => goToPage(num)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    num === safePage
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {num}
                </button>
              )
            )}

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
