import fs from "node:fs";
import path from "node:path";
import multer from "multer";

export const UPLOADS_DIR = path.join(__dirname, "..", "..", "uploads", "products");

// Dossier de secours pour le stockage disque (developpement local).
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

// On garde les fichiers en memoire (buffer) : le service de stockage decide
// ensuite de les envoyer vers Cloudinary (prod) ou de les ecrire sur disque (dev).
export const uploadProductImages = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 6 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new Error("Type de fichier non autorise (jpeg, png, webp uniquement)"));
      return;
    }
    cb(null, true);
  },
});

export const uploadExcelFile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error("Le fichier doit etre un fichier Excel (.xlsx)"));
      return;
    }
    cb(null, true);
  },
});
