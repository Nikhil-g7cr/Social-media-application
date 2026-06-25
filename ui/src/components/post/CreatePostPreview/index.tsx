import React, { memo } from 'react';
import MediaCarousel from '../../media/MediaCarousel';
import type { UploadedMedia } from '../../media/MediaCarousel/types';

interface CreatePostPreviewProps {
  files: File[];
  onRemove?: () => void;
}

const CreatePostPreview: React.FC<CreatePostPreviewProps> = ({ files, onRemove }) => {
  if (!files || files.length === 0) return null;

  // We convert Files to UploadedMedia type for the carousel preview
  const previewMedia: UploadedMedia[] = files.map((file) => ({
    mediaUrl: URL.createObjectURL(file),
    mediaType: file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE',
    mimeType: file.type,
    fileName: file.name,
    fileSize: file.size,
  }));

  return (
    <div className="relative mt-3">
      <MediaCarousel 
        media={previewMedia} 
        preview={true}
        showDots={true}
        showArrows={true}
        className="h-[350px] sm:h-[400px] bg-black"
      />
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 z-20 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition shadow-md"
          title="Remove all media"
        >
          {/* We'll just use a simple SVG for close to avoid importing lucide if it's not passed, but we can assume lucide-react is available globally since it's used elsewhere */}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
    </div>
  );
};

export default memo(CreatePostPreview);
