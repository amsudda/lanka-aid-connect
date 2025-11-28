import express from 'express';
import {
  getAllCenters,
  getCenter,
  createCenter,
  updateCenter,
  deleteCenter
} from '../controllers/emergencyCenterController.js';
import { protect, authorize } from '../middleware/auth.js';
import { emergencyCenterValidation, uuidValidation } from '../middleware/validators.js';

const router = express.Router();

router.get('/', getAllCenters);
router.get('/:id', uuidValidation, getCenter);
router.post('/', emergencyCenterValidation, createCenter);
router.put('/:id', uuidValidation, protect, authorize('admin', 'moderator'), updateCenter);
router.delete('/:id', uuidValidation, protect, authorize('admin'), deleteCenter);

export default router;
