import React from 'react';

interface LoadingWrapperProps {
  /**
   * Whether the data is currently in its initial loading state (RTK Query `isLoading`).
   * When true, the skeleton is shown instead of children.
   */
  isLoading: boolean;

  /**
   * The skeleton element to show while loading.
   *
   * @example
   * skeleton={<PostCardSkeleton count={3} />}
   */
  skeleton: React.ReactNode;

  /**
   * The actual content to render once data is available.
   */
  children: React.ReactNode;

  /**
   * Optional error node. If provided and there's an error, this renders instead of children.
   */
  error?: React.ReactNode;

  /**
   * Whether an error state is active.
   */
  isError?: boolean;
}

/**
 * LoadingWrapper eliminates the repetitive isLoading → skeleton / content pattern.
 *
 * It handles the three common states:
 *  1. Loading  → show skeleton
 *  2. Error    → show error UI
 *  3. Success  → show children
 *
 * RTK Query background refetches (`isFetching` with existing data) are NOT
 * intercepted here — they should be handled at the call site using a
 * subtle top-bar indicator or the InfiniteScroll component's built-in spinner.
 *
 * @example
 * <LoadingWrapper
 *   isLoading={isPostsLoading}
 *   skeleton={<PostCardSkeleton count={3} />}
 *   isError={isPostsError}
 *   error={<ErrorDisplay title="Failed to load posts" error={postsError} onRetry={refetch} />}
 * >
 *   {posts.map(post => <PostCard key={post.id} post={post} />)}
 * </LoadingWrapper>
 */
const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  isLoading,
  skeleton,
  children,
  error,
  isError = false,
}) => {
  if (isLoading) {
    return <>{skeleton}</>;
  }

  if (isError && error) {
    return <>{error}</>;
  }

  return <>{children}</>;
};

export default LoadingWrapper;
