import { z } from "zod";

export const signupSchema = z
  .object({
    FullName: z.string().min(3, "Full name is required"),
    UserName: z.string().min(3, "Username is required"),
    EmailAddress: z.email("Invalid email address"),
    Password: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    ConfirmPassword: z.string(),
    Bio: z.string().optional(),
    ProfilePictureUrl: z.string().url().optional().or(z.literal("")),
    Gender: z.enum(["Male", "Female", "Other"]),
  })
  .refine((data) => data.Password === data.ConfirmPassword, {
    message: "Passwords do not match",
    path: ["ConfirmPassword"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;