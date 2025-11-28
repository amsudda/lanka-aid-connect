import express from 'express';
import {
  createDonation,
  getDonationsByPost,
  getDonationsByUser
} from '../controllers/donationController.js';
import { optional, protect } from '../middleware/auth.js';
import { donationValidation, uuidValidation } from '../middleware/validators.js';

const router = express.Router();

router.post('/:id/donate', uuidValidation, optional, donationValidation, createDonation);
router.get('/:id/donations', uuidValidation, getDonationsByPost);
router.get('/user/donations', protect, getDonationsByUser);

export default router;
