import { z } from "zod";

export const updateProfileSchema = z.object({
  FullName: z.string().min(3, "Full name must be at least 3 characters").optional(),
  UserName: z.string().min(3, "Username must be at least 3 characters").optional(),
  Bio: z.string().optional(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
