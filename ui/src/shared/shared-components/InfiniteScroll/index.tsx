import React, { useEffect, useRef, useCallback } from 'react';
import Spinner from '../Spinner';

interface InfiniteScrollProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  children: React.ReactNode;
  loadingIndicator?: React.ReactNode;
}

const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  onLoadMore,
  hasMore,
  isLoading,
  children,
  loadingIndicator,
}) => {
  const observerTarget = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !isLoading) {
        onLoadMore();
      }
    },
    [onLoadMore, hasMore, isLoading]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '20px',
      threshold: 1.0,
    });

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [handleObserver]);

  return (
    <>
      {children}
      <div ref={observerTarget} className="h-10 w-full" />
      {isLoading && (
        loadingIndicator || (
          <div className="flex justify-center p-4">
            <Spinner size="md" />
          </div>
        )
      )}
      {!hasMore && children && React.Children.count(children) > 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          No more posts to load
        </div>
      )}
    </>
  );
};

export default InfiniteScroll;
