import ImageKit from "imagekit";
import fs from "fs";
import path from "path";

// Initialize ImageKit instance if environment variables are present
const hasImageKitConfig = Boolean(
  process.env.IMAGEKIT_PUBLIC_KEY &&
  process.env.IMAGEKIT_PRIVATE_KEY &&
  process.env.IMAGEKIT_URL_ENDPOINT
);

const imagekit = hasImageKitConfig
  ? new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
    })
  : null;

/**
 * Uploads a file buffer to ImageKit CDN, or falls back to local public storage
 * if ImageKit keys are not yet configured in .env.local.
 */
export async function uploadImageToCDN(
  fileBuffer: Buffer,
  fileName: string,
  folder: string = "/real-estate"
): Promise<string> {
  // 1. If ImageKit is configured, upload directly to ImageKit CDN
  if (imagekit) {
    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: fileName,
      folder: folder,
      useUniqueFileName: true,
    });
    return response.url;
  }

  // 2. Fallback: Save to local public/uploads directory
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${fileName.replace(/\s+/g, "-")}`;
  const filePath = path.join(uploadsDir, uniqueFileName);
  fs.writeFileSync(filePath, fileBuffer);

  return `/uploads/${uniqueFileName}`;
}

export default imagekit;
