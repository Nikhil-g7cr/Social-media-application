import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../config/axiosConfig";
import { notification } from "antd";
import DynamicForm from "../../../shared/shared-components/DynamicForm";
import { loginFields } from "../../layout/form/fields/login.fields";
import { loginSchema } from "../../layout/form/schemas/login.schema";

interface LoginFormValues {
  email: string;
  password: string;
}

export const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (values: LoginFormValues) => {
    try {
      setIsLoading(true);

      const response = await API.post("/auth/login", {
        EmailAddress: values.email,
        Password: values.password,
      });

      const token = response.data?.accessToken;

      //   const response = await API.post('/auth/login', values);

      // Axios 'data' -> Your Backend's 'data' -> accessToken
      const accessToken = response.data.data.accessToken;
      const refreshToken = response.data.data.refreshToken;

      console.log("Access Token:", accessToken);
      console.log("Refresh Token:", refreshToken);

      // Store them
      sessionStorage.setItem("accessToken", accessToken);
      // You might want to store the refresh token in localStorage or sessionStorage too
      sessionStorage.setItem("refreshToken", refreshToken);

      if (token) {
        sessionStorage.setItem("accessToken", token);
      }

      notification.success({
        message: "Login Successful",
        description: "Welcome back!",
        placement: "topRight",
      });

      navigate("/");
    } catch (error: any) {
      console.error("Login Error:", error);

      notification.error({
        message: "Login Failed",
        description:
          error?.response?.data?.message ||
          "Invalid credentials. Please try again.",
        placement: "topRight",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>

          <p className="text-gray-500 mt-2">
            Please enter your details to sign in.
          </p>
        </div>

        <DynamicForm
          fields={loginFields}
          validationSchema={loginSchema}
          submitButtonText="Login"
          loading={isLoading}
          disabled={isLoading}
          onSubmit={handleLogin}
        />

        <p className="text-center mt-6 text-sm text-gray-600">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-blue-600 font-semibold cursor-pointer hover:underline"
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
};
