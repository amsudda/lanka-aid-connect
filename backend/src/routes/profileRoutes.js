import express from 'express';
import {
  getProfile,
  getLeaderboard
} from '../controllers/profileController.js';
import { protect, optional } from '../middleware/auth.js';
import { uuidValidation } from '../middleware/validators.js';

const router = express.Router();

router.get('/leaderboard', getLeaderboard);
router.get('/me', protect, getProfile);
router.get('/:userId', uuidValidation, optional, getProfile);

export default router;
