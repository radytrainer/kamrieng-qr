import "server-only";
import sharp from "sharp";

const MAX_DIMENSION = 640;
const WEBP_QUALITY = 80;

export interface CompressedImage {
  buffer: Buffer;
  contentType: "image/webp";
  extension: "webp";
}

/**
 * Re-encodes an uploaded photo to WebP, capped at 640px on the long edge.
 * Cuts storage/bandwidth dramatically (a typical phone photo drops from
 * 2-5MB to well under 100KB) with no visible quality loss at the sizes this
 * app actually displays photos (thumbnails, profile card, CR80 print).
 */
export async function compressImage(input: Buffer): Promise<CompressedImage> {
  const buffer = await sharp(input)
    .rotate() // auto-orient from EXIF, then the pipeline strips metadata (incl. that EXIF tag)
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  return { buffer, contentType: "image/webp", extension: "webp" };
}
