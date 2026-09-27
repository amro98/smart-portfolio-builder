import { Router, type NextFunction, type Request, type Response } from "express";
import multer, { type FileFilterCallback } from "multer";
import path from "node:path";
import crypto from "node:crypto";

import { requireAuth } from "../auth/auth.middleware";
import {
  UPLOADS_DIR,
  UPLOADS_URL_PREFIX,
  MAX_IMAGE_SIZE_BYTES,
  ALLOWED_IMAGE_MIME_TYPES,
} from "../../config/uploads";

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) =>
    cb(null, UPLOADS_DIR),
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const ext = EXTENSION_BY_MIME[file.mimetype] ?? path.extname(file.originalname);
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES, files: 1 },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
      cb(new Error("UNSUPPORTED_FILE_TYPE"));
      return;
    }
    cb(null, true);
  },
});

export const uploadsRouter = Router();

uploadsRouter.use(requireAuth);

uploadsRouter.post("/image", (req: Request, res: Response, next: NextFunction) => {
  upload.single("file")(req, res, (err: unknown) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          error: `Image must be smaller than ${Math.floor(MAX_IMAGE_SIZE_BYTES / (1024 * 1024))}MB.`,
        });
      }

      if (err instanceof Error && err.message === "UNSUPPORTED_FILE_TYPE") {
        return res.status(400).json({
          error: "Unsupported image type. Please upload a JPG, PNG, WEBP, or GIF.",
        });
      }

      return next(err);
    }

    if (!req.file) {
      return res.status(400).json({ error: "No image file was provided." });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    return res.status(201).json({
      url: `${baseUrl}${UPLOADS_URL_PREFIX}/${req.file.filename}`,
    });
  });
});
