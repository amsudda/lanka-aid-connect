import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// Save uploads to backend directory with persistent storage
const uploadDir = process.env.UPLOAD_PATH || '/app/backend/uploads';

// Create single upload directory with detailed logging
console.log('📁 Upload directory configuration:');
console.log('📁 Upload base path:', uploadDir);
console.log('📁 Resolved upload path:', path.resolve(uploadDir));

if (!fs.existsSync(uploadDir)) {
  console.log('📁 Creating upload directory...');
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Upload directory created');
}

console.log('📁 Upload directory ready:', fs.existsSync(uploadDir) ? '✅' : '❌');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save all files to single uploads directory
    console.log(`💾 Saving ${file.fieldname} to: ${uploadDir}`);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    console.log(`💾 Generated filename: ${uniqueName} for field: ${file.fieldname}`);
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Check if this is a voice note
  if (file.fieldname === 'voice_note') {
    const allowedAudioTypes = /webm|mp4|mpeg|mp3|wav|ogg/;
    const extname = allowedAudioTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype.startsWith('audio/') || file.mimetype === 'video/webm';

    if (mimetype && (extname || file.mimetype === 'audio/webm' || file.mimetype === 'video/webm')) {
      return cb(null, true);
    } else {
      return cb(new Error('Only audio files are allowed for voice notes'));
    }
  }

  // Check if this is an image
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedImageTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 20971520, // 20MB per file (was 5MB)
    fieldSize: 25 * 1024 * 1024, // 25MB for non-file fields
  },
  fileFilter: fileFilter
});
