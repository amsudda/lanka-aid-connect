import express from 'express';
import {
  adminLogin,
  getDashboardStats,
  getAllPostsAdmin,
  deletePostAdmin,
  updatePostStatus,
  getAllFlags,
  resolveFlag,
  getAllUsers,
  toggleUserBan
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { adminOnly, strictAdminOnly } from '../middleware/adminAuth.js';

const router = express.Router();

// Public routes
router.post('/login', adminLogin);

// Protected admin routes
router.use(protect, adminOnly);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Posts management
router.get('/posts', getAllPostsAdmin);
router.put('/posts/:id/status', updatePostStatus);
router.delete('/posts/:id', strictAdminOnly, deletePostAdmin);

// Flags management
router.get('/flags', getAllFlags);
router.put('/flags/:id/resolve', resolveFlag);

// Users management
router.get('/users', getAllUsers);
router.put('/users/:id/verify', toggleUserBan);

export default router;
