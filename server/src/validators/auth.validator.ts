import { z } from "zod";

// Un seul admin : le mot de passe suffit a se connecter (l'email n'est plus demande).
export const loginSchema = z.object({
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
