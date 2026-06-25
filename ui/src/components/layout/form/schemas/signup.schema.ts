import { z } from "zod";

export const signupSchema = z
  .object({
    FullName: z
      .string()
      .trim()
      .min(3, "Full name must be at least 3 characters.")
      .max(50, "Full name cannot exceed 50 characters.")
      .regex(
        /^[\p{L}]+(?:[ '-][\p{L}]+)*$/u,
        "Full name may only contain letters, spaces, apostrophes, and hyphens."
      ),

    UserName: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, "Username must be at least 3 characters.")
      .max(30, "Username cannot exceed 30 characters.")
      .regex(
        /^(?!.*[._]{2})(?![._])[a-zA-Z0-9._]+(?<![._])$/,
        "Username may contain letters, numbers, periods (.) and underscores (_). It cannot start/end with '.' or '_' or contain consecutive '.' or '_'."
      ),

    EmailAddress: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please enter a valid email address.")
      .max(255, "Email address is too long."),

    Password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(128, "Password cannot exceed 128 characters.")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
      .regex(/[0-9]/, "Password must contain at least one number.")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character."
      )
      .regex(/^\S*$/, "Password cannot contain spaces."),

    ConfirmPassword: z.string(),

    Bio: z
      .string()
      .trim()
      .max(250, "Bio cannot exceed 250 characters.")
      .optional(),

    ProfilePictureUrl: z
      .string()
      .url("Invalid profile picture URL.")
      .optional()
      .or(z.literal("")),

    Gender: z.enum(["Male", "Female", "Other"]),
  })
  .refine((data) => data.Password === data.ConfirmPassword, {
    message: "Passwords do not match.",
    path: ["ConfirmPassword"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;