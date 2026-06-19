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
    likedBy?: string[];
}

export const postApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPosts: builder.query<Post[], void>({
            query: () => ({ url: 'feed' }),
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
                    likes: p.Likes?.length || 0,
                    comments: 0,
                    isLikedByMe: false,
                    likedBy: p.Likes?.map((l: any) => l.UserID) || [],
                    mediaUrl: p.MediaURL,
                }));
            },
            providesTags: ['Post'],
            async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
                // Connect to socket and listen for real-time feed updates
                const { initializeSocket } = await import('../../../utils/socket');
                const socket = initializeSocket();
                try {
                    await cacheDataLoaded;
                    const listener = (newPostRaw: any) => {
                        updateCachedData((draft) => {
                            // Avoid duplicates
                            if (draft.find((p) => p.id === newPostRaw.ID)) return;
                            
                            const newPost: Post = {
                                id: newPostRaw.ID,
                                author: {
                                    id: newPostRaw.User?.ID || newPostRaw.UserID,
                                    name: newPostRaw.User?.FullName || 'Unknown',
                                    username: newPostRaw.User?.UserName || 'unknown',
                                    avatarUrl: newPostRaw.User?.ProfilePictureURL || `https://ui-avatars.com/api/?name=${newPostRaw.User?.FullName || 'User'}&background=random`
                                },
                                content: newPostRaw.Content || '',
                                timestamp: new Date(newPostRaw.CreatedAt).toLocaleString(),
                                likes: newPostRaw.Likes?.length || 0,
                                comments: 0,
                                isLikedByMe: false,
                                likedBy: newPostRaw.Likes?.map((l: any) => l.UserID) || [],
                                mediaUrl: newPostRaw.MediaURL,
                            };
                            draft.unshift(newPost); // Add new post to top of feed
                        });
                    };
                    socket.on('newPostInFeed', listener);
                } catch {}
                
                await cacheEntryRemoved;
            }
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
                    likes: p.Likes?.length || 0,
                    comments: 0,
                    isLikedByMe: false,
                    likedBy: p.Likes?.map((l: any) => l.UserID) || [],
                    mediaUrl: p.MediaURL,
                }));
            },
            providesTags: ['Post'],
        }),
        getPostsByUserId: builder.query<Post[], string>({
            query: (userId) => ({ url: `posts/user/${userId}` }),
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
                    timestamp: new Date(p.CreatedAt).toLocaleString(),
                    likes: p.Likes?.length || 0,
                    comments: 0,
                    isLikedByMe: false,
                    likedBy: p.Likes?.map((l: any) => l.UserID) || [],
                    mediaUrl: p.MediaURL,
                }));
            },
            providesTags: ['Post'],
        }),
        getLikedPostsByUserId: builder.query<Post[], string>({
            query: (userId) => ({ url: `posts/liked/user/${userId}` }),
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
                    timestamp: new Date(p.CreatedAt).toLocaleString(),
                    likes: p.Likes?.length || 0,
                    comments: 0,
                    isLikedByMe: true, // We know they liked it
                    likedBy: p.Likes?.map((l: any) => l.UserID) || [],
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
        getUploadUrl: builder.mutation<{ uploadUrl: string; blobPath: string; expiresIn: string }, { fileName: string; contentType: string }>({
            query: (data) => ({
                url: 'files/upload-url',
                method: 'POST',
                data,
            }),
        }),
        getReadUrl: builder.query<{ url: string }, string>({
            query: (blobPath) => ({
                url: `files/read-url?url=${encodeURIComponent(blobPath)}`,
                method: 'GET',
            }),
        }),
        uploadImageToAzure: builder.mutation<void, { uploadUrl: string; file: File }>({
            queryFn: async ({ uploadUrl, file }) => {
                try {
                    const uploadResponse = await fetch(uploadUrl, {
                        method: 'PUT',
                        body: file,
                        headers: {
                            'x-ms-blob-type': 'BlockBlob',
                            'Content-Type': file.type,
                        },
                    });
                    if (!uploadResponse.ok) {
                        return { error: { status: uploadResponse.status, data: 'Failed to upload image to Azure' } };
                    }
                    return { data: undefined };
                } catch (error: any) {
                    return { error: { status: 'FETCH_ERROR', error: error.message } };
                }
            },
        }),
    }),
});

export const {
    useGetPostsQuery,
    useGetAllExplorePostsQuery,
    useGetPostsByUserIdQuery,
    useGetLikedPostsByUserIdQuery,
    useGetPostByIdQuery,
    useCreatePostMutation,
    useUpdatePostMutation,
    useDeletePostMutation,
    useGetUploadUrlMutation,
    useGetReadUrlQuery,
    useUploadImageToAzureMutation,
} = postApiSlice;
