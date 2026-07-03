import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { v2 as cloudinary } from "cloudinary";
import { env } from "../env";
import { UPLOADS_DIR } from "../middleware/upload";

if (env.cloudinary) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
  });
}

export interface StoredImage {
  /** URL a stocker/servir : absolue (Cloudinary) ou relative /uploads/... (disque). */
  url: string;
  /** Reference pour la suppression : public_id (Cloudinary) ou nom de fichier (disque). */
  ref: string;
}

const CLOUDINARY_FOLDER = "tadjpharm/products";

function uploadToCloudinary(buffer: Buffer): Promise<{ secure_url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: CLOUDINARY_FOLDER, resource_type: "image" },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Echec de l'upload Cloudinary"));
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

export async function saveImage(file: Express.Multer.File): Promise<StoredImage> {
  if (env.cloudinary) {
    const result = await uploadToCloudinary(file.buffer);
    return { url: result.secure_url, ref: result.public_id };
  }

  // Fallback disque local (developpement)
  const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
  const filename = `${crypto.randomBytes(16).toString("hex")}${ext}`;
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), file.buffer);
  return { url: `/uploads/products/${filename}`, ref: filename };
}

export async function deleteStoredImage(ref: string): Promise<void> {
  try {
    if (env.cloudinary) {
      await cloudinary.uploader.destroy(ref);
    } else {
      fs.unlinkSync(path.join(UPLOADS_DIR, ref));
    }
  } catch {
    // Fichier/ressource deja absent : on ignore, la suppression en base a deja eu lieu.
  }
}
