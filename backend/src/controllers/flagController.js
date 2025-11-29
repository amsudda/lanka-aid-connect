import db from '../models/index.js';

const { PostFlag, NeedPost } = db;

export const createFlag = async (req, res, next) => {
  try {
    const { id: postId } = req.params;
    const { reason, details } = req.body;

    // Validate post exists
    const post = await NeedPost.findByPk(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Validate reason
    const validReasons = ['spam', 'scam', 'fake', 'harassment', 'inappropriate', 'other'];
    if (!reason || !validReasons.includes(reason)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reason. Must be one of: spam, scam, fake, harassment, inappropriate, other'
      });
    }

    const reporter_ip = req.ip || req.connection.remoteAddress;

    // Create flag with optional user ID if authenticated
    const flag = await PostFlag.create({
      post_id: postId,
      reporter_id: req.user ? req.user.id : null,
      reason,
      details: details || null,
      reporter_ip,
      status: 'pending'
    });

    // Update flag count on post
    const flagCount = await PostFlag.count({ where: { post_id: postId } });

    await post.update({
      flag_count: flagCount,
      status: flagCount >= 5 ? 'flagged' : post.status
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Thank you for helping keep our community safe.',
      data: flag
    });
  } catch (error) {
    next(error);
  }
};

export const getFlaggedPosts = async (req, res, next) => {
  try {
    const posts = await NeedPost.findAll({
      where: { status: 'flagged' },
      include: [{
        model: PostFlag,
        as: 'flags',
        attributes: ['id', 'reason', 'created_at']
      }],
      order: [['flag_count', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    next(error);
  }
};

export const getAllFlags = async (req, res, next) => {
  try {
    const { status } = req.query;

    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const flags = await PostFlag.findAll({
      where: whereClause,
      include: [
        {
          model: NeedPost,
          as: 'post',
          attributes: ['id', 'title', 'description', 'category', 'status', 'user_id', 'created_at'],
          include: [{
            model: db.PostImage,
            as: 'images',
            attributes: ['id', 'image_url'],
            limit: 1
          }]
        },
        {
          model: db.User,
          as: 'reporter',
          attributes: ['id', 'full_name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: flags.length,
      data: flags
    });
  } catch (error) {
    next(error);
  }
};

export const resolveFlag = async (req, res, next) => {
  try {
    const { id: flagId } = req.params;
    const { action, status } = req.body;

    const flag = await PostFlag.findByPk(flagId, {
      include: [{
        model: NeedPost,
        as: 'post'
      }]
    });

    if (!flag) {
      return res.status(404).json({
        success: false,
        message: 'Flag not found'
      });
    }

    const post = flag.post;

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Associated post not found'
      });
    }

    // Update flag status
    if (status) {
      await flag.update({
        status: status,
        is_resolved: status === 'resolved' || status === 'dismissed'
      });
    }

    // Handle post action
    if (action === 'hide') {
      await post.update({ status: 'hidden' });
    } else if (action === 'approve') {
      await post.update({
        status: 'active',
        flag_count: Math.max(0, post.flag_count - 1)
      });
    } else if (action === 'delete') {
      await post.destroy();
    }

    res.status(200).json({
      success: true,
      message: `Flag ${status || action}d successfully`,
      data: flag
    });
  } catch (error) {
    next(error);
  }
};
