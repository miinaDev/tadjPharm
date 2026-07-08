import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Prisma tourne desormais SANS moteur Rust (schema: engineType = "client") : les requetes
// passent par un compilateur WASM + un driver JS, ce qui evite le crash natif
// "PANIC: timer has gone away" sur l'hebergement mutualise Hostinger.
// On branche le driver serverless de Neon (connexion WebSocket sur le port 443, tres leger).
// Sous Node < 22, WebSocket n'est pas global : on fournit l'implementation via "ws".
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("Variable d'environnement manquante: DATABASE_URL");
}

const adapter = new PrismaNeon({ connectionString });

export const prisma = new PrismaClient({ adapter });
