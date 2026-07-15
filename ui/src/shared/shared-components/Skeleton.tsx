import React from 'react';

// ─── Base Skeleton Block ───────────────────────────────────────────────────────

interface SkeletonProps {
  className?: string;
  rounded?: string;
}

/**
 * Base animated skeleton block.
 *
 * Use this directly for one-off skeleton shapes or compose it inside
 * the named skeletons below.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  rounded = 'rounded',
}) => (
  <div
    className={`animate-pulse bg-gray-200 ${rounded} ${className}`}
    aria-hidden="true"
  />
);

// ─── Avatar Skeleton ───────────────────────────────────────────────────────────

interface AvatarSkeletonProps {
  /** Tailwind size class, e.g. "w-10 h-10" */
  size?: string;
}

export const AvatarSkeleton: React.FC<AvatarSkeletonProps> = ({
  size = 'w-10 h-10',
}) => (
  <div
    className={`animate-pulse bg-gray-200 rounded-full flex-shrink-0 ${size}`}
    aria-hidden="true"
  />
);

// ─── Post Card Skeleton ────────────────────────────────────────────────────────

interface PostCardSkeletonProps {
  /** Number of card skeletons to render */
  count?: number;
  /** Whether to show the image block */
  showMedia?: boolean;
}

export const PostCardSkeleton: React.FC<PostCardSkeletonProps> = ({
  count = 3,
  showMedia = true,
}) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-2xl border p-5 shadow-sm space-y-4"
        aria-hidden="true"
      >
        {/* Author row */}
        <div className="flex items-center gap-3">
          <AvatarSkeleton size="w-10 h-10" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-2.5 w-24" />
          </div>
        </div>

        {/* Content lines */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-2/3" />
        </div>

        {/* Media block */}
        {showMedia && (
          <Skeleton className="h-48 w-full" rounded="rounded-xl" />
        )}

        {/* Action row */}
        <div className="flex gap-4 pt-2 border-t border-gray-100">
          <Skeleton className="h-7 w-16" rounded="rounded-full" />
          <Skeleton className="h-7 w-16" rounded="rounded-full" />
          <Skeleton className="h-7 w-16" rounded="rounded-full" />
        </div>
      </div>
    ))}
  </>
);

// ─── Post Grid Item Skeleton ───────────────────────────────────────────────────

interface PostGridItemSkeletonProps {
  /** Number of grid item skeletons to render */
  count?: number;
}

export const PostGridItemSkeleton: React.FC<PostGridItemSkeletonProps> = ({
  count = 6,
}) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="aspect-square bg-gray-200 rounded-md animate-pulse"
        aria-hidden="true"
      />
    ))}
  </>
);

// ─── User Item Skeleton (followers/following/requests list) ───────────────────

interface UserItemSkeletonProps {
  count?: number;
}

export const UserItemSkeleton: React.FC<UserItemSkeletonProps> = ({
  count = 4,
}) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-3 p-3 rounded-md"
        aria-hidden="true"
      >
        <AvatarSkeleton size="w-12 h-12" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-2.5 w-20" />
        </div>
        <Skeleton className="h-8 w-20" rounded="rounded-full" />
      </div>
    ))}
  </>
);

// ─── Notification Item Skeleton ───────────────────────────────────────────────

interface NotificationItemSkeletonProps {
  count?: number;
}

export const NotificationItemSkeleton: React.FC<
  NotificationItemSkeletonProps
> = ({ count = 5 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="flex items-start gap-4 p-4 sm:p-6"
        aria-hidden="true"
      >
        <div className="relative flex-shrink-0 mt-1">
          <AvatarSkeleton size="w-10 h-10" />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gray-300 animate-pulse border-2 border-white" />
        </div>
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-2.5 w-24" />
        </div>
      </div>
    ))}
  </>
);

// ─── Table Row Skeleton ────────────────────────────────────────────────────────

interface TableRowSkeletonProps {
  /** Number of row skeletons */
  count?: number;
  /** Number of columns */
  columns?: number;
}

