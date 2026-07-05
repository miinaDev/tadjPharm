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

app.use(notFoundHandler);
app.use(errorHandler);
