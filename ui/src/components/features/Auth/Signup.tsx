import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { notification } from "antd";

import DynamicForm from "../../../shared/shared-components/DynamicForm";
import { signupFields } from "../../layout/form/fields/signup.field";
import { signupSchema } from "../../layout/form/schemas/signup.schema";
import API from "../../../config/axiosConfig";
import { useSignupMutation } from "../../../redux/features/auth/authApiSlice";

interface SignupFormData {
  FullName: string;
  UserName: string;
  EmailAddress: string;
  Password: string;
  ConfirmPassword?: string;
  Bio?: string;
  ProfilePictureUrl?: string;
  Gender: "Male" | "Female" | "Other";
}

const SignupPage = () => {
  const [signup, { isLoading }] = useSignupMutation();
  const navigate = useNavigate();

  const handleSignup = async (values: SignupFormData) => {
    try {
      const payload = {
        FullName: values.FullName,
        UserName: values.UserName,
        EmailAddress: values.EmailAddress,
        Password: values.Password,
        Bio: values.Bio ?? "",
        ProfilePictureUrl: values.ProfilePictureUrl ?? "",
        Gender: values.Gender,
      };

      const response = await signup(payload).unwrap();

      console.log("Signup Success:", response);

      notification.success({
        message: "Account Created",
        description:
          "Your account has been successfully created.",
        placement: "topRight",
      });

      navigate("/login");
    } catch (error: any) {
      console.error("Signup Error:", error);

      notification.error({
        message: "Signup Failed",
        description:
          error?.data?.message ||
          error?.message ||
          "Something went wrong while creating your account.",
        placement: "topRight",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Create an Account
          </h1>

          <p className="text-gray-500 mt-2">
            Join us and start connecting with others.
          </p>
        </div>

        <DynamicForm
          fields={signupFields as any}
          validationSchema={signupSchema}
          submitButtonText="Create Account"
          loading={isLoading}
          disabled={isLoading}
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