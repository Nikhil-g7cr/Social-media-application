import { useState } from 'react';
import { useGetUploadUrlMutation, useUploadImageToAzureMutation } from '../redux/features/post/postApiSlice';

export interface UploadedMedia {
    mediaUrl: string;
    blobName: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
}

export const useMediaUpload = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [getUploadUrl] = useGetUploadUrlMutation();
    const [uploadImageToAzure] = useUploadImageToAzureMutation();

    const uploadFiles = async (files: File[]): Promise<UploadedMedia[]> => {
        if (!files || files.length === 0) return [];
        
        setIsUploading(true);
        const uploadedMediaList: UploadedMedia[] = [];

        try {
            for (const file of files) {
                // 1. Validate file (10MB limit example, can be adjusted)
                if (file.size > 10 * 1024 * 1024) {
                    throw new Error(`File ${file.name} is too large. Maximum size is 10MB.`);
                }

                // 2. Request Upload URL
                const { uploadUrl, blobPath } = await getUploadUrl({
                    fileName: file.name,
                    contentType: file.type,
                }).unwrap();

                // 3. Upload to Azure
                await uploadImageToAzure({ uploadUrl, file }).unwrap();

                // 4. Store upload result
                uploadedMediaList.push({
                    mediaUrl: blobPath,
                    blobName: blobPath,
                    fileName: file.name,
                    mimeType: file.type,
                    fileSize: file.size,
                });
            }

            return uploadedMediaList;
        } catch (error: any) {
            console.error("Upload failed:", error);
            throw new Error(error?.data?.message || error?.message || "Failed to upload file");
        } finally {
            setIsUploading(false);
        }
    };

    return { uploadFiles, isUploading };
};
