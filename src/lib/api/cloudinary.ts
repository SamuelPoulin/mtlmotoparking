import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function deleteCloudinaryImages(
  publicIds: string[],
): Promise<void> {
  if (publicIds.length === 0) return;

  await Promise.all(
    publicIds.map((publicId) => cloudinary.uploader.destroy(publicId)),
  );
}

export function generateSignature(uploadPreset: string) {
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, upload_preset: uploadPreset },
    process.env.CLOUDINARY_API_SECRET as string,
  );

  return {
    signature,
    timestamp,
    apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    uploadPreset,
  };
}