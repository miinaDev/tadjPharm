import fs from "node:fs";
import path from "node:path";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./env";
import { publicRouter } from "./routes/public.routes";
import { adminRouter } from "./routes/admin.routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

export const app = express();

app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Keep-alive : ping externe (UptimeRobot) pour empecher la mise en veille Render.
// Volontairement sans acces DB pour ne pas garder Neon eveille en permanence.
app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api", publicRouter);
app.use("/api/admin", adminRouter);

// Mode tout-en-un (Hostinger) : si le build du frontend est present a cote, l'API le
// sert directement (meme origine -> pas de CORS ni de cookie cross-site a gerer).
// Sur un deploiement API-seule (ex. Render), le dossier n'existe pas : on saute cette
// partie et le notFoundHandler renvoie un 404 JSON comme avant.
const clientDir = process.env.CLIENT_DIST_DIR
  ? path.resolve(process.env.CLIENT_DIST_DIR)
  : path.join(__dirname, "..", "..", "client", "dist");

if (fs.existsSync(path.join(clientDir, "index.html"))) {
  app.use(express.static(clientDir));
  // Fallback SPA : toute route qui n'est ni /api, ni /uploads, ni /health, ni un fichier
  // reel renvoie index.html pour que React Router prenne le relais (pas de 404 au refresh).
  app.get(/^(?!\/(?:api|uploads|health)(?:\/|$)).*/, (_req, res) => {
    res.sendFile(path.join(clientDir, "index.html"));
  });
}

app.use(notFoundHandler);
app.use(errorHandler);
