import { z } from "zod";

export const updatePostSchema = z.object({
  content: z.string().max(3000, "Content cannot exceed 3000 characters").optional(),
});

export type UpdatePostFormData = z.infer<typeof updatePostSchema>;
