import { baseUrl } from "../../../config";

/**
 * Backendga mos attachment upload
 * @param {File} file
 * @param {string} prefix
 * @returns {Promise<string>} attachmentId (UUID)
 */
export const uploadAttachment = async (file, prefix = "/sekretar-images") => {
  if (!file) {
    throw new Error("File is required");
  }

  const formData = new FormData();

  // ⚠️ backend aynan 'photo' kutyapti
  formData.append("photo", file);
  formData.append("prefix", prefix);

  const response = await fetch(`${baseUrl}/api/v1/file/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Attachment upload failed");
  }

  // backend ResponseEntity.ok(id) → UUID string
  const attachmentId = await response.json();
  return attachmentId;
};
