import { apiSlice } from '../../apiSlice';

export interface Comment {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    content: string;
    time: string;
    likes: number;
    isLiked: boolean;
}

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
    type?: string;
    mediaUrl?: string;
    media?: {
        mediaType: string;
        mediaUrl: string;
        mimeType?: string;
        fileSize?: number;
        blobName?: string;
        fileName?: string;
    }[];
    likedBy?: string[];
}

export interface PaginatedPosts {
    posts: Post[];
    hasMore: boolean;
}

export const postApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPosts: builder.query<PaginatedPosts, { page: number; limit: number }>({
            query: ({ page, limit }) => ({ url: `feed?page=${page}&limit=${limit}` }),
            transformResponse: (response: any) => {
                const rawPosts = response?.data?.posts || [];
                const hasMore = response?.data?.pagination?.hasNextPage || false;
                const posts = rawPosts.map((p: any) => ({
                    id: p.ID,
                    author: {
                        id: p.User?.ID || p.UserID,
                        name: p.User?.FullName || 'Unknown',
                        username: p.User?.UserName || 'unknown',
                        avatarUrl: p.User?.ProfilePictureUrl || `https://ui-avatars.com/api/?name=${p.User?.FullName || 'User'}&background=random`
                    },
                    content: p.Content || '',
                    timestamp: new Date(p.CreatedAt).toLocaleString(),
                    likes: p.Likes?.length || 0,
                    comments: p.Comments?.length || 0,
                    isLikedByMe: false,
                    likedBy: p.Likes?.map((l: any) => l.UserID) || [],
                    type: p.Type,
                    mediaUrl: p.MediaURL,
                    media: p.Media?.map((m: any) => ({ mediaType: m.MediaType, mediaUrl: m.MediaURL, mimeType: m.MimeType, fileSize: m.FileSize, blobName: m.BlobName, fileName: m.FileName })) || [],
                }));
                return { posts, hasMore };
            },
            serializeQueryArgs: ({ endpointName }) => endpointName,
            merge: (currentCache, newItems, { arg }) => {
                if (arg.page === 1) {
                    currentCache.posts = newItems.posts;
                } else {
                    const existingIds = new Set(currentCache.posts.map(p => p.id));
                    const uniqueNewItems = newItems.posts.filter(p => !existingIds.has(p.id));
                    currentCache.posts.push(...uniqueNewItems);
                }
                currentCache.hasMore = newItems.hasMore;
            },
            forceRefetch({ currentArg, previousArg }) {
                return currentArg?.page !== previousArg?.page;
            },
            providesTags: ['Post'],
            async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
                const { initializeSocket } = await import('../../../utils/socket');
                const socket = initializeSocket();
                try {
                    await cacheDataLoaded;
                    const listener = (newPostRaw: any) => {
                        updateCachedData((draft) => {
                            if (draft.posts.find((p) => p.id === newPostRaw.ID)) return;
                            
                            const newPost: Post = {
                                id: newPostRaw.ID,
                                author: {
                                    id: newPostRaw.User?.ID || newPostRaw.UserID,
                                    name: newPostRaw.User?.FullName || 'Unknown',
                                    username: newPostRaw.User?.UserName || 'unknown',
                                    avatarUrl: newPostRaw.User?.ProfilePictureUrl || `https://ui-avatars.com/api/?name=${newPostRaw.User?.FullName || 'User'}&background=random`,
                                },
                                content: newPostRaw.Content || '',
                                timestamp: new Date(newPostRaw.CreatedAt).toLocaleString(),
                                likes: newPostRaw.Likes?.length || 0,
                                comments: newPostRaw.Comments?.length || 0,
                                isLikedByMe: false,
                                likedBy: newPostRaw.Likes?.map((l: any) => l.UserID) || [],
                                type: newPostRaw.Type,
                                mediaUrl: newPostRaw.MediaURL,
                                media: newPostRaw.Media?.map((m: any) => ({ mediaType: m.MediaType, mediaUrl: m.MediaURL, mimeType: m.MimeType, fileSize: m.FileSize, blobName: m.BlobName, fileName: m.FileName })) || [],
                            };
                            draft.posts.unshift(newPost);
                        });
                    };
                    socket.on('newPostInFeed', listener);
                } catch {}
                
                await cacheEntryRemoved;
            }
        }),
        getAllExplorePosts: builder.query<PaginatedPosts, { page: number; limit: number }>({
            query: ({ page, limit }) => ({ url: `posts?page=${page}&limit=${limit}` }),
            transformResponse: (response: any) => {
                const rawPosts = response?.data?.posts || [];
                const hasMore = response?.data?.pagination?.hasNextPage || false;
                const posts = rawPosts.map((p: any) => ({
                    id: p.ID,
                    author: {
                        id: p.User?.ID || p.UserID,
                        name: p.User?.FullName || 'Unknown',
                        username: p.User?.UserName || 'unknown',
                        avatarUrl: p.User?.ProfilePictureUrl || `https://ui-avatars.com/api/?name=${p.User?.FullName || 'User'}&background=random`
                    },
                    content: p.Content || '',
                    timestamp: new Date(p.CreatedAt).toLocaleString(),
                    likes: p.Likes?.length || 0,
                    comments: p.Comments?.length || 0,
                    isLikedByMe: false,
                    likedBy: p.Likes?.map((l: any) => l.UserID) || [],
                    type: p.Type,
                    mediaUrl: p.MediaURL,
                    media: p.Media?.map((m: any) => ({ mediaType: m.MediaType, mediaUrl: m.MediaURL, mimeType: m.MimeType, fileSize: m.FileSize, blobName: m.BlobName, fileName: m.FileName })) || [],
                }));
                return { posts, hasMore };
            },
            serializeQueryArgs: ({ endpointName }) => endpointName,
            merge: (currentCache, newItems, { arg }) => {
                if (arg.page === 1) {
                    currentCache.posts = newItems.posts;
                } else {
                    const existingIds = new Set(currentCache.posts.map(p => p.id));
                    const uniqueNewItems = newItems.posts.filter(p => !existingIds.has(p.id));
                    currentCache.posts.push(...uniqueNewItems);
                }
                currentCache.hasMore = newItems.hasMore;
            },
            forceRefetch({ currentArg, previousArg }) {
                return currentArg?.page !== previousArg?.page;
            },
            providesTags: ['Post'],
        }),
        getTrendingPosts: builder.query<PaginatedPosts, { page: number; limit: number }>({
            query: ({ page, limit }) => ({ url: `posts/trending?page=${page}&limit=${limit}` }),
            transformResponse: (response: any) => {
                const rawPosts = response?.data?.posts || [];
                const hasMore = response?.data?.pagination?.hasNextPage || false;
                const posts = rawPosts.map((p: any) => ({
                    id: p.ID,
                    author: {
                        id: p.User?.ID || p.UserID,
                        name: p.User?.FullName || 'Unknown',
                        username: p.User?.UserName || 'unknown',
                        avatarUrl: p.User?.ProfilePictureUrl || `https://ui-avatars.com/api/?name=${p.User?.FullName || 'User'}&background=random`
                    },
                    content: p.Content || '',
                    timestamp: new Date(p.CreatedAt).toLocaleString(),
                    likes: p.Likes?.length || 0,
                    comments: p.Comments?.length || 0,
                    isLikedByMe: false,
                    likedBy: p.Likes?.map((l: any) => l.UserID) || [],
                    type: p.Type,
                    mediaUrl: p.MediaURL,
                    media: p.Media?.map((m: any) => ({ mediaType: m.MediaType, mediaUrl: m.MediaURL, mimeType: m.MimeType, fileSize: m.FileSize, blobName: m.BlobName, fileName: m.FileName })) || [],
                }));
                return { posts, hasMore };
            },
            serializeQueryArgs: ({ endpointName }) => endpointName,
            merge: (currentCache, newItems, { arg }) => {
                if (arg.page === 1) {
                    currentCache.posts = newItems.posts;
                } else {
                    const existingIds = new Set(currentCache.posts.map(p => p.id));
                    const uniqueNewItems = newItems.posts.filter(p => !existingIds.has(p.id));
                    currentCache.posts.push(...uniqueNewItems);
                }
                currentCache.hasMore = newItems.hasMore;
            },
            forceRefetch({ currentArg, previousArg }) {
                return currentArg?.page !== previousArg?.page;
            },
            providesTags: ['Post'],
        }),
        getTrendingHashtags: builder.query<{hashtag: string, category: string, postCount: number}[], void>({
            query: () => ({ url: 'posts/hashtags/trending' }),
            transformResponse: (response: any) => response?.data || [],
        }),
        getPostsByUserId: builder.query<PaginatedPosts, { userId: string; page: number; limit: number }>({
            query: ({ userId, page, limit }) => ({ url: `posts/user/${userId}?page=${page}&limit=${limit}` }),
            transformResponse: (response: any) => {
                const rawPosts = response?.data?.posts || [];
                const hasMore = response?.data?.pagination?.hasNextPage || false;
                const posts = rawPosts.map((p: any) => ({
                    id: p.ID,
                    author: {
                        id: p.User?.ID || p.UserID,
                        name: p.User?.FullName || 'Unknown',
                        username: p.User?.UserName || 'unknown',
                        avatarUrl: p.User?.ProfilePictureUrl || `https://ui-avatars.com/api/?name=${p.User?.FullName || 'User'}&background=random`
                    },
                    content: p.Content || '',
                    timestamp: new Date(p.CreatedAt).toLocaleString(),
                    likes: p.Likes?.length || 0,
                    comments: p.Comments?.length || 0,
                    isLikedByMe: false,
                    likedBy: p.Likes?.map((l: any) => l.UserID) || [],
                    type: p.Type,
                    mediaUrl: p.MediaURL,
                    media: p.Media?.map((m: any) => ({ mediaType: m.MediaType, mediaUrl: m.MediaURL, mimeType: m.MimeType, fileSize: m.FileSize, blobName: m.BlobName, fileName: m.FileName })) || [],
                }));
                return { posts, hasMore };
            },
            serializeQueryArgs: ({ endpointName, queryArgs }) => `${endpointName}-${queryArgs.userId}`,
            merge: (currentCache, newItems, { arg }) => {
                if (arg.page === 1) {
                    currentCache.posts = newItems.posts;
                } else {
                    const existingIds = new Set(currentCache.posts.map(p => p.id));
                    const uniqueNewItems = newItems.posts.filter(p => !existingIds.has(p.id));
                    currentCache.posts.push(...uniqueNewItems);
                }
                currentCache.hasMore = newItems.hasMore;
            },
            forceRefetch({ currentArg, previousArg }) {
                return currentArg?.page !== previousArg?.page || currentArg?.userId !== previousArg?.userId;
            },
            providesTags: ['Post'],
        }),
        getLikedPostsByUserId: builder.query<PaginatedPosts, { userId: string; page: number; limit: number }>({
            query: ({ userId, page, limit }) => ({ url: `posts/liked/user/${userId}?page=${page}&limit=${limit}` }),
            transformResponse: (response: any) => {
                const rawPosts = response?.data?.posts || [];
                const hasMore = response?.data?.pagination?.hasNextPage || false;
                const posts = rawPosts.map((p: any) => ({
                    id: p.ID,
                    author: {
                        id: p.User?.ID || p.UserID,
                        name: p.User?.FullName || 'Unknown',
                        username: p.User?.UserName || 'unknown',
                        avatarUrl: p.User?.ProfilePictureUrl || `https://ui-avatars.com/api/?name=${p.User?.FullName || 'User'}&background=random`
                    },
                    content: p.Content || '',
                    timestamp: new Date(p.CreatedAt).toLocaleString(),
                    likes: p.Likes?.length || 0,
                    comments: p.Comments?.length || 0,
                    isLikedByMe: true,
                    likedBy: p.Likes?.map((l: any) => l.UserID) || [],
                    type: p.Type,
                    mediaUrl: p.MediaURL,
                    media: p.Media?.map((m: any) => ({ mediaType: m.MediaType, mediaUrl: m.MediaURL, mimeType: m.MimeType, fileSize: m.FileSize, blobName: m.BlobName, fileName: m.FileName })) || [],
                }));
                return { posts, hasMore };
            },
            serializeQueryArgs: ({ endpointName, queryArgs }) => `${endpointName}-${queryArgs.userId}`,
            merge: (currentCache, newItems, { arg }) => {
                if (arg.page === 1) {
                    currentCache.posts = newItems.posts;
                } else {
                    const existingIds = new Set(currentCache.posts.map(p => p.id));
                    const uniqueNewItems = newItems.posts.filter(p => !existingIds.has(p.id));
                    currentCache.posts.push(...uniqueNewItems);
                }
                currentCache.hasMore = newItems.hasMore;
            },
            forceRefetch({ currentArg, previousArg }) {
                return currentArg?.page !== previousArg?.page || currentArg?.userId !== previousArg?.userId;
            },
            providesTags: ['Post'],
        }),
        getPostById: builder.query<Post, string>({
            query: (id) => ({ url: `posts/${id}` }),
            transformResponse: (response: any) => {
                const p = response?.data?.post || response?.data || response;
                return {
                    id: p.ID,
                    author: {
                        id: p.User?.ID || p.UserID,
                        name: p.User?.FullName || 'Unknown',
                        username: p.User?.UserName || 'unknown',
                        avatarUrl: p.User?.ProfilePictureUrl || `https://ui-avatars.com/api/?name=${p.User?.FullName || 'User'}&background=random`
                    },
                    content: p.Content || '',
                    timestamp: new Date(p.CreatedAt).toLocaleString(),
                    likes: p.Likes?.length || 0,
                    comments: p.Comments?.length || 0,
                    isLikedByMe: false,
                    likedBy: p.Likes?.map((l: any) => l.UserID) || [],
                    type: p.Type,
                    mediaUrl: p.MediaURL,
                    media: p.Media?.map((m: any) => ({ mediaType: m.MediaType, mediaUrl: m.MediaURL, mimeType: m.MimeType, fileSize: m.FileSize, blobName: m.BlobName, fileName: m.FileName })) || [],
                };
            },
            providesTags: (_result, _error, id) => [{ type: 'Post', id }],
        }),
        createPost: builder.mutation<Post, Partial<Post>>({
            query: (initialPost) => ({
                url: 'posts',
                method: 'POST',
                data: initialPost,
            }),
            invalidatesTags: ['Post'],
        }),
        updatePost: builder.mutation<Post, Partial<Post> & { id: string }>({
            query: ({ id, ...post }) => ({
                url: `posts/${id}`,
                method: 'PUT',
                data: post,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Post', id }],
        }),
        deletePost: builder.mutation<{ success: boolean; id: string }, string>({
            query: (id) => ({
                url: `posts/${id}`,
                method: 'DELETE',
            }),
            async onQueryStarted(id, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    postApiSlice.util.updateQueryData('getAllExplorePosts', { page: 1, limit: 100 }, (draft) => {
                        draft.posts = draft.posts.filter(p => p.id !== id);
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
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
        getCommentsByPostId: builder.query<Comment[], string>({
            query: (postId) => ({ url: `comment/${postId}` }),
            transformResponse: (response: any) => {
                const rawComments = response?.data || [];
                return rawComments.map((c: any) => ({
                    id: c.ID,
                    authorId: c.User?.ID || c.UserID,
                    authorName: c.User?.FullName || 'Unknown',
                    authorAvatar: c.User?.ProfilePictureUrl || `https://ui-avatars.com/api/?name=${c.User?.FullName || 'User'}&background=random`,
                    content: c.Content,
                    time: new Date(c.CreatedAt).toLocaleString(),
                    likes: 0,
                    isLiked: false,
                }));
            },
            providesTags: (_result, _error, id) => [{ type: 'Comment', id }],
        }),
        createPostComment: builder.mutation<Comment, { postId: string; commentText: string }>({
            query: ({ postId, commentText }) => ({
                url: `comment/${postId}`,
                method: 'POST',
                data: { commentText },
            }),
            invalidatesTags: (_result, _error, { postId }) => [{ type: 'Comment', id: postId }, 'Post'],
        }),
    }),
});

export const {
    useGetPostsQuery,
    useGetAllExplorePostsQuery,
    useGetTrendingPostsQuery,
    useGetTrendingHashtagsQuery,
    useGetPostsByUserIdQuery,
    useGetLikedPostsByUserIdQuery,
    useGetPostByIdQuery,
    useCreatePostMutation,
    useUpdatePostMutation,
    useDeletePostMutation,
    useGetUploadUrlMutation,
    useGetReadUrlQuery,
    useUploadImageToAzureMutation,
    useGetCommentsByPostIdQuery,
    useCreatePostCommentMutation,
} = postApiSlice;
