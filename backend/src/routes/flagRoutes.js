import express from 'express';
import {
  createFlag,
  getFlaggedPosts,
  getAllFlags,
  resolveFlag
} from '../controllers/flagController.js';
import { protect, authorize, optional } from '../middleware/auth.js';
import { flagValidation, uuidValidation } from '../middleware/validators.js';

const router = express.Router();

// Allow both authenticated and anonymous reporting
router.post('/:id/flag', uuidValidation, optional, flagValidation, createFlag);

// Admin routes for flag management
router.get('/flags', protect, authorize('admin', 'moderator'), getAllFlags);
router.get('/flagged', protect, authorize('admin', 'moderator'), getFlaggedPosts);
router.put('/flags/:id', uuidValidation, protect, authorize('admin', 'moderator'), resolveFlag);

export default router;
