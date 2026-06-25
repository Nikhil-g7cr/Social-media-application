import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { notification } from "antd";
import { Image as ImageIcon, X } from "lucide-react";
import { useSelector } from "react-redux";

import DynamicForm from "../../shared/shared-components/DynamicForm";
import { updatePostFields } from "../../components/layout/form/fields/updatePost.field";
import { updatePostSchema, type UpdatePostFormData } from "../../components/layout/form/schemas/updatePost.schema";
import { useGetPostByIdQuery, useUpdatePostMutation } from "../../redux/features/post/postApiSlice";
import { useMediaUpload } from "../../hooks/useMediaUpload";
import type { RootState } from "../../redux/store";
import MediaCarousel from "../../components/media/MediaCarousel";
import { useEditPost } from "../../components/layout/post-popup/hooks/useEditPost";

const UpdatePostPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  
  const {
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
  } = useEditPost(postId, () => {
    navigate(-1);
  });

  if (isFetchingPost) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Prevent users from editing others' posts
  if (post && post.author.id !== currentUser?.id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-6">You can only edit your own posts.</p>
        <button 
          onClick={() => navigate(-1)} 
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  const defaultValues = {
    content: post?.content || "",
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10 mt-10">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Edit Post
          </h1>
          <p className="text-gray-500 mt-2">
            Update the content and image of your post.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center mb-8">
           <div className="w-full flex flex-col items-center mb-4 justify-center gap-4">
             {(() => {
               // Combine existing and new for preview
               const combinedPreview = [
                 ...existingMedia.map(m => ({
                   mediaUrl: m.mediaUrl,
                   mediaType: m.mediaType,
                 })),
                 ...newFiles.map(f => ({
                   mediaUrl: URL.createObjectURL(f),
                   mediaType: f.type.startsWith('video/') ? 'VIDEO' : 'IMAGE',
                 }))
               ];

               return combinedPreview.length > 0 ? (
                 <div className="relative w-full rounded-xl overflow-hidden">
                   <MediaCarousel media={combinedPreview as any} preview={true} showDots={true} showArrows={true} className="h-[350px] sm:h-[400px] bg-black" />
                   <button 
                     onClick={clearAllMedia} 
                     className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg z-20"
                     type="button"
                     title="Clear All Media"
                   >
                     <X className="w-5 h-5" />
                   </button>
                 </div>
               ) : null;
             })()}
           </div>

           <button 
             onClick={() => fileInputRef.current?.click()} 
             className="w-full max-w-sm h-32 rounded-xl bg-gray-50 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:bg-gray-100 hover:border-blue-400 transition-colors group"
             type="button"
           >
             <ImageIcon className="w-10 h-10 text-gray-400 group-hover:text-blue-500 transition-colors mb-2" />
             <span className="text-sm font-medium text-gray-500 group-hover:text-blue-600">Add Media (Optional)</span>
           </button>
           <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" multiple onChange={handleImageChange} />
        </div>

        <DynamicForm
          fields={updatePostFields as any}
          defaultValues={defaultValues}
          validationSchema={updatePostSchema}
          submitButtonText={isUploading || isUpdating ? "Saving..." : "Save Changes"}
          loading={isUpdating || isUploading}
          disabled={isUpdating || isUploading}
          onSubmit={handleUpdate}
        />
      </div>
    </div>
  );
};

export default UpdatePostPage;
