import { z } from "zod";

export const signupSchema = z
  .object({
    FullName: z.string().min(3, "Full name is required").regex(/^[A-Za-z]+$/, "Full name must only contain alphabets and no spaces"),
    UserName: z.string().min(3, "Username is required").regex(/^[A-Za-z0-9]+$/, "Username must only contain alphanumeric characters and no spaces"),
    EmailAddress: z.string().regex(/^[a-zA-Z0-9]/, "Email must start with a letter or number").email("Invalid email address"),
    Password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/^\S*$/, "Password must not contain spaces"),
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