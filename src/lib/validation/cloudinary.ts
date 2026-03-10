export const CONTRIBUTION_UPLOAD_ROOT = "community-parking-spot-picture";

const CONTRIBUTION_PUBLIC_ID_PATTERN =
  /^community-parking-spot-picture\/[A-Za-z0-9_-]+\/[A-Za-z0-9/_-]+$/;

const CLOUDINARY_HOST = "res.cloudinary.com";

export function isContributionAssetPublicId(publicId: string): boolean {
  return CONTRIBUTION_PUBLIC_ID_PATTERN.test(publicId);
}

export function isValidCloudinaryUrl(urlValue: string): boolean {
  try {
    const parsedUrl = new URL(urlValue);
    return (
      parsedUrl.protocol === "https:" && parsedUrl.hostname === CLOUDINARY_HOST
    );
  } catch {
    return false;
  }
}
