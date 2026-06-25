import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import type { PopupPayload } from '../types';
import { useCreatePost } from '../hooks/useCreatePost';
import { useAppSelector } from '../../../../redux/hooks';
import { useGetUserByIdQuery } from '../../../../redux/features/user/userApiSlice';
import Avatar from '../../../../shared/shared-components/Avatar';
import CreatePostPreview from '../../../post/CreatePostPreview';

interface CreatePostScreenProps {
  payload?: PopupPayload;
  onClose: () => void;
}

const CreatePostScreen: React.FC<CreatePostScreenProps> = ({ onClose }) => {
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
    fileInputRef,
    handleImageChange,
    removeAllImages,
    handleCreatePost
  } = useCreatePost(() => {
    onClose();
  });

  return (
    <div className="bg-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Create Post</h2>
      </div>

      <div className="flex gap-4">
        <Avatar
          url={userProfile?.avatarUrl}
          name={userProfile?.name}
          className="h-10 w-10 rounded-full object-cover shrink-0"
        />

        <form onSubmit={handleCreatePost} className="flex-1 min-w-0">
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            rows={5}
            placeholder="What's on your mind?"
            className="w-full bg-gray-50 rounded-xl p-4 resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none text-lg"
          />

          <div className="mt-4">
            <CreatePostPreview files={selectedFiles} onRemove={removeAllImages} />
          </div>

          {(imageWarning || videoWarning) && (
            <div className="mt-3 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
              {imageWarning && <p>{imageWarning}</p>}
              {videoWarning && <p>{videoWarning}</p>}
            </div>
          )}

          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-full hover:bg-indigo-50 transition text-gray-500 hover:text-indigo-600"
            >
              <ImageIcon className="h-6 w-6" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*,video/*"
              multiple
              className="hidden"
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-full text-gray-600 hover:bg-gray-100 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploading || (!newPostContent.trim() && selectedFiles.length === 0)}
                className="px-8 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition font-medium flex items-center"
              >
                {isSubmitting || isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Posting...
                  </>
                ) : (
                  "Post"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostScreen;
