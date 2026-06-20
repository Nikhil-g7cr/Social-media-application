import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { notification } from "antd";
import { Image as ImageIcon, X } from "lucide-react";
import { useSelector } from "react-redux";

import DynamicForm from "../../shared/shared-components/DynamicForm";
import { updatePostFields } from "../../components/layout/form/fields/updatePost.field";
import { updatePostSchema, type UpdatePostFormData } from "../../components/layout/form/schemas/updatePost.schema";
import { useGetPostByIdQuery, useUpdatePostMutation, useGetUploadUrlMutation, useUploadImageToAzureMutation } from "../../redux/features/post/postApiSlice";
import type { RootState } from "../../redux/store";

const UpdatePostPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  
  const { data: post, isLoading: isFetchingPost } = useGetPostByIdQuery(postId as string, {
    skip: !postId,
  });

  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();
  const [getUploadUrl] = useGetUploadUrlMutation();
  const [uploadImageToAzure] = useUploadImageToAzureMutation();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (post?.mediaUrl) {
      setImagePreview(post.mediaUrl);
    }
  }, [post]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpdate = async (values: UpdatePostFormData) => {
    if (!postId) return;
    
    try {
      setIsUploading(true);
      let mediaURL = post?.mediaUrl;
      let type: 'TEXT' | 'IMAGE' = post?.mediaUrl ? 'IMAGE' : 'TEXT';

      // Only upload if a new image was selected
      if (selectedImage) {
        const { uploadUrl, blobPath } = await getUploadUrl({
          fileName: selectedImage.name,
          contentType: selectedImage.type,
        }).unwrap();

        await uploadImageToAzure({ uploadUrl, file: selectedImage }).unwrap();

        mediaURL = blobPath;
        type = 'IMAGE';
      } else if (!imagePreview) {
        // If they removed the image
        mediaURL = "";
        type = 'TEXT';
      }

      const payload: any = {
        id: postId,
        type,
        mediaURL,
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
           {imagePreview ? (
             <div className="relative">
               <img src={imagePreview} alt="Preview" className="max-h-64 rounded-xl object-contain border border-gray-200 shadow-sm" />
               <button 
                 onClick={removeImage} 
                 className="absolute -top-3 -right-3 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg"
                 type="button"
               >
                 <X className="w-5 h-5" />
               </button>
             </div>
           ) : (
             <button 
               onClick={() => fileInputRef.current?.click()} 
               className="w-full max-w-sm h-32 rounded-xl bg-gray-50 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:bg-gray-100 hover:border-blue-400 transition-colors group"
               type="button"
             >
               <ImageIcon className="w-10 h-10 text-gray-400 group-hover:text-blue-500 transition-colors mb-2" />
               <span className="text-sm font-medium text-gray-500 group-hover:text-blue-600">Add Image (Optional)</span>
             </button>
           )}
           <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
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
