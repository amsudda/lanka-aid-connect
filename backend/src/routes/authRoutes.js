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

    // Pass userType through OAuth state parameter instead of session
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      state: userType || 'unknown' // Pass userType as state
    })(req, res, next);
  }
);

router.get(
  '/google/callback',
  (req, res, next) => {
    console.log('OAuth Callback - State parameter:', req.query.state);

    // Extract userType from OAuth state parameter and attach to req
    const userType = req.query.state;
    if (userType && userType !== 'unknown') {
      req.userTypeFromState = userType; // Attach to req object, not session
      console.log('OAuth Callback - UserType from state:', userType);
    }
    next();
  },
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
