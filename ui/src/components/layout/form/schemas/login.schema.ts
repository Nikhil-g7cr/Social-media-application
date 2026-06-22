import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().regex(/^[a-zA-Z0-9]/, "Email must start with a letter or number").email("Invalid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^\S*$/, "Password must not contain spaces"),
});

export type LoginFormData =
  z.infer<typeof loginSchema>;