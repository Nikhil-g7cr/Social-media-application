import { apiSlice } from '../../apiSlice';

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
  }),
});

export const {
  useGetFilesQuery,
  useDeleteFileMutation,
  useGetFileRequestsQuery,
  useCreateFileRequestMutation,
  useUpdateFileRequestStatusMutation,
} = galleryApiSlice;
