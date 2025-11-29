import jwt from 'jsonwebtoken';
import db from '../models/index.js';

const { User, DonorProfile } = db;

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

export const googleCallback = async (req, res, next) => {
  try {
    console.log('OAuth Callback - User:', req.user?.email);
    console.log('OAuth Callback - userType from req:', req.userTypeFromState);
    console.log('OAuth Callback - User current user_type:', req.user?.user_type);

    const token = generateToken(req.user.id);
    const userType = req.userTypeFromState; // Read from req object instead of session
    const isNewUser = !req.user.user_type;

    console.log('OAuth Callback - Is new user?', isNewUser);

    // IMPORTANT: Always update user type if provided in session
    // This allows users to change their type when they log back in
    if (userType) {
      console.log('OAuth Callback - Updating user with type:', userType);
      await req.user.update({
        user_type: userType,
        last_login: new Date()
      });
      // Update the local object to reflect the change
      req.user.user_type = userType;
    } else {
      await req.user.update({ last_login: new Date() });
    }

    // Use frontend URL from environment variable and remove trailing slash
    const redirectUrl = (process.env.FRONTEND_URL || 'https://localhost:8080').replace(/\/$/, '');

    // Determine redirect path based on user type
    const finalUserType = req.user.user_type || userType;
    let redirectPath = '/profile'; // Default to profile page

    console.log('OAuth Callback - Final user type:', finalUserType);

    // If no user type at all, send to select-type
    if (!finalUserType) {
      console.log('OAuth Callback - No user type, redirecting to /select-type');
      return res.redirect(`${redirectUrl}/select-type`);
    }

    // Redirect to profile page after authentication
    console.log('OAuth Callback - Redirecting to profile');

    const fullRedirectUrl = `${redirectUrl}${redirectPath}?token=${token}&userType=${finalUserType}`;
    console.log('OAuth Callback - Full redirect URL:', fullRedirectUrl);

    res.redirect(fullRedirectUrl);
  } catch (error) {
    console.error('OAuth Callback Error:', error);
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const profile = await DonorProfile.findOne({
      where: { user_id: req.user.id }
    });

    res.status(200).json({
      success: true,
      user: req.user,
      profile: profile
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const { full_name, avatar_url } = req.body;

    const [profile, created] = await DonorProfile.findOrCreate({
      where: { user_id: req.user.id },
      defaults: {
        user_id: req.user.id,
        full_name,
        avatar_url
      }
    });

    if (!created) {
      await profile.update({
        full_name: full_name || profile.full_name,
        avatar_url: avatar_url || profile.avatar_url
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    });
  } catch (error) {
    next(error);
  }
};
