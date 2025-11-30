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

    const reporter_ip = req.ip || req.connection.remoteAddress;

    // Create flag
    const flag = await PostFlag.create({
      post_id: postId,
      reason,
      details: details || null,
      reporter_ip
    });

    // Update flag count on post
    const flagCount = await PostFlag.count({ where: { post_id: postId } });

    await post.update({
      flag_count: flagCount,
      status: flagCount >= 5 ? 'flagged' : post.status
    });

    res.status(201).json({
      success: true,
      message: 'Post flagged successfully',
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

export const resolveFlag = async (req, res, next) => {
  try {
    const { id: postId } = req.params;

    const post = await NeedPost.findByPk(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    await PostFlag.update(
      { is_resolved: true },
      { where: { post_id: postId } }
    );

    await post.update({ status: 'active', flag_count: 0 });

    res.status(200).json({
      success: true,
      message: 'Flag resolved successfully'
    });
  } catch (error) {
    next(error);
  }
};
