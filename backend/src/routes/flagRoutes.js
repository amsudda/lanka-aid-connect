import express from 'express';
import {
  createFlag,
  getFlaggedPosts,
  resolveFlag
} from '../controllers/flagController.js';
import { protect, authorize } from '../middleware/auth.js';
import { flagValidation, uuidValidation } from '../middleware/validators.js';

const router = express.Router();

// Create flag (admin only)
router.post('/:id/flag', uuidValidation, protect, authorize('admin', 'moderator'), flagValidation, createFlag);

// Admin routes for flag management
router.get('/flagged', protect, authorize('admin', 'moderator'), getFlaggedPosts);
router.put('/:id/resolve', uuidValidation, protect, authorize('admin', 'moderator'), resolveFlag);

export default router;
