import type { NextFunction, Request, Response } from "express";

import { resolveSessionUserId } from "./session";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = await resolveSessionUserId(req);

    if (!userId) {
      return res.status(401).json({
        error: "Unauthenticated",
      });
    }

    req.userId = userId;

    return next();
  } catch (error) {
    return next(error);
  }
}

/**
 * State-changing auth endpoints only accept JSON. Browsers can't send a cross-site
 * `application/json` POST without a CORS preflight (which our CORS policy rejects), so this
 * closes the classic form-POST CSRF hole for cookie-authenticated routes.
 */
export function requireJsonBody(req: Request, res: Response, next: NextFunction) {
  if (!req.is("application/json")) {
    return res.status(415).json({ error: "Expected a JSON request body", code: "UNSUPPORTED_CONTENT_TYPE" });
  }
  return next();
}

export function getAuthenticatedUserId(req: Request) {
  if (!req.userId) {
    throw new Error("Authenticated user id is missing");
  }

  return req.userId;
}
