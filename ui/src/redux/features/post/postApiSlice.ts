import { apiSlice } from '../../apiSlice';

export interface Post {
    id: string;
    author: {
        id: string;
        name: string;
        username: string;
        avatarUrl: string;
    };
    content: string;
    timestamp: string;
    likes: number;
    comments: number;
    isLikedByMe?: boolean;
    mediaUrl?: string;
}

export const postApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPosts: builder.query<Post[], void>({
            query: () => ({ url: 'posts/feed' }),
            transformResponse: (response: any) => {
                // response is AppResponse -> data -> posts
                const rawPosts = response?.data?.posts || [];
                return rawPosts.map((p: any) => ({
                    id: p.ID,
                    author: {
                        id: p.User?.ID || p.UserID,
                        name: p.User?.FullName || 'Unknown',
                        username: p.User?.UserName || 'unknown',
                        avatarUrl: p.User?.ProfilePictureURL || `https://ui-avatars.com/api/?name=${p.User?.FullName || 'User'}&background=random`
                    },
                    content: p.Content || '',
                    timestamp: new Date(p.CreatedAt).toLocaleString(), // Format timestamp
                    likes: 0, // Backend doesn't return this yet
                    comments: 0,
                    isLikedByMe: false,
                    mediaUrl: p.MediaURL,
                }));
            },
            providesTags: ['Post'],
        }),
        getAllExplorePosts: builder.query<Post[], void>({
            query: () => ({ url: 'posts' }),
            transformResponse: (response: any) => {
                const rawPosts = response?.data?.posts || [];
                return rawPosts.map((p: any) => ({
                    id: p.ID,
                    author: {
                        id: p.User?.ID || p.UserID,
                        name: p.User?.FullName || 'Unknown',
                        username: p.User?.UserName || 'unknown',
                        avatarUrl: p.User?.ProfilePictureURL || `https://ui-avatars.com/api/?name=${p.User?.FullName || 'User'}&background=random`
                    },
                    content: p.Content || '',
                    timestamp: new Date(p.CreatedAt).toLocaleString(), // Format timestamp
                    likes: 0,
                    comments: 0,
                    isLikedByMe: false,
                    mediaUrl: p.MediaURL,
                }));
            },
            providesTags: ['Post'],
        }),
        getPostById: builder.query<Post, string>({
            query: (id) => ({ url: `posts/${id}` }),
            providesTags: (_result, _error, id) => [{ type: 'Post', id }],
        }),
        createPost: builder.mutation<Post, Partial<Post>>({
            query: (initialPost) => ({
                url: 'posts',
                method: 'POST',
                data: initialPost, // Since we use axiosBaseQuery, it's 'data' instead of 'body'
            }),
            invalidatesTags: ['Post'],
        }),
        updatePost: builder.mutation<Post, Partial<Post> & { id: string }>({
            query: (post) => ({
                url: `posts/${post.id}`,
                method: 'PATCH',
                data: post,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Post', id }],
        }),
        deletePost: builder.mutation<{ success: boolean; id: string }, string>({
            query: (id) => ({
                url: `posts/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Post', id }],
        }),
    }),
});

export const {
    useGetPostsQuery,
    useGetAllExplorePostsQuery,
    useGetPostByIdQuery,
    useCreatePostMutation,
    useUpdatePostMutation,
    useDeletePostMutation,
} = postApiSlice;
