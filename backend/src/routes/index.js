import express from 'express';
import needPostRoutes from './needPostRoutes.js';
import donationRoutes from './donationRoutes.js';
import emergencyCenterRoutes from './emergencyCenterRoutes.js';
import authRoutes from './authRoutes.js';
import profileRoutes from './profileRoutes.js';
import flagRoutes from './flagRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import adminRoutes from './adminRoutes.js';

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

export default router;
