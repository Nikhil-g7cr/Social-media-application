import React, { memo } from 'react';

interface MediaDotsProps {
  total: number;
  current: number;
}

const MediaDots: React.FC<MediaDotsProps> = ({ total, current }) => {
  if (total <= 1) return null;

  // Instagram-like logic: show max 5 dots.
  // If total <= 5, simple mapping.
  // If > 5, we keep the active dot near the center of a 5-dot window.
  
  const maxVisibleDots = 5;
  const dots = [];

  for (let i = 0; i < total; i++) {
    let sizeClass = 'w-1.5 h-1.5'; // Small dot
    let opacityClass = 'opacity-40';

    if (total <= maxVisibleDots) {
      if (i === current) {
        sizeClass = 'w-2 h-2';
        opacityClass = 'opacity-100';
      }
    } else {
      // Complex sliding window logic
      let distance = Math.abs(current - i);
      
      // Calculate window bounds
      let windowStart = Math.max(0, current - 2);
      let windowEnd = Math.min(total - 1, current + 2);
      
      // Adjust window if near edges
      if (current < 2) {
        windowEnd = 4;
      } else if (current > total - 3) {
        windowStart = total - 5;
      }

      if (i >= windowStart && i <= windowEnd) {
        if (i === current) {
          sizeClass = 'w-2 h-2';
          opacityClass = 'opacity-100';
        } else if (
          (i === windowStart && windowStart > 0) || 
          (i === windowEnd && windowEnd < total - 1)
        ) {
          sizeClass = 'w-1 h-1'; // Edge dots
          opacityClass = 'opacity-40';
        } else {
          sizeClass = 'w-1.5 h-1.5';
          opacityClass = 'opacity-60';
        }
        
        // Render dot
      } else {
        continue; // Hide outside window
      }
    }

    dots.push(
      <div
        key={i}
        className={`${sizeClass} ${opacityClass} bg-white rounded-full transition-all duration-300 drop-shadow-md`}
      />
    );
  }

  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 px-2 py-1 rounded-full bg-black/10 backdrop-blur-sm">
      {dots}
    </div>
  );
};

export default memo(MediaDots);
