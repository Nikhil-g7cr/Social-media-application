import React, { useState, useRef, useCallback, memo } from 'react';
import type { MediaCarouselProps } from './types';
import MediaSlide from './MediaSlide';
import MediaArrow from './MediaArrow';
import MediaDots from './MediaDots';

const MediaCarousel: React.FC<MediaCarouselProps> = ({
  media,
  preview = false,
  showDots = true,
  showArrows = true,
  autoPlayVideos = false,
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const isMulti = media && media.length > 1;

  const goToNext = useCallback(() => {
    if (currentIndex < media.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, media.length]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isMulti) return;
      if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      }
    },
    [isMulti, goToNext, goToPrev]
  );

  // Swipe Handlers
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    touchEndX.current = null;
    if ('touches' in e) {
      touchStartX.current = e.touches[0].clientX;
    } else {
      touchStartX.current = e.clientX;
    }
  };

  const onTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if ('touches' in e) {
      touchEndX.current = e.touches[0].clientX;
    } else {
      // mouse drag
      if (touchStartX.current !== null) {
        touchEndX.current = e.clientX;
      }
    }
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < media.length - 1) {
      goToNext();
    }
    if (isRightSwipe && currentIndex > 0) {
      goToPrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!media || media.length === 0) return null;

  return (
    <div
      className={`relative overflow-hidden w-full rounded-xl border border-gray-100 bg-gray-50 focus:outline-none ${className}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onTouchStart}
      onMouseMove={onTouchMove}
      onMouseUp={onTouchEnd}
      onMouseLeave={onTouchEnd}
    >
      <div
        className="flex transition-transform duration-300 ease-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {media.map((item, idx) => (
          <MediaSlide
            key={`${item.blobName || item.mediaUrl}-${idx}`}
            media={item}
            isActive={idx === currentIndex}
            autoPlayVideos={autoPlayVideos}
          />
        ))}
      </div>

      {isMulti && showArrows && (
        <>
          <MediaArrow direction="left" onClick={goToPrev} disabled={currentIndex === 0} />
          <MediaArrow direction="right" onClick={goToNext} disabled={currentIndex === media.length - 1} />
        </>
      )}

      {isMulti && showDots && <MediaDots total={media.length} current={currentIndex} />}
    </div>
  );
};

export default memo(MediaCarousel);
