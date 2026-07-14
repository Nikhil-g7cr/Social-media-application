import { z } from "zod";

export const updateProfileSchema = z.object({
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
    .min(3, "Username must be at least 3 characters.")
    .max(30, "Username cannot exceed 30 characters.")
    .regex(
      /^(?!.*[._]{2})(?![._])[a-zA-Z0-9._]+(?<![._])$/,
      "Username may contain letters, numbers, periods, and underscores.",
    ),
  Bio: z.string().trim().max(250, "Bio cannot exceed 250 characters.").optional(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
