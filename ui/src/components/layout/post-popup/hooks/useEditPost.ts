import { useState, useRef, useEffect, useCallback } from "react";
import { notification } from "antd";
import { useGetPostByIdQuery, useUpdatePostMutation } from "../../../../redux/features/post/postApiSlice";
import { useMediaUpload } from "../../../../hooks/useMediaUpload";
import type { UpdatePostFormData } from "../../../layout/form/schemas/updatePost.schema";

export const useEditPost = (postId?: string, onSuccess?: () => void) => {
  const { data: post, isLoading: isFetchingPost } = useGetPostByIdQuery(postId as string, {
    skip: !postId,
  });

  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();
  const { uploadFiles } = useMediaUpload("posts");

  const [existingMedia, setExistingMedia] = useState<any[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newFilePreviews, setNewFilePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (post?.media && post.media.length > 0) {
      setExistingMedia(post.media);
    } else if (post?.mediaUrl) {
      setExistingMedia([{
        mediaType: post.type === 'VIDEO' ? 'VIDEO' : 'IMAGE',
        mediaUrl: post.mediaUrl,
      }]);
    }
  }, [post]);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setNewFiles((prev) => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setNewFilePreviews((prev) => [...prev, ...newPreviews]);
    }
  }, []);

  const clearAllMedia = useCallback(() => {
    setExistingMedia([]);
    setNewFiles([]);
    setNewFilePreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleUpdate = useCallback(async (values: UpdatePostFormData) => {
    if (!postId) return;
    
    try {
      setIsUploading(true);
      let mediaPayload: any[] = [...existingMedia];
      let type: 'TEXT' | 'IMAGE' | 'VIDEO' = existingMedia.some(m => m.mediaType === 'VIDEO') ? 'VIDEO' : 'IMAGE';

      if (newFiles.length > 0) {
        const uploadedFiles = await uploadFiles(newFiles);
        const mappedUploaded = uploadedFiles.map(f => ({
          mediaUrl: f.mediaUrl,
          blobName: f.blobName,
          mediaType: f.mimeType.startsWith('video') ? 'VIDEO' : 'IMAGE',
          fileName: f.fileName,
          mimeType: f.mimeType,
          fileSize: f.fileSize
        }));
        mediaPayload = [...mediaPayload, ...mappedUploaded];
      }

      if (mediaPayload.length === 0) {
        type = 'TEXT';
      } else if (mediaPayload.some(m => m.mediaType === 'VIDEO')) {
        type = 'VIDEO';
      } else {
        type = 'IMAGE';
      }

      const payload: any = {
        id: postId,
        type,
        media: mediaPayload,
      };

      if (values.content && values.content.trim().length > 0) {
        payload.content = values.content;
      } else {
        payload.content = "";
      }

      await updatePost(payload).unwrap();

      notification.success({
        message: "Post Updated",
        description: "Your post has been successfully updated.",
        placement: "topRight",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Update Post Error:", error);
      notification.error({
        message: "Update Failed",
        description:
          error?.data?.message ||
          error?.message ||
          "Something went wrong while updating your post.",
        placement: "topRight",
      });
    } finally {
      setIsUploading(false);
    }
  }, [postId, existingMedia, newFiles, uploadFiles, updatePost, onSuccess]);

  return {
    post,
    isFetchingPost,
    isUpdating,
    isUploading,
    existingMedia,
    newFiles,
    newFilePreviews,
    fileInputRef,
    handleImageChange,
    clearAllMedia,
    handleUpdate
  };
};
