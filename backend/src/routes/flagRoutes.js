import express from 'express';
import {
  createFlag,
  getFlaggedPosts,
  resolveFlag
} from '../controllers/flagController.js';
import { protect, authorize } from '../middleware/auth.js';
import { flagValidation, uuidValidation } from '../middleware/validators.js';

const router = express.Router();

router.post('/:id/flag', uuidValidation, flagValidation, createFlag);
router.get('/flagged', protect, authorize('admin', 'moderator'), getFlaggedPosts);
router.post('/:id/resolve', uuidValidation, protect, authorize('admin', 'moderator'), resolveFlag);

export default router;
