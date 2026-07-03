import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variable d'environnement manquante: ${name}`);
  }
  return value;
}

const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;

export const env = {
  port: Number(process.env.PORT ?? 4000),
  clientOrigin: required("CLIENT_ORIGIN"),
  jwtSecret: required("JWT_SECRET"),
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProduction: (process.env.NODE_ENV ?? "development") === "production",
  // Stockage des images : si les 3 variables Cloudinary sont presentes on l'utilise,
  // sinon on retombe sur le disque local (pratique en developpement).
  cloudinary:
    cloudinaryCloudName && cloudinaryApiKey && cloudinaryApiSecret
      ? { cloudName: cloudinaryCloudName, apiKey: cloudinaryApiKey, apiSecret: cloudinaryApiSecret }
      : null,
};
