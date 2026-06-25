import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { notification } from "antd";
import { Image as ImageIcon, X } from "lucide-react";

import DynamicForm from "../../../shared/shared-components/DynamicForm";
import { signupFields } from "../../layout/form/fields/signup.field";
import { signupSchema } from "../../layout/form/schemas/signup.schema";
import { useSignupMutation } from "../../../redux/features/auth/authApiSlice";
import { useMediaUpload } from "../../../hooks/useMediaUpload";

interface SignupFormData {
  FullName: string;
  UserName: string;
  EmailAddress: string;
  Password: string;
  ConfirmPassword?: string;
  Bio?: string;
  Gender: "Male" | "Female" | "Other";
}

const SignupPage = () => {
  const [signup, { isLoading }] = useSignupMutation();
  const { uploadFiles } = useMediaUpload();
  const navigate = useNavigate();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSignup = async (values: SignupFormData) => {
    try {
      setIsUploading(true);
      let profilePictureUrl = "";

      if (selectedImage) {
        const uploadedFiles = await uploadFiles([selectedImage]);
        profilePictureUrl = uploadedFiles[0].mediaUrl;
      }

      const payload = {
        FullName: values.FullName,
        UserName: values.UserName,
        EmailAddress: values.EmailAddress,
        Password: values.Password,
        Bio: values.Bio ?? "",
        ProfilePictureUrl: profilePictureUrl,
        Gender: values.Gender,
      };

      const response = await signup(payload).unwrap();

      notification.success({
        message: "Account Created",
        description: "Your account has been successfully created.",
        placement: "topRight",
      });

      navigate("/login");
    } catch (error: any) {
      console.error("Signup Error:", error);

      const errorMsg = Array.isArray(error?.data?.description)
        ? error.data.description.join(', ')
        : error?.data?.message || error?.message || "Something went wrong while creating your account.";

      notification.error({
        message: "Signup Failed",
        description: errorMsg,
        placement: "topRight",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10 mt-10">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Create an Account
          </h1>

          <p className="text-gray-500 mt-2">
            Join us and start connecting with others.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center mb-8">
           {imagePreview ? (
             <div className="relative">
               <img src={imagePreview} alt="Preview" className="w-24 h-24 rounded-full object-cover border border-gray-200 shadow-sm" />
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
           <p className="text-sm font-medium text-gray-600 mt-3">Profile Picture (Optional)</p>
           <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
        </div>

        <DynamicForm
          fields={signupFields as any}
          validationSchema={signupSchema}
          submitButtonText={isUploading ? "Uploading..." : "Create Account"}
          loading={isLoading || isUploading}
          disabled={isLoading || isUploading}
          onSubmit={handleSignup}
        />

        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-600 font-semibold cursor-pointer hover:underline"
          >
            Log in
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;