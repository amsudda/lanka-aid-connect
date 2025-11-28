import express from 'express';
import passport from '../config/passport.js';
import {
  googleCallback,
  getCurrentUser,
  updateProfile,
  logout
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get(
  '/google',
  (req, res, next) => {
    const userType = req.query.userType;
    console.log('Google OAuth Init - userType from query:', userType);
    req.session.userType = userType; // Store in session for callback
    console.log('Google OAuth Init - Session userType set to:', req.session.userType);
    next();
  },
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL || 'https://localhost:8080'}/select-type`,
    session: true
  }),
  googleCallback
);

router.get('/me', protect, getCurrentUser);
router.put('/profile', protect, updateProfile);
router.post('/logout', logout);

export default router;
