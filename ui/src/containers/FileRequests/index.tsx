import React from 'react';
import { useSelector } from 'react-redux';
import { message } from 'antd';
import type { RootState } from '../../redux/store';
import {
  useGetFileRequestsQuery,
  useUpdateFileRequestStatusMutation,
} from '../../redux/features/gallery/galleryApiSlice';
import { useDeletePostMutation } from '../../redux/features/post/postApiSlice';
import DataTable from '../../components/shared/DataTable';
import { TableRowSkeleton } from '../../shared/shared-components/Skeleton';
import { FiExternalLink } from 'react-icons/fi';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RequestItem {
  ID: string;
  FileName: string;
  FileUrl: string;
  RequestReason: string;
  Status: string;
  CreatedAt: string;
  RequestedByUser?: {
    FullName: string;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Resolve display name from the FileUrl/FileName */
const resolveTargetName = (record: RequestItem) => {
  if (record.FileUrl?.includes('/POST:')) return record.FileName;
  return record.FileName?.split('/').pop() || 'Unknown';
};

/** True when the request targets a post instead of a raw file */
const isPostRequest = (record: RequestItem) =>
  record.FileUrl?.includes('/POST:');

// ─── Status badge ─────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles =
    status === 'APPROVED'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : status === 'REJECTED'
        ? 'bg-rose-50 text-rose-600 border-rose-200'
        : 'bg-amber-50 text-amber-700 border-amber-200';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles}`}
    >
      {/* Dot indicator */}
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === 'APPROVED'
            ? 'bg-emerald-500'
            : status === 'REJECTED'
              ? 'bg-rose-500'
              : 'bg-amber-500'
        }`}
      />
      {status}
    </span>
  );
};

// ─── Type badge ───────────────────────────────────────────────────────────────

const TypeBadge: React.FC<{ record: RequestItem }> = ({ record }) => {
  if (isPostRequest(record)) {
    return (
      <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-xs font-semibold">
        POST
      </span>
    );
  }
  const ext = record.FileName?.split('.').pop()?.toUpperCase() || 'FILE';
  return (
    <span className="inline-block px-2 py-0.5 bg-gray-50 text-gray-600 border border-gray-200 rounded-md text-xs font-semibold">
      {ext}
    </span>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const FileRequestsPage: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const userRole =
    useSelector((state: RootState) => state.auth.user?.role) || 'USER';

  const { data: responseData, isLoading, isFetching } = useGetFileRequestsQuery();
  const [updateStatus] = useUpdateFileRequestStatusMutation();
  const [deletePost] = useDeletePostMutation();

  const requests: RequestItem[] =
    responseData?.data && Array.isArray(responseData.data)
      ? responseData.data
      : Array.isArray(responseData)
        ? responseData
        : [];

  // ── Handler ──────────────────────────────────────────────────────────────

  const handleUpdateStatus = async (record: RequestItem, status: string) => {
    try {
      if (status === 'APPROVED' && isPostRequest(record)) {
        const postId = record.FileUrl.split('/POST:')[1];
        await deletePost(postId).unwrap();
      }
      await updateStatus({ id: record.ID, status }).unwrap();
      messageApi.success(`Request ${status.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Error updating request status:', error);
      messageApi.error('Error updating status');
    }
  };

  // ── Column definitions ───────────────────────────────────────────────────
  //
  // Mobile compact row shows:  "Requested By" + Actions
  // Mobile expanded panel shows: Target Name, Type, Reason, Status, Date
  //
  // Desktop shows all columns (hideOnMobile is ignored).

  const columns = [
    {
      key: 'RequestedByUser',
      label: 'Requested By',
      // ✅ No hideOnMobile — always visible on mobile (the identity column)
      render: (_val: any, row: RequestItem) => (
        <span className="font-medium text-gray-800">
          {row.RequestedByUser?.FullName || 'Unknown'}
        </span>
      ),
    },
    {
      key: 'FileName',
      label: 'Target',
      hideOnMobile: true, // shown in expanded panel on mobile
      render: (_val: string, row: RequestItem) => (
        <span className="text-gray-700 text-sm">{resolveTargetName(row)}</span>
      ),
    },
    {
      key: 'FileUrl',
      label: 'Type',
      hideOnMobile: true, // shown in expanded panel on mobile
      render: (_val: string, row: RequestItem) => <TypeBadge record={row} />,
    },
    {
      key: 'RequestReason',
      label: 'Reason',
      hideOnMobile: true, // shown in expanded panel on mobile
      render: (val: string) => (
        <span className="text-gray-600 truncate max-w-48 block text-sm" title={val}>
          {val}
        </span>
      ),
    },
    {
      key: 'Status',
      label: 'Status',
      hideOnMobile: true, // shown in expanded panel on mobile
      render: (val: string) => <StatusBadge status={val} />,
    },
    {
      key: 'CreatedAt',
      label: 'Date',
      hideOnMobile: true, // shown in expanded panel on mobile
      render: (val: string) => (
        <span className="text-gray-500 text-sm">
          {new Date(val).toLocaleDateString()}
        </span>
      ),
    },
  ];

  // ── Action renderer ──────────────────────────────────────────────────────

  const renderActions = (row: RequestItem) => (
    <div className="flex items-center justify-end gap-2 flex-wrap">
      {/* View button */}
      {isPostRequest(row) ? (
        <button
          disabled
          title="Cannot preview post content directly from here"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed"
        >
          View Post
        </button>
      ) : (
        <a
          href={row.FileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 transition-colors"
        >
          <FiExternalLink className="w-3 h-3" />
          View
        </a>
      )}

      {/* Approve / Reject — admin only, pending only */}
      {userRole === 'ADMIN' && row.Status === 'PENDING' && (
        <>
          <button
            onClick={() => handleUpdateStatus(row, 'APPROVED')}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-colors"
          >
            Approve
          </button>
          <button
            onClick={() => handleUpdateStatus(row, 'REJECTED')}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition-colors"
          >
            Reject
          </button>
        </>
      )}

      {/* Already actioned */}
      {row.Status !== 'PENDING' && (
        <span className="text-xs text-gray-400 italic px-1">Actioned</span>
      )}
    </div>
  );

  // ── Expanded panel content ────────────────────────────────────────────────

  const expandedRowRender = (row: RequestItem) => (
    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
      {/* Target Name */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">
          Target
        </p>
        <p className="text-sm font-medium text-gray-700">{resolveTargetName(row)}</p>
      </div>

      {/* Type */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
          Type
        </p>
        <TypeBadge record={row} />
      </div>

      {/* Reason — full width so long text wraps nicely */}
      <div className="col-span-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">
          Reason
        </p>
        <p className="text-sm text-gray-700">{row.RequestReason}</p>
      </div>

      {/* Status */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
          Status
        </p>
        <StatusBadge status={row.Status} />
      </div>

      {/* Date */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">
          Date
        </p>
        <p className="text-sm font-medium text-gray-700">
          {new Date(row.CreatedAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      {contextHolder}

      <h2 className="text-xl font-semibold text-gray-900 tracking-tight mb-6">
        File Requests
      </h2>

      {isLoading || isFetching ? (
        <TableRowSkeleton count={5} columns={6} />
      ) : (
        <DataTable
          columns={columns}
          data={requests}
          actions={renderActions}
          expandable={{ expandedRowRender }}
        />
      )}
    </div>
  );
};

export default FileRequestsPage;

