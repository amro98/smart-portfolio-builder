import jwt from "jsonwebtoken";

export type AuthTokenPayload = {
  userId: string;
};

const JWT_EXPIRES_IN = "7d";

export function signAuthToken(payload: AuthTokenPayload) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.verify(token, process.env.JWT_SECRET) as AuthTokenPayload;
}