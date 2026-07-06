import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { notification } from "antd";
import { Image as ImageIcon, X } from "lucide-react";
import { useSelector } from "react-redux";

import DynamicForm from "../../shared/shared-components/DynamicForm";
import { updateProfileFields } from "../../components/layout/form/fields/updateProfile.field";
import { updateProfileSchema } from "../../components/layout/form/schemas/updateProfile.schema";
import {
  useGetUserByIdQuery,
  useUpdateUserProfileMutation,
} from "../../redux/features/user/userApiSlice";
import { useMediaUpload } from "../../hooks/useMediaUpload";
import type { RootState } from "../../redux/store";
import Avatar from "../../shared/shared-components/Avatar";

interface UpdateProfileFormData {
  FullName?: string;
  UserName?: string;
  Bio?: string;
}

const UpdateProfilePage = () => {
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const { data: userProfile, isLoading: isFetchingProfile } =
    useGetUserByIdQuery(currentUser?.id as string, {
      skip: !currentUser?.id,
    });

  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateUserProfileMutation();
  const { uploadFiles } = useMediaUpload("profile");

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userProfile?.avatarUrl) {
      setImagePreview(userProfile.avatarUrl);
    }
  }, [userProfile]);

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

  const handleUpdate = async (values: UpdateProfileFormData) => {
    if (!currentUser?.id) return;

    try {
      setIsUploading(true);
      let profilePictureUrl = userProfile?.avatarUrl;

      // Only upload if a new image was selected
      if (selectedImage) {
        const uploadedFiles = await uploadFiles([selectedImage]);
        profilePictureUrl = uploadedFiles[0].mediaUrl;
      } else if (!imagePreview) {
        // If they removed the image
        profilePictureUrl = "";
      }

      const payload: any = {
        id: currentUser.id,
        name: values.FullName,
        username: values.UserName,
        avatarUrl: profilePictureUrl,
      };

      if (values.Bio && values.Bio.trim().length > 0) {
        payload.bio = values.Bio;
      }

      await updateProfile(payload).unwrap();

      notification.success({
        message: "Profile Updated",
        description: "Your profile has been successfully updated.",
        placement: "topRight",
      });

      navigate(`/profile/${currentUser.id}`);
    } catch (error: any) {
      console.error("Update Profile Error:", error);

      notification.error({
        message: "Update Failed",
        description:
          error?.data?.message ||
          error?.message ||
          "Something went wrong while updating your profile.",
        placement: "topRight",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (isFetchingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const defaultValues = {
    FullName: userProfile?.name || "",
    UserName: userProfile?.username || "",
    Bio: userProfile?.bio || "",
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10 mt-10">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Update Profile</h1>
          <p className="text-gray-500 mt-2">
            Update your personal information and profile picture.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center mb-8">
          {imagePreview ? (
            <div className="relative">
              <Avatar
                url={imagePreview}
                name={userProfile?.name}
                className="w-24 h-24 rounded-full object-cover border border-gray-200 shadow-sm"
              />
              <button
                onClick={removeImage}
                className="absolute -top-1 -right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-300 hover:bg-gray-100 hover:border-blue-400 transition-colors group"
              type="button"
            >
              <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </button>
          )}
          <p className="text-sm font-medium text-gray-600 mt-3">
            Profile Picture
          </p>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        <DynamicForm
          fields={updateProfileFields as any}
          defaultValues={defaultValues}
          validationSchema={updateProfileSchema}
          submitButtonText={
            isUploading || isUpdating ? "Saving..." : "Save Changes"
          }
          loading={isUpdating || isUploading}
          disabled={isUpdating || isUploading}
          onSubmit={handleUpdate}
        />
      </div>
    </div>
  );
};

export default UpdateProfilePage;
