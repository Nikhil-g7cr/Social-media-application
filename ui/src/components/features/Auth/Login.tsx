import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { notification } from "antd";
import DynamicForm from "../../../shared/shared-components/DynamicForm";
import { loginFields } from "../../layout/form/fields/login.fields";
import { loginSchema } from "../../layout/form/schemas/login.schema";
import { useLoginMutation } from "../../../redux/features/auth/authApiSlice";
import { useAppDispatch } from "../../../redux/hooks";
import { login } from "../../../redux/features/auth/AuthSlice";
import ErrorDisplay from "../../errors/ErrorDisplay";
import { getErrorMessage } from "../../../utils/error.util";

interface LoginFormValues {
  email: string;
  password: string;
}

export const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loginApi, { isLoading }] = useLoginMutation();
  const [submitError, setSubmitError] = useState<any>(null);

  const handleLogin = async (values: LoginFormValues) => {
    try {
      setSubmitError(null);
      const response = await loginApi({
        EmailAddress: values.email,
        Password: values.password,
      }).unwrap();

      // Depending on backend structure, data could be nested
      const data = response?.data || response;
      const accessToken = data?.accessToken;
      const refreshToken = data?.refreshToken;

      // Dispatch to Redux store (this also sets sessionStorage internally in AuthSlice)
      dispatch(
        login({
          accessToken,
          refreshToken,
        })
      );

      notification.success({
        message: "Login Successful",
        description: "Welcome back!",
        placement: "topRight",
      });

      navigate("/");
    } catch (error: any) {
      console.error("Login Error:", error);
      setSubmitError(error);

      const errorMsg = getErrorMessage(error, "Invalid credentials. Please try again.");

      notification.error({
        message: "Login Failed",
        description: errorMsg,
        placement: "topRight",
      });
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

        {submitError && (
          <ErrorDisplay
            title="Login failed"
            error={submitError}
            compact
            className="mt-4"
          />
        )}

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
