import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subDir = path.join(uploadDir, req.user?._id?.toString() || 'anonymous');
    if (!fs.existsSync(subDir)) fs.mkdirSync(subDir, { recursive: true });
    cb(null, subDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only images and PDFs are allowed'), false);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

export const uploadAnswerKey = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
});
