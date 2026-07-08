import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { notification } from "antd";
import { Image as ImageIcon, X, Trash2 } from "lucide-react";
import { useSelector } from "react-redux";

import DynamicForm from "../../shared/shared-components/DynamicForm";
import { updatePostFields } from "../../components/layout/form/fields/updatePost.field";
import { updatePostSchema, type UpdatePostFormData } from "../../components/layout/form/schemas/updatePost.schema";
import { useGetPostByIdQuery, useUpdatePostMutation, useDeletePostMutation } from "../../redux/features/post/postApiSlice";
import { useMediaUpload } from "../../hooks/useMediaUpload";
import type { RootState } from "../../redux/store";
import MediaCarousel from "../../components/media/MediaCarousel";
import { useEditPost } from "../../components/layout/post-popup/hooks/useEditPost";
import ConfirmationModal from "../../components/shared/ConfirmationModal";

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
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleConfirmDeletePost = async () => {
    if (!postId) return;
    try {
      await deletePost(postId).unwrap();
      notification.success({ message: "Post deleted successfully" });
      setIsDeleteModalOpen(false);
      navigate(-1);
    } catch (err) {
      notification.error({ message: "Failed to delete post" });
    }
  };

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
                   <MediaCarousel media={combinedPreview as any} preview={true} showDots={true} showArrows={true} className="h-87.5 sm:h-100 bg-black" />
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
          disabled={isUpdating || isUploading || isDeleting}
          onSubmit={handleUpdate}
        />

        <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h4 className="text-sm font-semibold text-red-600">Danger Zone</h4>
            <p className="text-xs text-gray-500">Once deleted, this post and its media cannot be recovered.</p>
          </div>
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={isDeleting}
            className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-lg font-medium transition"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? "Deleting..." : "Delete Post"}
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDeletePost}
        title="Delete Post"
        description={
          <div className="space-y-2">
            <p>Are you sure you want to delete this post?</p>
            <ul className="text-xs text-gray-500 space-y-1 mt-2 list-disc list-inside">
              <li>The post and all its media will be permanently removed.</li>
              <li>All associated comments and likes will be deleted.</li>
              <li className="text-rose-500 font-medium">This cannot be undone.</li>
            </ul>
          </div>
        }
        confirmText="Delete Post"
        cancelText="Cancel"
        icon="warning"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default UpdatePostPage;
