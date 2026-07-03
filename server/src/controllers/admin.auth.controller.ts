import type { Request, Response } from "express";
import { prisma } from "../prisma";
import { loginSchema } from "../validators/auth.validator";
import { comparePassword } from "../utils/password";
import { clearAdminCookie, getAdminTokenFromCookie, setAdminCookie, signAdminToken } from "../middleware/auth";
import { HttpError } from "../middleware/errorHandler";

export async function login(req: Request, res: Response) {
  const { email, password } = loginSchema.parse(req.body);

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) throw new HttpError(401, "Identifiants invalides");

  const valid = await comparePassword(password, admin.passwordHash);
  if (!valid) throw new HttpError(401, "Identifiants invalides");

  const token = signAdminToken({ sub: admin.id, email: admin.email });
  setAdminCookie(res, token);
  res.json({ id: admin.id, email: admin.email });
}

export async function logout(_req: Request, res: Response) {
  clearAdminCookie(res);
  res.status(204).send();
}

export async function me(req: Request, res: Response) {
  const payload = getAdminTokenFromCookie(req);
  if (!payload) throw new HttpError(401, "Non authentifie");
  res.json({ id: payload.sub, email: payload.email });
}
