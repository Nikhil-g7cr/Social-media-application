import { z } from "zod";
import {
  AUTH_FIELD_MAX_LENGTHS,
} from "../constants/authFieldLimits";
import {
  EMAIL_VALIDATION_MESSAGE,
  isValidAppEmail,
  normalizeEmail,
} from "../../../../utils/email.util";

export const loginSchema = z.object({
  email: z
    .string()
    .max(AUTH_FIELD_MAX_LENGTHS.email, "Email address is too long.")
    .transform(normalizeEmail)
    .refine(isValidAppEmail, EMAIL_VALIDATION_MESSAGE),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(AUTH_FIELD_MAX_LENGTHS.password, "Password cannot exceed 128 characters")
    .regex(/^\S*$/, "Password must not contain spaces"),
});

export type LoginFormData =
  z.infer<typeof loginSchema>;
