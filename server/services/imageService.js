import sharp from "sharp";
import { IMAGE_MIME_TYPES, MAX_IMAGE_BYTES, IMAGE_SIZE_ERROR } from "../../shared/cropAnalysis.js";
import { HttpError } from "../errors.js";

function signatureType(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff)
    return "image/jpeg";
  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])))
    return "image/png";
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  )
    return "image/webp";
  return null;
}

export async function prepareImage(file) {
  if (!file?.buffer?.length)
    throw new HttpError(400, "IMAGE_REQUIRED", "Upload a non-empty image in the image field.");
  if (file.buffer.length > MAX_IMAGE_BYTES)
    throw new HttpError(413, "IMAGE_TOO_LARGE", IMAGE_SIZE_ERROR);
  if (!IMAGE_MIME_TYPES.includes(file.mimetype) || signatureType(file.buffer) !== file.mimetype)
    throw new HttpError(
      415,
      "INVALID_IMAGE_TYPE",
      "File contents must match a JPG, PNG, or WebP image. Renaming a file does not convert it.",
    );
  try {
    const image = sharp(file.buffer, { limitInputPixels: 25_000_000, failOn: "warning" });
    const metadata = await image.metadata();
    const formats = { "image/jpeg": "jpeg", "image/png": "png", "image/webp": "webp" };
    if (metadata.format !== formats[file.mimetype] || (metadata.pages || 1) !== 1)
      throw new Error("Invalid format or animated image");
    // Fully decode, orient, strip metadata, and bound the image sent upstream.
    const buffer = await image
      .rotate()
      .resize({ width: 2048, height: 2048, fit: "inside", withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 90 })
      .toBuffer();
    return { buffer, mimeType: "image/jpeg" };
  } catch {
    throw new HttpError(
      422,
      "UNREADABLE_IMAGE",
      "The image is damaged, animated, or exceeds 25 megapixels. Export a smaller still JPG, PNG, or WebP and try again.",
    );
  }
}
