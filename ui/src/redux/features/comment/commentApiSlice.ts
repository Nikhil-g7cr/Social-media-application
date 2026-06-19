import { apiSlice } from '../../apiSlice';

export interface Comment {
    id: string;
    postId: string;
    authorId: string;
    content: string;
    createdAt: string;
}

export const commentApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getCommentsByPostId: builder.query<Comment[], string>({
            query: (postId) => ({ url: `/comment/post/${postId}` }),
            providesTags: (_result, _error, postId) => [{ type: 'Comment', id: `Post_${postId}` }],
        }),
        addComment: builder.mutation<Comment, { postId: string, content: string }>({
            query: (data) => ({
                url: '/comment',
                method: 'POST',
                data,
            }),
            invalidatesTags: (_result, _error, { postId }) => [{ type: 'Comment', id: `Post_${postId}` }],
        }),
        deleteComment: builder.mutation<{ success: boolean }, string>({
            query: (id) => ({
                url: `/comment/${id}`,
                method: 'DELETE',
            }),
            // Might need to invalidate the whole list or specific post's comments.
            invalidatesTags: ['Comment'],
        }),
    }),
});

export const {
    useGetCommentsByPostIdQuery,
    useAddCommentMutation,
    useDeleteCommentMutation,
} = commentApiSlice;
