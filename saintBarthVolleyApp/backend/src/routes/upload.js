import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// 🔹 Création du dossier uploads si il n'existe pas
const uploadDir = path.join(process.cwd(), 'public/uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// 🔹 Config multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueSuffix);
  },
});

const upload = multer({ storage });

// POST /api/upload
router.post('/', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const fileUrl = `/uploads/${req.file.filename}`; // accessible depuis public
    res.json({ fileUrl, filename: req.file.filename });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
