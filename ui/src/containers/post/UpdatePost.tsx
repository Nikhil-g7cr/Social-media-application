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

const UpdatePostPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  
  const { data: post, isLoading: isFetchingPost } = useGetPostByIdQuery(postId as string, {
    skip: !postId,
  });

  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();
  const { uploadFiles } = useMediaUpload();

  const [existingMedia, setExistingMedia] = useState<any[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newFilePreviews, setNewFilePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (post?.media && post.media.length > 0) {
      setExistingMedia(post.media);
    } else if (post?.mediaUrl) {
      // Fallback for older posts with single media
      setExistingMedia([{
        mediaType: post.type === 'VIDEO' ? 'VIDEO' : 'IMAGE',
        mediaUrl: post.mediaUrl,
      }]);
    }
  }, [post]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setNewFiles((prev) => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setNewFilePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeExistingMedia = (index: number) => {
    setExistingMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewFilePreviews((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpdate = async (values: UpdatePostFormData) => {
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

      navigate(-1); // Go back to the previous page (usually the profile)
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
                 <div className="relative w-full">
                   <MediaCarousel media={combinedPreview as any} preview={true} showDots={true} showArrows={true} />
                   <button 
                     onClick={() => {
                       setExistingMedia([]);
                       setNewFiles([]);
                       setNewFilePreviews([]);
                     }} 
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
