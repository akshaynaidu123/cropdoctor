import { IMAGE_MIME_TYPES, MAX_IMAGE_BYTES, IMAGE_SIZE_ERROR } from "../../shared/cropAnalysis.js";

export function validateImage(file: File) {
  if (!IMAGE_MIME_TYPES.includes(file.type))
    throw new Error(
      "Choose a JPG, JPEG, PNG, or WebP image. Convert HEIC photos before uploading.",
    );
  if (!file.size) throw new Error("The image file is empty. Choose another image.");
  if (file.size > MAX_IMAGE_BYTES) throw new Error(IMAGE_SIZE_ERROR);
}
