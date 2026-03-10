import { z } from "zod";

import {
  isContributionAssetPublicId,
  isValidCloudinaryUrl,
} from "@/src/lib/validation/cloudinary";

export const DESCRIPTION_MAX_LENGTH = 280;

export const createContributionSchema = z.object({
  parking_id: z.coerce.number().int().positive(),
  cloudinary_public_id: z
    .string()
    .min(1)
    .refine(isContributionAssetPublicId, "Invalid cloudinary_public_id"),
  cloudinary_url: z
    .string()
    .url()
    .refine(isValidCloudinaryUrl, "Invalid cloudinary_url"),
  fullness: z.coerce.number().int().min(0).max(100),
  description: z
    .string()
    .max(DESCRIPTION_MAX_LENGTH)
    .optional()
    .nullable(),
});

export type CreateContributionInput = z.infer<typeof createContributionSchema>;
