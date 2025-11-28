import db from '../models/index.js';

const { PostFlag, NeedPost } = db;

export const createFlag = async (req, res, next) => {
  try {
    const { id: postId } = req.params;
    const { reason } = req.body;

    const post = await NeedPost.findByPk(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Need post not found'
      });
    }

    const reporter_ip = req.ip || req.connection.remoteAddress;

    const flag = await PostFlag.create({
      post_id: postId,
      reason,
      reporter_ip
    });

    const flagCount = await PostFlag.count({ where: { post_id: postId } });

    await post.update({
      flag_count: flagCount,
      status: flagCount >= 5 ? 'flagged' : post.status
    });

    res.status(201).json({
      success: true,
      message: 'Post reported successfully',
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
    const { action } = req.body;

    const post = await NeedPost.findByPk(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Need post not found'
      });
    }

    if (action === 'hide') {
      await post.update({ status: 'hidden' });
    } else if (action === 'approve') {
      await post.update({
        status: 'active',
        flag_count: 0
      });
      await PostFlag.destroy({ where: { post_id: postId } });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Use "hide" or "approve"'
      });
    }

    res.status(200).json({
      success: true,
      message: `Post ${action}d successfully`,
      data: post
    });
  } catch (error) {
    next(error);
  }
};
