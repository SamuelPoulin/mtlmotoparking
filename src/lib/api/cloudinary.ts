import { v2 as cloudinary } from "cloudinary";

import {
  CONTRIBUTION_UPLOAD_ROOT,
  isContributionAssetPublicId,
} from "@/src/lib/validation/cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function deleteCloudinaryImages(
  publicIds: string[],
): Promise<void> {
  if (publicIds.length === 0) {
    return;
  }

  const allowedPublicIds = publicIds.filter(isContributionAssetPublicId);

  if (allowedPublicIds.length === 0) {
    return;
  }

  await Promise.all(
    allowedPublicIds.map((publicId) => cloudinary.uploader.destroy(publicId)),
  );
}

export async function verifyContributionAssetOwnership({
  publicId,
  expectedOwnerUserId,
  expectedSecureUrl,
}: {
  publicId: string;
  expectedOwnerUserId: string;
  expectedSecureUrl?: string;
}): Promise<boolean> {
  if (!isContributionAssetPublicId(publicId)) {
    return false;
  }

  try {
    const resource = await cloudinary.api.resource(publicId, {
      context: true,
    });

    const ownerUserId = resource.context?.custom?.owner_user_id;

    if (resource.resource_type !== "image") {
      return false;
    }

    if (ownerUserId !== expectedOwnerUserId) {
      return false;
    }

    if (expectedSecureUrl && resource.secure_url !== expectedSecureUrl) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function generateSignature(uploadPreset: string, userId: string) {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = `${CONTRIBUTION_UPLOAD_ROOT}/${userId}`;
  const context = `owner_user_id=${userId}`;

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      upload_preset: uploadPreset,
      folder,
      context,
    },
    process.env.CLOUDINARY_API_SECRET as string,
  );

  return {
    signature,
    timestamp,
    apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    uploadPreset,
    folder,
    context,
  };
}
