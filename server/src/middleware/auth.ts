import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../env";
import { HttpError } from "./errorHandler";

const COOKIE_NAME = "tadjpharm_admin_token";

export interface AdminTokenPayload {
  sub: string;
  email: string;
}

export function signAdminToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: "12h" });
}

export function setAdminCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.nodeEnv === "production",
    maxAge: 12 * 60 * 60 * 1000,
  });
}

export function clearAdminCookie(res: Response) {
  res.clearCookie(COOKIE_NAME);
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    return next(new HttpError(401, "Authentification requise"));
  }
  try {
    const payload = jwt.verify(token, env.jwtSecret) as AdminTokenPayload;
    req.adminId = payload.sub;
    next();
  } catch {
    return next(new HttpError(401, "Session invalide ou expiree"));
  }
}

export function getAdminTokenFromCookie(req: Request): AdminTokenPayload | null {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return null;
  try {
    return jwt.verify(token, env.jwtSecret) as AdminTokenPayload;
  } catch {
    return null;
  }
}