export const TableRowSkeleton: React.FC<TableRowSkeletonProps> = ({
  count = 5,
  columns = 4,
}) => (
  <div className="divide-y divide-gray-100" aria-hidden="true">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4">
        {/* First column always has avatar + name */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <AvatarSkeleton size="w-10 h-10" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-2.5 w-20" />
          </div>
        </div>
        {/* Remaining columns */}
        {Array.from({ length: columns - 1 }).map((_, j) => (
          <div key={j} className="flex-1">
            <Skeleton className="h-3 w-full max-w-24" />
          </div>
        ))}
        {/* Actions column */}
        <Skeleton className="h-7 w-20" rounded="rounded-lg" />
      </div>
    ))}
  </div>
);

// ─── Profile Header Skeleton ───────────────────────────────────────────────────

export const ProfileHeaderSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-50 pb-10 pt-16" aria-hidden="true">
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mt-8">
        <div className="flex items-center gap-5">
          {/* Avatar circle */}
          <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-full bg-gray-200 animate-pulse border-4 border-white shadow-md" />
          <div className="hidden sm:block space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3.5 w-28" />
          </div>
        </div>
        <Skeleton className="h-9 w-28 mt-4 sm:mt-0" rounded="rounded-md" />
      </div>

      {/* Name for mobile */}
      <div className="mt-4 sm:hidden space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3.5 w-28" />
      </div>

      {/* Bio */}
      <div className="mt-4 max-w-2xl space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>

      {/* Stats */}
      <div className="mt-6 flex gap-8 border-y border-gray-200 py-4">
        {['Posts', 'Followers', 'Following'].map((label) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mt-6">
        <div className="flex border-b border-gray-200 gap-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-10 w-20 mb-[-1px]" />
          ))}
        </div>
        {/* Grid skeleton */}
        <div className="mt-6 grid grid-cols-3 gap-1 sm:gap-4 lg:grid-cols-4">
          <PostGridItemSkeleton count={9} />
        </div>
      </div>
    </div>
  </div>
);

// ─── Trending Hashtag Skeleton ─────────────────────────────────────────────────

export const TrendingHashtagSkeleton: React.FC = () => (
  <div className="space-y-4" aria-hidden="true">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="space-y-1.5">
        <Skeleton className="h-2.5 w-16" />
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-2.5 w-20" />
      </div>
    ))}
  </div>
);

// ─── Comment Skeleton ──────────────────────────────────────────────────────────

interface CommentSkeletonProps {
  count?: number;
}

export const CommentSkeleton: React.FC<CommentSkeletonProps> = ({
  count = 3,
}) => (
  <div className="space-y-4" aria-hidden="true">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex gap-3">
        <AvatarSkeleton size="w-8 h-8" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-10 w-3/4" rounded="rounded-2xl" />
          <Skeleton className="h-2.5 w-24" />
        </div>
      </div>
    ))}
  </div>
);

// ─── Conversation Item Skeleton (Message sidebar) ─────────────────────────────

interface ConversationItemSkeletonProps {
  count?: number;
}

export const ConversationItemSkeleton: React.FC<
  ConversationItemSkeletonProps
> = ({ count = 5 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-4 border-b border-gray-100" aria-hidden="true">
        <AvatarSkeleton size="w-12 h-12" />
        <div className="flex-1 space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-2.5 w-12" />
          </div>
          <Skeleton className="h-2.5 w-44" />
        </div>
      </div>
    ))}
  </>
);

// ─── Analytics Card Skeleton (Admin Dashboard) ────────────────────────────────

interface AnalyticsCardSkeletonProps {
  count?: number;
}

export const AnalyticsCardSkeleton: React.FC<AnalyticsCardSkeletonProps> = ({
  count = 4,
}) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4"
        aria-hidden="true"
      >
        <div className="w-12 h-12 rounded-xl bg-gray-200 animate-pulse shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-2.5 w-28" />
        </div>
      </div>
    ))}
  </>
);

// ─── Explore Grid Skeleton (Masonry) ──────────────────────────────────────────

export const ExploreGridSkeleton: React.FC = () => (
  <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4" aria-hidden="true">
    {Array.from({ length: 12 }).map((_, i) => (
      <div
        key={i}
        className={`break-inside-avoid mb-4 rounded-xl bg-gray-200 animate-pulse ${
          i % 3 === 0 ? 'h-48' : i % 3 === 1 ? 'h-64' : 'h-36'
        }`}
      />
    ))}
  </div>
);

// ─── Default export ────────────────────────────────────────────────────────────

export default Skeleton;
