import express from 'express';
import {
  getAllNeedPosts,
  getNeedPost,
  createNeedPost,
  updateNeedPost,
  deleteNeedPost,
  getUserPosts,
  getStats
} from '../controllers/needPostController.js';
import { protect, optional } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { needPostValidation, uuidValidation } from '../middleware/validators.js';

const router = express.Router();

router.get('/', getAllNeedPosts);
router.get('/stats', getStats);
router.get('/my-posts', protect, getUserPosts);
router.get('/:id', uuidValidation, getNeedPost);
router.post('/', optional, upload.array('images', 5), needPostValidation, createNeedPost);
router.put('/:id', uuidValidation, optional, updateNeedPost);
router.delete('/:id', uuidValidation, optional, deleteNeedPost);

export default router;
