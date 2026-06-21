import React from 'react';

interface Column {
  key: string;
  label: string;
  render?: (val: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  actions?: (row: any) => React.ReactNode;
}

const DataTable: React.FC<DataTableProps> = ({ columns, data, actions }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
        <thead className="ltr:text-left rtl:text-right">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="whitespace-nowrap px-4 py-3 font-semibold text-gray-900 text-left bg-gray-50">
                {col.label}
              </th>
            ))}
            {actions && <th className="px-4 py-3 font-semibold text-gray-900 text-right bg-gray-50">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-8 text-center text-gray-500">
                No data available.
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={row.ID || i} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={col.key} className="whitespace-nowrap px-4 py-3 text-gray-700">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
                {actions && (
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    {actions(row)}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
