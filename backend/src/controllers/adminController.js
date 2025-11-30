import db from '../models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { trackFailedLogin, clearLoginAttempts } from '../middleware/loginAttempts.js';

const { User, NeedPost, Donation, PostFlag, PostImage } = db;

// Admin login
export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Track failed attempt even if user doesn't exist
      const attemptStatus = trackFailedLogin(email);
      console.warn(`[SECURITY] Failed admin login attempt for non-existent user: ${email} from IP: ${clientIP}`);

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        attemptsRemaining: attemptStatus.attemptsRemaining
      });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      console.warn(`[SECURITY] Non-admin user attempted admin login: ${email} from IP: ${clientIP}`);

      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Verify password
    if (!user.password) {
      const attemptStatus = trackFailedLogin(email);
      console.warn(`[SECURITY] Failed admin login attempt (no password set): ${email} from IP: ${clientIP}`);

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        attemptsRemaining: attemptStatus.attemptsRemaining
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // Track failed login attempt
      const attemptStatus = trackFailedLogin(email);
      console.warn(`[SECURITY] Failed admin login attempt (wrong password): ${email} from IP: ${clientIP} | Attempts remaining: ${attemptStatus.attemptsRemaining}`);

      if (attemptStatus.locked) {
        return res.status(423).json({
          success: false,
          message: 'Account temporarily locked due to too many failed login attempts. Please try again later.',
          lockedUntil: attemptStatus.lockoutEnd
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        attemptsRemaining: attemptStatus.attemptsRemaining
      });
    }

    // Successful login - clear any failed attempts
    clearLoginAttempts(email);

    console.log(`[SECURITY] Successful admin login: ${email} from IP: ${clientIP}`);

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update last login
    await user.update({ last_login: new Date() });

    res.json({
      success: true,
      token,
      admin: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get admin dashboard stats
export const getDashboardStats = async (req, res, next) => {
  try {
    // Post stats
    const totalPosts = await NeedPost.count();
    const activePosts = await NeedPost.count({ where: { status: 'active' } });
    const fulfilledPosts = await NeedPost.count({ where: { status: 'fulfilled' } });
    const pendingPosts = 0; // Will implement post approval later

    // User stats
    const totalUsers = await User.count({ where: { role: 'user' } });
    const totalDonors = await User.count({ where: { user_type: 'donor' } });
    const totalRequesters = await User.count({ where: { user_type: 'requester' } });

    // Flag stats
    const flaggedPosts = await PostFlag.count({ where: { is_resolved: false } });

    // Donation stats
    const totalDonations = await Donation.count();
    const totalItemsDonated = await Donation.sum('quantity') || 0;

    // Recent activity
    const recentPosts = await NeedPost.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      attributes: ['id', 'title', 'status', 'created_at'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['full_name', 'email']
        }
      ]
    });

    const recentFlags = await PostFlag.findAll({
      where: { is_resolved: false },
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: NeedPost,
          as: 'post',
          attributes: ['id', 'title']
        }
      ]
    });

    res.json({
      success: true,
      stats: {
        posts: {
          total: totalPosts,
          active: activePosts,
          fulfilled: fulfilledPosts,
          pending: pendingPosts
        },
        users: {
          total: totalUsers,
          donors: totalDonors,
          requesters: totalRequesters
        },
        flags: {
          pending: flaggedPosts
        },
        donations: {
          total: totalDonations,
          items: totalItemsDonated
        }
      },
      recentActivity: {
        posts: recentPosts,
        flags: recentFlags
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all posts (with filters)
export const getAllPostsAdmin = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const where = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await NeedPost.findAndCountAll({
      where,
      include: [
        {
          model: PostImage,
          as: 'images',
          attributes: ['id', 'image_url']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'email']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      count,
      totalPages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page),
      posts: rows
    });
  } catch (error) {
    next(error);
  }
};

// Delete post (admin)
export const deletePostAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await NeedPost.findByPk(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    await post.destroy();

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update post status
export const updatePostStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, is_verified } = req.body;

    const post = await NeedPost.findByPk(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Update both status and verification if provided
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (is_verified !== undefined) updateData.is_verified = is_verified;

    await post.update(updateData);

    res.json({
      success: true,
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    next(error);
  }
};

// Get all flags
export const getAllFlags = async (req, res, next) => {
  try {
    const { resolved = 'false' } = req.query;

    const where = {
      is_resolved: resolved === 'true'
    };

    const flags = await PostFlag.findAll({
      where,
      include: [
        {
          model: NeedPost,
          as: 'post',
          attributes: ['id', 'title', 'status'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['full_name', 'email']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      count: flags.length,
      flags
    });
  } catch (error) {
    next(error);
  }
};

// Resolve flag
export const resolveFlag = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' or 'dismiss'

    const flag = await PostFlag.findByPk(id, {
      include: [{ model: NeedPost, as: 'post' }]
    });

    if (!flag) {
      return res.status(404).json({
        success: false,
        message: 'Flag not found'
      });
    }

    // Mark flag as resolved
    await flag.update({ is_resolved: true });

    // If approved, hide the post
    if (action === 'approve' && flag.post) {
      await flag.post.update({ status: 'flagged' });
    }

    res.json({
      success: true,
      message: `Flag ${action === 'approve' ? 'approved' : 'dismissed'} successfully`
    });
  } catch (error) {
    next(error);
  }
};

// Get all users
export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, user_type } = req.query;

    const where = { role: 'user' };
    if (user_type && user_type !== 'all') {
      where.user_type = user_type;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: ['id', 'email', 'full_name', 'user_type', 'is_verified', 'created_at', 'last_login'],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      count,
      totalPages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page),
      users: rows
    });
  } catch (error) {
    next(error);
  }
};

// Ban/unban user
export const toggleUserBan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_verified } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify admin users'
      });
    }

    await user.update({ is_verified });

    res.json({
      success: true,
      message: `User ${is_verified ? 'verified' : 'unverified'} successfully`,
      user
    });
  } catch (error) {
    next(error);
  }
};
