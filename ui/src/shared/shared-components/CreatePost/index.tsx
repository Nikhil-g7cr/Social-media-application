import React, { useState, useRef, useCallback } from "react";
import { Image as ImageIcon } from "lucide-react";
import { useAppSelector } from "../../../redux/hooks";
import { useGetUserByIdQuery } from "../../../redux/features/user/userApiSlice";
import { useCreatePostMutation } from "../../../redux/features/post/postApiSlice";
import { useMediaUpload } from "../../../hooks/useMediaUpload";
import Avatar from "../Avatar";
import CreatePostPreview from "../../../components/post/CreatePostPreview";

export default function CreatePost() {
  const { user } = useAppSelector((state: any) => state.auth);
  const { data: userProfile } = useGetUserByIdQuery(user?.id as string, { skip: !user?.id });
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

  const handleCreatePost = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
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
    } catch (error) {
      console.error("Failed to create post", error);
    } finally {
      setIsUploading(false);
    }
  }, [newPostContent, selectedFiles, uploadFiles, createPost, removeAllImages]);

  return (
    <div className="bg-white rounded-2xl border p-5 shadow-sm">
      <div className="flex gap-4">
        <Avatar
          url={userProfile?.avatarUrl}
          name={userProfile?.name}
          className="h-10 w-10 rounded-full object-cover"
        />

        <form onSubmit={handleCreatePost} className="flex-1">
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            rows={3}
            placeholder="What's on your mind?"
            className="w-full bg-gray-50 rounded-xl p-3 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />

          <CreatePostPreview files={selectedFiles} onRemove={removeAllImages} />
          
          {(imageWarning || videoWarning) && (
            <div className="mt-2 text-sm text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100">
              {imageWarning && <p>{imageWarning}</p>}
              {videoWarning && <p>{videoWarning}</p>}
            </div>
          )}

          <div className="flex justify-between items-center mt-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-full hover:bg-blue-50 transition"
            >
              <ImageIcon className="h-5 w-5 text-gray-500 hover:text-blue-500" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*,video/*"
              multiple
              className="hidden"
            />

            <button
              type="submit"
              disabled={isSubmitting || isUploading || (!newPostContent.trim() && selectedFiles.length === 0)}
              className="px-6 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition flex items-center"
            >
              {isSubmitting || isUploading ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
