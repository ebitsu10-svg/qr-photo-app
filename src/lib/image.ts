import sharp from "sharp";

const MAX_DIMENSION = 2048;
const JPEG_QUALITY = 82;
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB input limit

export type ProcessedImage = {
  buffer: Buffer;
  contentType: "image/jpeg";
  sizeBytes: number;
};

/**
 * Accepts a raw file buffer (JPEG, PNG, WebP, HEIC/HEIF) and returns a
 * normalised JPEG buffer resized to fit within MAX_DIMENSION × MAX_DIMENSION.
 */
export async function processImage(input: Buffer): Promise<ProcessedImage> {
  if (input.byteLength > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `File too large. Maximum size is ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB.`
    );
  }

  const buffer = await sharp(input)
    .rotate() // auto-rotate based on EXIF orientation
    .resize(MAX_DIMENSION, MAX_DIMENSION, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer();

  return {
    buffer,
    contentType: "image/jpeg",
    sizeBytes: buffer.byteLength,
  };
}

/**
 * Validate that a MIME type is an accepted image format.
 */
export function isAcceptedImageType(mimeType: string): boolean {
  return [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
  ].includes(mimeType.toLowerCase());
}
