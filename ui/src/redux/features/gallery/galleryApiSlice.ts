import { apiSlice } from '../../apiSlice';

export interface LogFileItem {
  name: string;
  displayName: string;
  url: string;
  size: number;
  lastModified: string;
  type: 'app-log' | 'error-log';
}

export const galleryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFiles: builder.query<any[], void>({
      query: () => ({
        url: 'files',
        method: 'GET',
      }),
      providesTags: ['File'],
    }),
    deleteFile: builder.mutation<any, string>({
      query: (url) => ({
        url: `files?url=${encodeURIComponent(url)}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['File'],
    }),
    getFileRequests: builder.query<any, void>({
      query: () => ({
        url: 'gallery/requests',
        method: 'GET',
      }),
      providesTags: ['FileRequest'],
    }),
    createFileRequest: builder.mutation<any, any>({
      query: (data) => ({
        url: 'gallery/requests',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['FileRequest'],
    }),
    updateFileRequestStatus: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `gallery/requests/${id}/status`,
        method: 'PATCH',
        data: { status },
      }),
      invalidatesTags: ['FileRequest'],
    }),

    // ─── Log File Endpoints ────────────────────────────────────────────────
    getLogFiles: builder.query<LogFileItem[], void>({
      query: () => ({
        url: 'files/logs',
        method: 'GET',
      }),
      providesTags: ['LogFile'],
    }),
    getLogFileContent: builder.query<any[], string>({
      query: (blobPath) => ({
        url: `files/logs/content?blobPath=${encodeURIComponent(blobPath)}`,
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetFilesQuery,
  useDeleteFileMutation,
  useGetFileRequestsQuery,
  useCreateFileRequestMutation,
  useUpdateFileRequestStatusMutation,
  useGetLogFilesQuery,
  useGetLogFileContentQuery,
  useLazyGetLogFileContentQuery,
} = galleryApiSlice;
