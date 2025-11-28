import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const uploadDir = process.env.UPLOAD_PATH || './uploads';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(path.join(uploadDir, 'posts'))) {
  fs.mkdirSync(path.join(uploadDir, 'posts'), { recursive: true });
}

if (!fs.existsSync(path.join(uploadDir, 'avatars'))) {
  fs.mkdirSync(path.join(uploadDir, 'avatars'), { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folder = req.path.includes('avatar') ? 'avatars' : 'posts';
    cb(null, path.join(uploadDir, folder));
  },
  filename: function (req, file, cb) {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880
  },
  fileFilter: fileFilter
});
