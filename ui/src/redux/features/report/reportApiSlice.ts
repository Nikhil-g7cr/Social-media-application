import { apiSlice } from '../../apiSlice';

export interface Report {
    id: string;
    reporterId: string;
    targetType: string;
    targetId: string;
    reason: string;
    status: string;
    createdAt: string;
    resolvedAt?: string;
    resolvedBy?: string;
    reporterName?: string;
    resolverName?: string;
}

export const reportApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getReports: builder.query<Report[], void>({
            query: () => ({ url: 'report' }),
            transformResponse: (response: any) => {
                const rawReports = response?.data || response || [];
                return rawReports.map((r: any) => ({
                    id: r.ID || r.id,
                    reporterId: r.ReporterID,
                    targetType: r.TargetType,
                    targetId: r.TargetID,
                    reason: r.Reason,
                    status: r.Status,
                    createdAt: new Date(r.CreatedAt).toLocaleString(),
                    resolvedAt: r.ResolvedAt ? new Date(r.ResolvedAt).toLocaleString() : undefined,
                    resolvedBy: r.ResolvedBy,
                    reporterName: r.Reporter?.FullName || r.Reporter?.UserName || 'Unknown',
                    resolverName: r.Resolver?.FullName || r.Resolver?.UserName || 'Unknown',
                }));
            },
            providesTags: ['Report'],
        }),
        resolveReport: builder.mutation<Report, { id: string; status: string }>({
            query: ({ id, status }) => ({
                url: `report/${id}/resolve`,
                method: 'PATCH',
                data: { status },
            }),
            async onQueryStarted({ id, status }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    reportApiSlice.util.updateQueryData('getReports', undefined, (draft) => {
                        const report = draft.find(r => r.id === id);
                        if (report) {
                            report.status = status;
                        }
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
            invalidatesTags: ['Report'],
        }),
        createReport: builder.mutation<Report, { targetType: string; targetId: string; reason: string }>({
            query: (data) => ({
                url: 'report',
                method: 'POST',
                data,
            }),
            invalidatesTags: ['Report'],
        }),
    }),
});

export const {
    useGetReportsQuery,
    useResolveReportMutation,
    useCreateReportMutation,
} = reportApiSlice;
