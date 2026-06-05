import QRCode from "qrcode";

/**
 * Generate a QR code as a PNG data URL for the given event upload link.
 * Suitable for embedding in `<img src={...} />` or for downloading.
 */
export async function generateQrDataUrl(uploadUrl: string): Promise<string> {
  return QRCode.toDataURL(uploadUrl, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 400,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });
}

/**
 * Generate a QR code as a raw PNG Buffer.
 * Use this when saving to R2 or sending as a binary response.
 */
export async function generateQrBuffer(uploadUrl: string): Promise<Buffer> {
  return QRCode.toBuffer(uploadUrl, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 400,
  });
}

/**
 * Build the public upload URL for an event slug.
 */
export function buildUploadUrl(slug: string): string {
  const base =
    process.env.NEXTAUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";
  return `${base}/upload/${slug}`;
}

/**
 * Generate a URL-safe slug from an event name + short unique suffix.
 */
export function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);

  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}
