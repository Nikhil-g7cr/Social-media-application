import { useCallback, useMemo } from 'react';
import { useGetPostByIdQuery } from '../../../../redux/features/post/postApiSlice';
import { useGetUserByIdQuery } from '../../../../redux/features/user/userApiSlice';
import { useLikePostMutation, useUnlikePostMutation } from '../../../../redux/features/like/likeApiSlice';
import { useAppSelector } from '../../../../redux/hooks';

export const useViewPost = (postId?: string, initialPost?: any) => {
  const { data: fetchedPostData, isLoading: isQueryLoading, error } = useGetPostByIdQuery(postId || '', {
    skip: !postId,
  });

  const postData = fetchedPostData || initialPost;
  const isLoading = isQueryLoading && !postData;

  const { data: authorDetails } = useGetUserByIdQuery(postData?.author?.id || '', {
    skip: !postData?.author?.id || postData?.author?.name !== 'Unknown', 
  });

  const post = useMemo(() => {
    if (!postData) return postData;
    if (authorDetails && postData.author?.name === 'Unknown') {
      return {
        ...postData,
        author: {
          id: authorDetails.id,
          name: authorDetails.name,
          username: authorDetails.username,
          avatarUrl: authorDetails.avatarUrl,
        }
      };
    }
    return postData;
  }, [postData, authorDetails]);

  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnlikePostMutation();
  const user = useAppSelector((state) => state.auth.user);
  const onlineUserIds = useAppSelector((state) => state.onlineUsers.onlineUserIds);

  const toggleLike = useCallback(async (id: string, isLikedByMe: boolean | undefined) => {
    try {
      if (isLikedByMe) {
        await unlikePost(id).unwrap();
      } else {
        await likePost(id).unwrap();
      }
    } catch (err) {
      console.error('Failed to toggle like', err);
    }
  }, [likePost, unlikePost]);

  return { 
    post, 
    isLoading, 
    error: !postData ? error : undefined, 
    user, 
    onlineUserIds, 
    toggleLike 
  };
};
