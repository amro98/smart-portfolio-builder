import type { NextFunction, Request, Response } from "express";

import { AUTH_COOKIE_NAME } from "../../constants/cookies";
import { verifyAuthToken } from "../../utils/jwt";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[AUTH_COOKIE_NAME];

  if (!token) {
    return res.status(401).json({
      error: "Unauthenticated",
    });
  }

  try {
    const payload = verifyAuthToken(token);

    req.userId = payload.userId;

    return next();
  } catch {
    return res.status(401).json({
      error: "Unauthenticated",
    });
  }
}

export function getAuthenticatedUserId(req: Request) {
  if (!req.userId) {
    throw new Error("Authenticated user id is missing");
  }

  return req.userId;
}