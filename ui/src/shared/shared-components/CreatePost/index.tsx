import React, { useState, useRef, useCallback } from "react";
import { Image as ImageIcon } from "lucide-react";
import { useAppSelector } from "../../../redux/hooks";
import { useGetUserByIdQuery } from "../../../redux/features/user/userApiSlice";
import { useMediaUpload } from "../../../hooks/useMediaUpload";
import { useCreatePost } from "../../../components/layout/post-popup/hooks/useCreatePost";
import Avatar from "../Avatar";
import CreatePostPreview from "../../../components/post/CreatePostPreview";
import ErrorDisplay from "../../../components/errors/ErrorDisplay";

export default function CreatePost() {
  const { user } = useAppSelector((state: any) => state.auth);
  const { data: userProfile } = useGetUserByIdQuery(user?.id as string, { skip: !user?.id });
  const {
    newPostContent,
    setNewPostContent,
    selectedFiles,
    imageWarning,
    videoWarning,
    isUploading,
    isSubmitting,
    submitError,
    maxContentLength,
    fileInputRef,
    handleImageChange,
    removeAllImages,
    handleCreatePost
  } = useCreatePost();

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

          <div className={`mt-1 text-xs text-right ${newPostContent.length > maxContentLength ? "text-red-500" : "text-gray-400"}`}>
            {newPostContent.length}/{maxContentLength}
          </div>

          <CreatePostPreview files={selectedFiles} onRemove={removeAllImages} />
          
          {(imageWarning || videoWarning) && (
            <div className="mt-2 text-sm text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100">
              {imageWarning && <p>{imageWarning}</p>}
              {videoWarning && <p>{videoWarning}</p>}
            </div>
          )}

          {submitError && (
            <ErrorDisplay
              title="Post failed"
              error={submitError}
              compact
              className="mt-2"
            />
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
              disabled={isSubmitting || isUploading || newPostContent.length > maxContentLength || (!newPostContent.trim() && selectedFiles.length === 0)}
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
