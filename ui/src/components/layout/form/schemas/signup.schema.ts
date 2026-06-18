import { z } from "zod";

export const signupSchema = z
  .object({
    userName: z
      .string()
      .min(3),

    fullName: z
      .string()
      .min(3),

    email: z.email(),

    password: z
      .string()
      .min(6),

    confirmPassword: z
      .string()
      .min(6),
  })
  .refine(
    (data) =>
      data.password ===
      data.confirmPassword,
    {
      message:
        "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

export type SignupFormData =
  z.infer<typeof signupSchema>;