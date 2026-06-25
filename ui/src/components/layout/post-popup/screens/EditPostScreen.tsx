import React from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { useAppSelector } from '../../../../redux/hooks';
import type { PopupPayload } from '../types';
import { useEditPost } from '../hooks/useEditPost';
import DynamicForm from '../../../../shared/shared-components/DynamicForm';
import { updatePostFields } from '../../form/fields/updatePost.field';
import { updatePostSchema, type UpdatePostFormData } from '../../form/schemas/updatePost.schema';
import MediaCarousel from '../../../media/MediaCarousel';

interface EditPostScreenProps {
  payload?: PopupPayload;
  onClose: () => void;
}

const EditPostScreen: React.FC<EditPostScreenProps> = ({ payload, onClose }) => {
  const currentUser = useAppSelector((state) => state.auth.user);

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
  } = useEditPost(payload?.postId, () => {
    onClose();
  });

  if (isFetchingPost) {
    return (
      <div className="p-12 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Failed to load post. It may have been deleted.</p>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-100 rounded-lg text-sm">Close</button>
      </div>
    );
  }

  if (post.author.id !== currentUser?.id) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-6">You can only edit your own posts.</p>
        <button onClick={onClose} className="px-6 py-2 bg-gray-100 rounded-lg text-sm">Close</button>
      </div>
    );
  }

  const defaultValues = {
    content: post.content || "",
  };

  return (
    <div className="bg-white p-6">
      <div className="mb-6 flex justify-between items-center border-b pb-4">
        <h2 className="text-xl font-bold">Edit Post</h2>
      </div>

      <div className="flex flex-col items-center justify-center mb-6">
        <div className="w-full flex flex-col items-center mb-4 justify-center gap-4">
          {(() => {
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
                <MediaCarousel media={combinedPreview as any} preview={true} showDots={true} showArrows={true} className="h-[300px] bg-black" />
                <button 
                  onClick={clearAllMedia} 
                  className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg z-20"
                  type="button"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : null;
          })()}
        </div>

        <button 
          onClick={() => fileInputRef.current?.click()} 
          className="w-full h-24 rounded-xl bg-gray-50 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:bg-gray-100 hover:border-indigo-400 transition-colors group"
          type="button"
        >
          <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-indigo-500 transition-colors mb-2" />
          <span className="text-sm font-medium text-gray-500 group-hover:text-indigo-600">Add Media (Optional)</span>
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
  );
};

export default EditPostScreen;
