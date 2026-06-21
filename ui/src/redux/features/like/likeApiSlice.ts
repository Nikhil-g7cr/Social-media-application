import { apiSlice } from '../../apiSlice';
import { postApiSlice } from '../post/postApiSlice';

export const likeApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUserLikes: builder.query<any, void>({
            query: () => ({ url: 'like/user' }),
            providesTags: ['Post'],
        }),
        likePost: builder.mutation<{ success: boolean }, string>({
            query: (postId) => ({
                url: `like/${postId}`,
                method: 'POST',
            }),
            async onQueryStarted(postId, { dispatch, queryFulfilled, getState }) {
                const state = getState() as any;
                const userId = state.auth?.user?.id;
                
                // Optimistic update for feed
                const patchResult = dispatch(
                    postApiSlice.util.updateQueryData('getPosts', { page: 1, limit: 10 }, (draft) => {
                        const post = draft.posts.find((p: any) => p.id === postId);
                        if (post) {
                            post.likes += 1;
                            post.isLikedByMe = true;
                            if (userId && post.likedBy) post.likedBy.push(userId);
                        }
                    })
                );
                
                // Optimistic update for user posts
                const patchUserResult = dispatch(
                    postApiSlice.util.updateQueryData('getPostsByUserId', { userId, page: 1, limit: 10 }, (draft) => {
                        const post = draft.posts.find((p: any) => p.id === postId);
                        if (post) {
                            post.likes += 1;
                            post.isLikedByMe = true;
                            if (userId && post.likedBy) post.likedBy.push(userId);
                        }
                    })
                );

                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                    patchUserResult.undo();
                }
            },
            invalidatesTags: ['Post'],
        }),
        unlikePost: builder.mutation<{ success: boolean }, string>({
            query: (postId) => ({
                url: `like/${postId}`,
                method: 'POST', // The backend uses toggleLike under POST /like/:postId
            }),
            async onQueryStarted(postId, { dispatch, queryFulfilled, getState }) {
                const state = getState() as any;
                const userId = state.auth?.user?.id;

                const patchResult = dispatch(
                    postApiSlice.util.updateQueryData('getPosts', { page: 1, limit: 10 }, (draft) => {
                        const post = draft.posts.find((p: any) => p.id === postId);
                        if (post) {
                            post.likes -= 1;
                            post.isLikedByMe = false;
                            if (userId && post.likedBy) post.likedBy = post.likedBy.filter(id => id !== userId);
                        }
                    })
                );
                
                const patchUserResult = dispatch(
                    postApiSlice.util.updateQueryData('getPostsByUserId', { userId, page: 1, limit: 10 }, (draft) => {
                        const post = draft.posts.find((p: any) => p.id === postId);
                        if (post) {
                            post.likes -= 1;
                            post.isLikedByMe = false;
                            if (userId && post.likedBy) post.likedBy = post.likedBy.filter(id => id !== userId);
                        }
                    })
                );

                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                    patchUserResult.undo();
                }
            },
            invalidatesTags: ['Post'],
        }),
    }),
});

export const {
    useGetUserLikesQuery,
    useLikePostMutation,
    useUnlikePostMutation,
} = likeApiSlice;
