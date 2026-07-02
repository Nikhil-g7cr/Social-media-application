import { z } from "zod";
import {
  EMAIL_VALIDATION_MESSAGE,
  isValidAppEmail,
  normalizeEmail,
} from "../../../../utils/email.util";

export const loginSchema = z.object({
  email: z
    .string()
    .transform(normalizeEmail)
    .refine(isValidAppEmail, EMAIL_VALIDATION_MESSAGE),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^\S*$/, "Password must not contain spaces"),
});

export type LoginFormData =
  z.infer<typeof loginSchema>;
