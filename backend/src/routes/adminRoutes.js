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
import {
  adminLoginLimiter,
  adminRoutesLimiter,
  logAdminAccess,
  adminSecurityHeaders,
  ipAllowlist
} from '../middleware/adminSecurity.js';
import { checkAccountLockout } from '../middleware/loginAttempts.js';

const router = express.Router();

// Public routes with strict rate limiting and account lockout check
router.post('/login', checkAccountLockout, adminLoginLimiter, adminLogin);

// Protected admin routes with comprehensive security middleware
router.use(protect, adminOnly, logAdminAccess, adminSecurityHeaders, adminRoutesLimiter);

// Optional: Uncomment to enable IP allowlist (configure ADMIN_ALLOWED_IPS in .env)
// router.use(ipAllowlist);

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
