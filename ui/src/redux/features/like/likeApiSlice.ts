import { apiSlice } from '../../apiSlice';

export const likeApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        likePost: builder.mutation<{ success: boolean }, string>({
            query: (postId) => ({
                url: `like/post/${postId}`,
                method: 'POST',
            }),
            invalidatesTags: (_result, _error, postId) => [{ type: 'Post', id: postId }],
        }),
        unlikePost: builder.mutation<{ success: boolean }, string>({
            query: (postId) => ({
                url: `like/post/${postId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, postId) => [{ type: 'Post', id: postId }],
        }),
    }),
});

export const {
    useLikePostMutation,
    useUnlikePostMutation,
} = likeApiSlice;
