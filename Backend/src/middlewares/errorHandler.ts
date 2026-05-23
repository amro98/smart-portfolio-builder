import type { Request, Response, NextFunction } from "express";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  // Keep it simple for now; we will improve error shapes later.
  // eslint-disable-next-line no-console
  console.error(err);

  res.status(500).json({
    error: "Internal Server Error",
  });
}