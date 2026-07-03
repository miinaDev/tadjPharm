import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variable d'environnement manquante: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  clientOrigin: required("CLIENT_ORIGIN"),
  jwtSecret: required("JWT_SECRET"),
  nodeEnv: process.env.NODE_ENV ?? "development",
};
