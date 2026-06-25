export interface UploadedMedia {
    mediaUrl: string;
    blobName?: string;
    fileName?: string;
    mimeType?: string;
    fileSize?: number;
    mediaType?: 'IMAGE' | 'VIDEO';
}

export interface MediaCarouselProps {
    media: UploadedMedia[];
    preview?: boolean;
    showDots?: boolean;
    showArrows?: boolean;
    autoPlayVideos?: boolean;
    className?: string;
}
