import React, { memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MediaArrowProps {
  direction: 'left' | 'right';
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
}

const MediaArrow: React.FC<MediaArrowProps> = ({ direction, onClick, disabled }) => {
  if (disabled) return null;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      className={`absolute top-1/2 -translate-y-1/2 z-10 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors ${
        direction === 'left' ? 'left-2' : 'right-2'
      }`}
      aria-label={direction === 'left' ? 'Previous media' : 'Next media'}
    >
      {direction === 'left' ? (
        <ChevronLeft className="w-5 h-5 drop-shadow-md" />
      ) : (
        <ChevronRight className="w-5 h-5 drop-shadow-md" />
      )}
    </button>
  );
};

export default memo(MediaArrow);
