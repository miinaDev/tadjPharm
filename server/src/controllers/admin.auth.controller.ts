import type { Request, Response } from "express";
import { prisma } from "../prisma";
import { loginSchema } from "../validators/auth.validator";
import { comparePassword } from "../utils/password";
import { clearAdminCookie, getAdminTokenFromCookie, setAdminCookie, signAdminToken } from "../middleware/auth";
import { HttpError } from "../middleware/errorHandler";

export async function login(req: Request, res: Response) {
  const { password } = loginSchema.parse(req.body);

  // Un seul admin : le mot de passe fait office d'identifiant. On identifie le compte
  // par le mot de passe (la boucle reste correcte meme s'il existait plusieurs comptes).
  const admins = await prisma.adminUser.findMany();
  let admin: (typeof admins)[number] | null = null;
  for (const candidate of admins) {
    if (await comparePassword(password, candidate.passwordHash)) {
      admin = candidate;
      break;
    }
  }
  if (!admin) throw new HttpError(401, "Mot de passe invalide");

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
