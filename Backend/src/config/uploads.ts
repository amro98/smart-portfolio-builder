import path from "node:path";
import fs from "node:fs";

// Local-disk upload storage: the simplest durable option that fits this app's current
// architecture without standing up an external storage account. Files are served back
// statically (see app.ts) so both the authenticated editor and anonymous public-portfolio
// visitors can resolve the same URL.
export const UPLOADS_DIR = path.join(process.cwd(), "uploads");
export const UPLOADS_URL_PREFIX = "/uploads";
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_MIME_TYPES: string[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

fs.mkdirSync(UPLOADS_DIR, { recursive: true });
