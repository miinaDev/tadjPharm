import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Prisma tourne SANS moteur Rust (schema: engineType = "client") : les requetes passent par
// un compilateur WASM + un driver JS. Cela evite le crash natif "PANIC: timer has gone away"
// sur l'hebergement mutualise Hostinger. Il faut donc fournir un driver adapte a la base :
//   - Neon (production)  -> driver serverless Neon en WebSocket/443 (leger, robuste sur mutualise).
//   - Postgres classique (dev local sur Docker) -> driver pg standard en TCP.
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("Variable d'environnement manquante: DATABASE_URL");
}

function buildAdapter() {
  if (/neon\.tech/i.test(connectionString!)) {
    // Sous Node < 22, WebSocket n'est pas global : on fournit l'implementation via "ws".
    neonConfig.webSocketConstructor = ws;
    return new PrismaNeon({ connectionString: connectionString! });
  }
  return new PrismaPg({ connectionString: connectionString! });
}

export const prisma = new PrismaClient({ adapter: buildAdapter() });
