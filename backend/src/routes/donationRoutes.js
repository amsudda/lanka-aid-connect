import express from 'express';
import {
  createDonation,
  getDonationsByPost,
  getDonationsByUser,
  confirmDonationReceipt
} from '../controllers/donationController.js';
import { optional, protect } from '../middleware/auth.js';
import { donationValidation, uuidValidation } from '../middleware/validators.js';

const router = express.Router();

router.post('/:id/donate', uuidValidation, optional, donationValidation, createDonation);
router.get('/:id/donations', uuidValidation, optional, getDonationsByPost);
router.get('/user/donations', protect, getDonationsByUser);
router.put('/donations/:donationId/confirm', uuidValidation, protect, confirmDonationReceipt);

export default router;
