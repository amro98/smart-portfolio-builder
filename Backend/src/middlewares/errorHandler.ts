import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Invalid request data",
      details: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  // express.json() throws a plain SyntaxError for malformed request bodies.
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      error: "Malformed JSON in request body",
    });
  }

  // Server-side log only — the client never sees the stack trace or error internals.
  // eslint-disable-next-line no-console
  console.error(err);

  res.status(500).json({
    error: "Internal Server Error",
  });
}