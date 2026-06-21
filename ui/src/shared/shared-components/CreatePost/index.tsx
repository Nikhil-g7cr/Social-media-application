import React, { useState, useRef, useCallback } from "react";
import { Image as ImageIcon, X } from "lucide-react";
import { useAppSelector } from "../../../redux/hooks";
import { useCreatePostMutation, useGetUploadUrlMutation, useUploadImageToAzureMutation } from "../../../redux/features/post/postApiSlice";
import PostImage from "../PostImage";

export default function CreatePost() {
  const { user } = useAppSelector((state: any) => state.auth);
  const [createPost, { isLoading: isSubmitting }] = useCreatePostMutation();
  const [getUploadUrl] = useGetUploadUrlMutation();
  const [uploadImageToAzure] = useUploadImageToAzureMutation();
  const [newPostContent, setNewPostContent] = useState("");
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }, []);

  const removeImage = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleCreatePost = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() && !selectedImage) return;

    try {
      setIsUploading(true);
      let mediaURL = undefined;
      let type = 'TEXT';

      if (selectedImage) {
        const { uploadUrl, blobPath } = await getUploadUrl({
          fileName: selectedImage.name,
          contentType: selectedImage.type,
        }).unwrap();

        await uploadImageToAzure({ uploadUrl, file: selectedImage }).unwrap();

        mediaURL = blobPath;
        type = 'IMAGE';
      }

      await createPost({ content: newPostContent, type, mediaURL } as any).unwrap();
      
      setNewPostContent("");
      removeImage();
    } catch (error) {
      console.error("Failed to create post", error);
    } finally {
      setIsUploading(false);
    }
  }, [newPostContent, selectedImage, getUploadUrl, uploadImageToAzure, createPost, removeImage]);

  return (
    <div className="bg-white rounded-2xl border p-5 shadow-sm">
      <div className="flex gap-4">
        <PostImage
          mediaUrl={user?.image_url || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`}
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

          {imagePreview && (
            <div className="relative mt-3 inline-block">
              <img src={imagePreview} alt="Preview" className="max-h-64 rounded-xl object-contain border" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full transition"
              >
                <X className="h-4 w-4" />
              </button>
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
              accept="image/*"
              className="hidden"
            />

            <button
              type="submit"
              disabled={isSubmitting || isUploading || (!newPostContent.trim() && !selectedImage)}
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
