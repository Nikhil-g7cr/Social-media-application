import { useState, useRef, useCallback } from "react";
import { useCreatePostMutation } from "../../../../redux/features/post/postApiSlice";
import { useMediaUpload } from "../../../../hooks/useMediaUpload";

export const useCreatePost = (onSuccess?: () => void) => {
  const [createPost, { isLoading: isSubmitting }] = useCreatePostMutation();
  const { uploadFiles } = useMediaUpload();
  
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imageWarning, setImageWarning] = useState("");
  const [videoWarning, setVideoWarning] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const incomingFiles = Array.from(e.target.files);
      
      setSelectedFiles((prev) => {
        const allFiles = [...prev, ...incomingFiles];
        
        const images = allFiles.filter(f => !f.type.startsWith('video/'));
        const videos = allFiles.filter(f => f.type.startsWith('video/'));
        
        let allowedImages = images;
        let allowedVideos = videos;
        
        if (images.length > 8) {
          allowedImages = images.slice(0, 8);
          setImageWarning("You can upload a maximum of 8 images. Extra images were ignored.");
        } else {
          setImageWarning("");
        }
        
        if (videos.length > 4) {
          allowedVideos = videos.slice(0, 4);
          setVideoWarning("You can upload a maximum of 4 videos. Extra videos were ignored.");
        } else {
          setVideoWarning("");
        }
        
        const allowedSet = new Set([...allowedImages, ...allowedVideos]);
        return allFiles.filter(f => allowedSet.has(f));
      });
    }
  }, []);

  const removeAllImages = useCallback(() => {
    setSelectedFiles([]);
    setImageWarning("");
    setVideoWarning("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleCreatePost = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newPostContent.trim() && selectedFiles.length === 0) return;

    try {
      setIsUploading(true);
      let mediaPayload: any[] | undefined = undefined;
      let type = 'TEXT';

      if (selectedFiles.length > 0) {
        const uploadedFiles = await uploadFiles(selectedFiles);
        mediaPayload = uploadedFiles.map(f => ({
          mediaUrl: f.mediaUrl,
          blobName: f.blobName,
          mediaType: f.mimeType.startsWith('video') ? 'VIDEO' : 'IMAGE',
          fileName: f.fileName,
          mimeType: f.mimeType,
          fileSize: f.fileSize
        }));
        type = selectedFiles.some(f => f.type.startsWith('video')) ? 'VIDEO' : 'IMAGE';
      }

      await createPost({ content: newPostContent, type, media: mediaPayload } as any).unwrap();
      
      setNewPostContent("");
      removeAllImages();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Failed to create post", error);
    } finally {
      setIsUploading(false);
    }
  }, [newPostContent, selectedFiles, uploadFiles, createPost, removeAllImages, onSuccess]);

  return {
    newPostContent,
    setNewPostContent,
    selectedFiles,
    imageWarning,
    videoWarning,
    isUploading,
    isSubmitting,
    fileInputRef,
    handleImageChange,
    removeAllImages,
    handleCreatePost
  };
};
