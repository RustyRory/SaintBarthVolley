import multer from 'multer';
import { GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';
import mongoose from 'mongoose';

// Multer en mémoire
const storage = multer.memoryStorage();
export const upload = multer({ storage });

// Upload vers GridFS
export async function uploadToGridFS(file, filename) {
  const db = mongoose.connection.db; // on récupère la db de Mongoose
  const bucket = new GridFSBucket(db, { bucketName: 'uploads' });

  return new Promise((resolve, reject) => {
    const readable = Readable.from(file.buffer);

    const uploadStream = bucket.openUploadStream(filename, {
      contentType: file.mimetype,
    });

    readable
      .pipe(uploadStream)
      .on('error', (err) => reject(err))
      .on('finish', () => resolve(uploadStream.id));
  });
}
