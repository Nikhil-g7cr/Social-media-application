import { z } from "zod";
import {
  EMAIL_VALIDATION_MESSAGE,
  isValidAppEmail,
  normalizeEmail,
} from "../../../../utils/email.util";

// 1. Wrap the schema in a function so we can pass the API checker to it
export const getSignupSchema = (
  checkUsernameAvailability: (username: string) => Promise<boolean>) =>
    z.object({
      FullName: z
        .string()
        .trim()
        .min(3, "Full name must be at least 3 characters.")
        .max(50, "Full name cannot exceed 50 characters.")
        .regex(
          /^[\p{L}]+(?:[ '-][\p{L}]+)*$/u,
          "Full name may only contain letters, spaces, apostrophes, and hyphens.",
        ),

      UserName: z
        .string()
        .trim()
        .toLowerCase()
        .min(3, "Username must be at least 3 characters.")
        .max(30, "Username cannot exceed 30 characters.")
        .regex(
          /^(?!.*[._]{2})(?![._])[a-zA-Z0-9._]+(?<![._])$/,
          "Username may contain letters, numbers, periods (.) and underscores (_). It cannot start/end with '.' or '_' or contain consecutive '.' or '_'.",
        )
        .refine(async (username) => {
          // Don't call API if it's too short (synchronous rules handle this)
          if (username.length < 3) return true;
          return await checkUsernameAvailability(username);
        }, "This username is already taken. Please choose another one."),

      EmailAddress: z
        .string()
        .max(255, "Email address is too long.")
        .transform(normalizeEmail)
        .refine(isValidAppEmail, EMAIL_VALIDATION_MESSAGE),

      Password: z
        .string()
        .min(8, "Password must be at least 8 characters.")
        .max(128, "Password cannot exceed 128 characters.")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
        .regex(/[0-9]/, "Password must contain at least one number.")
        .regex(
          /[!@#$%^&*(),.?":{}|<>]/,
          "Password must contain at least one special character.",
        )
        .regex(/^\S*$/, "Password cannot contain spaces."),

      ConfirmPassword: z.string(),

      Bio: z
        .string()
        .trim()
        .max(500, "Bio cannot exceed 500 characters.")
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

// 2. Update the type inference to infer from the function's return type
export type SignupFormData = z.infer<ReturnType<typeof getSignupSchema>>;
