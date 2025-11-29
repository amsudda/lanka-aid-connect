import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import needPostRoutes from './needPostRoutes.js';
import donationRoutes from './donationRoutes.js';
import emergencyCenterRoutes from './emergencyCenterRoutes.js';
import authRoutes from './authRoutes.js';
import profileRoutes from './profileRoutes.js';
import flagRoutes from './flagRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import adminRoutes from './adminRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.use('/posts', needPostRoutes);
router.use('/posts', donationRoutes);
router.use('/posts', flagRoutes);
router.use('/centers', emergencyCenterRoutes);
router.use('/auth', authRoutes);
router.use('/profiles', profileRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

router.get('/debug/uploads', (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '../../uploads');
    const absolutePath = path.resolve(uploadsDir);

    const exists = fs.existsSync(uploadsDir);
    let files = [];

    if (exists) {
      files = fs.readdirSync(uploadsDir).map(file => ({
        name: file,
        path: `/uploads/${file}`,
        size: fs.statSync(path.join(uploadsDir, file)).size
      }));
    }

    res.status(200).json({
      success: true,
      uploadsDir: uploadsDir,
      absolutePath: absolutePath,
      exists: exists,
      fileCount: files.length,
      files: files
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
