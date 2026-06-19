import React, { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { useAppSelector } from "../../../redux/hooks";
import { useCreatePostMutation } from "../../../redux/features/post/postApiSlice";

export default function CreatePost() {
  const { user } = useAppSelector((state: any) => state.auth);
  const [createPost, { isLoading: isSubmitting }] = useCreatePostMutation();
  const [newPostContent, setNewPostContent] = useState("");

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    try {
      await createPost({ content: newPostContent, type: 'TEXT' } as any).unwrap();
      setNewPostContent("");
    } catch (error) {
      console.error("Failed to create post", error);
    }
  };

  return (
    <div className="bg-white rounded-2xl border p-5 shadow-sm">
      <div className="flex gap-4">
        <img
          src={user?.image_url || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`}
          alt=""
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

          <div className="flex justify-between items-center mt-3">
            <button
              type="button"
              className="p-2 rounded-full hover:bg-blue-50 transition"
            >
              <ImageIcon className="h-5 w-5 text-gray-500 hover:text-blue-500" />
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !newPostContent.trim()}
              className="px-6 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {isSubmitting ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
