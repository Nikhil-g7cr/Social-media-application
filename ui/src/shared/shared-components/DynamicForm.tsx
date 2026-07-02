import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodType } from "zod";
import { Eye, EyeOff } from "lucide-react";
import type { FieldConfig } from "../../components/layout/form/types";



interface DynamicFormProps {
  fields: FieldConfig[];
  defaultValues?: Record<string, any>;
  validationSchema?: ZodType;
  submitButtonText?: string;
  loading?: boolean;
  disabled?: boolean;
  mode?: "onChange" | "onBlur" | "onSubmit" | "onTouched" | "all";
  onSubmit: (data: any) => void | Promise<void>;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  fields,
  defaultValues = {},
  validationSchema,
  submitButtonText = "Submit",
  loading = false,
  disabled = false,
  mode = "onChange",
  onSubmit,
}) => {
  const [visiblePasswordFields, setVisiblePasswordFields] = useState<Record<string, boolean>>({});

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues,
    resolver: validationSchema ? zodResolver(validationSchema as any) : undefined,
    mode: mode,
  });

  // 1. Define the Object Map (Dictionary)
  // Each key corresponds to a field type, and returns the appropriate JSX
  const fieldRenderers: Record<string, (field: FieldConfig) => React.ReactNode> = {
    textarea: (field) => (
      <textarea
        id={field.name}
        {...register(field.name)}
        placeholder={field.placeholder}
        disabled={disabled || field.disabled}
        rows={4}
        className="w-full rounded-md border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
      />
    ),

    select: (field) => (
      <select
        id={field.name}
        {...register(field.name)}
        disabled={disabled || field.disabled}
        className="w-full rounded-md border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
      >
        <option value="">Select</option>
        {field.options?.map((option:any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ),

    radio: (field) => (
      <div className="flex gap-4" id={field.name}>
        {field.options?.map((option:any) => (
          <label key={option.value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value={option.value}
              {...register(field.name)}
              disabled={disabled || field.disabled}
              className="text-blue-600 focus:ring-blue-500"
            />
            {option.label}
          </label>
        ))}
      </div>
    ),

    checkbox: (field) => (
      <label className="flex items-center gap-2 cursor-pointer font-medium">
        <input
          type="checkbox"
          id={field.name}
          {...register(field.name)}
          disabled={disabled || field.disabled}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:bg-gray-100"
        />
        {field.label}
      </label>
    ),

    file: (field) => (
      <Controller
        name={field.name}
        control={control}
        render={({ field: controllerField }) => (
          <input
            type="file"
            id={field.name}
            onChange={(e) => controllerField.onChange(e.target.files?.[0])}
            disabled={disabled || field.disabled}
            className="w-full rounded-md border p-3 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:bg-gray-100"
          />
        )}
      />
    ),

    // A fallback for standard inputs (text, password, email, number, etc.)
    default: (field) => {
      const isPasswordField = field.type === "password";
      const isPasswordVisible = !!visiblePasswordFields[field.name];

      return (
        <div className="relative">
          <input
            type={
              isPasswordField
                ? isPasswordVisible
                  ? "text"
                  : "password"
                : field.type || "text"
            }
            id={field.name}
            placeholder={field.placeholder}
            disabled={disabled || field.disabled}
            {...register(field.name)}
            className={`w-full rounded-md border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${isPasswordField ? "pr-11" : ""}`}
          />
          {isPasswordField && (
            <button
              type="button"
              aria-label={isPasswordVisible ? "Hide password" : "Show password"}
              onClick={() =>
                setVisiblePasswordFields((current) => ({
                  ...current,
                  [field.name]: !current[field.name],
                }))
              }
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 disabled:pointer-events-none"
              disabled={disabled || field.disabled}
            >
              {isPasswordVisible ? (
                <Eye className="h-5 w-5" />
              ) : (
                <EyeOff className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      );
    },
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {fields.map((field) => {
        // 2. Fetch the corresponding render function, fallback to 'default' if it's a standard input
        const renderFn = fieldRenderers[field.type || "text"] || fieldRenderers.default;

        return (
          <div key={field.name}>
            {field.type !== "checkbox" && (
              <label htmlFor={field.name} className="mb-2 block font-medium">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}

            {/* 3. Execute the function and pass the field configuration */}
            {renderFn(field)}

            {errors[field.name] && (
              <p className="mt-1 text-sm text-red-500">
                {String(errors[field.name]?.message)}
              </p>
            )}
          </div>
        );
      })}

      <button
        type="submit"
        disabled={loading || disabled}
        className="w-full rounded-md bg-blue-600 py-3 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
      >
        {loading ? "Please wait..." : submitButtonText}
      </button>
    </form>
  );
};

export default DynamicForm;
