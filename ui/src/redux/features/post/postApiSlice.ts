import { apiSlice } from '../../apiSlice';

export interface Post {
    id: string;
    content: string;
    authorId: string;
    createdAt: string;
    updatedAt: string;
    mediaUrl?: string;
}

export const postApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPosts: builder.query<Post[], void>({
            query: () => ({ url: '/post' }),
            providesTags: ['Post'],
        }),
        getPostById: builder.query<Post, string>({
            query: (id) => ({ url: `/post/${id}` }),
            providesTags: (_result, _error, id) => [{ type: 'Post', id }],
        }),
        createPost: builder.mutation<Post, Partial<Post>>({
            query: (initialPost) => ({
                url: '/post',
                method: 'POST',
                data: initialPost, // Since we use axiosBaseQuery, it's 'data' instead of 'body'
            }),
            invalidatesTags: ['Post'],
        }),
        updatePost: builder.mutation<Post, Partial<Post> & { id: string }>({
            query: (post) => ({
                url: `/post/${post.id}`,
                method: 'PATCH',
                data: post,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Post', id }],
        }),
        deletePost: builder.mutation<{ success: boolean; id: string }, string>({
            query: (id) => ({
                url: `/post/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Post', id }],
        }),
    }),
});

export const {
    useGetPostsQuery,
    useGetPostByIdQuery,
    useCreatePostMutation,
    useUpdatePostMutation,
    useDeletePostMutation,
} = postApiSlice;
