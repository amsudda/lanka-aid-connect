import db from '../models/index.js';
import { Op } from 'sequelize';

const { NeedPost, PostImage, Donation, User } = db;

export const getAllNeedPosts = async (req, res, next) => {
  try {
    const {
      category,
      district,
      status = 'active',
      search,
      page = 1,
      limit = 20
    } = req.query;

    const where = {};

    if (category && category !== 'all') {
      where.category = category;
    }

    if (district) {
      where.location_district = district;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { location_city: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await NeedPost.findAndCountAll({
      where,
      include: [
        {
          model: PostImage,
          as: 'images',
          attributes: ['id', 'image_url', 'display_order']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: rows
    });
  } catch (error) {
    next(error);
  }
};

export const getNeedPost = async (req, res, next) => {
  try {
    const post = await NeedPost.findByPk(req.params.id, {
      include: [
        {
          model: PostImage,
          as: 'images',
          attributes: ['id', 'image_url', 'display_order'],
          order: [['display_order', 'ASC']]
        },
        {
          model: Donation,
          as: 'donations',
          attributes: ['id', 'donor_name', 'quantity', 'message', 'created_at'],
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Need post not found'
      });
    }

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

export const createNeedPost = async (req, res, next) => {
  try {
    console.log('📝 Create Post - User authenticated:', !!req.user);
    console.log('📝 Create Post - User ID:', req.user?.id);
    console.log('📝 Create Post - Auth header present:', !!req.headers.authorization);

    const {
      victim_name,
      phone_number,
      location_district,
      location_city,
      location_landmark,
      location_description,
      location_lat,
      location_lng,
      category,
      title,
      description,
      quantity_needed
    } = req.body;

    const edit_pin = Math.floor(1000 + Math.random() * 9000).toString();

    const whatsapp_link = `https://wa.me/${phone_number.replace(/\D/g, '')}`;

    // Check if there's a voice note upload
    let voice_note_url = null;
    if (req.files) {
      const voiceNoteFile = Array.isArray(req.files)
        ? req.files.find(f => f.fieldname === 'voice_note')
        : req.files['voice_note'] ? req.files['voice_note'][0] : null;

      if (voiceNoteFile) {
        voice_note_url = `/uploads/voice-notes/${voiceNoteFile.filename}`;
      }
    }

    const post = await NeedPost.create({
      user_id: req.user?.id || null,
      victim_name,
      phone_number,
      whatsapp_link,
      location_district,
      location_city,
      location_landmark,
      location_description,
      location_lat: location_lat ? parseFloat(location_lat) : null,
      location_lng: location_lng ? parseFloat(location_lng) : null,
      category,
      title,
      description,
      quantity_needed,
      voice_note_url,
      edit_pin
    });

    // Handle image uploads (filter out voice note from files array)
    if (req.files && req.files.length > 0) {
      const imageFiles = Array.isArray(req.files)
        ? req.files.filter(f => f.fieldname === 'images')
        : req.files['images'] || [];

      if (imageFiles.length > 0) {
        const imagePromises = imageFiles.map((file, index) => {
          return PostImage.create({
            post_id: post.id,
            image_url: `/uploads/posts/${file.filename}`,
            display_order: index
          });
        });

        await Promise.all(imagePromises);
      }
    }

    const fullPost = await NeedPost.findByPk(post.id, {
      include: [
        {
          model: PostImage,
          as: 'images',
          attributes: ['id', 'image_url', 'display_order']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: fullPost,
      pin: edit_pin
    });
  } catch (error) {
    next(error);
  }
};

export const updateNeedPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { pin } = req.body;

    const post = await NeedPost.findByPk(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Need post not found'
      });
    }

    if (post.edit_pin !== pin) {
      return res.status(403).json({
        success: false,
        message: 'Invalid PIN'
      });
    }

    const allowedUpdates = [
      'title',
      'description',
      'quantity_needed',
      'location_city',
      'status'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    await post.update(updates);

    const updatedPost = await NeedPost.findByPk(id, {
      include: [
        {
          model: PostImage,
          as: 'images',
          attributes: ['id', 'image_url', 'display_order']
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: updatedPost
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNeedPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { pin } = req.body;

    const post = await NeedPost.findByPk(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Need post not found'
      });
    }

    if (post.edit_pin !== pin && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Invalid PIN or insufficient permissions'
      });
    }

    await post.destroy();

    res.status(200).json({
      success: true,
      message: 'Need post deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getUserPosts = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const posts = await NeedPost.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: PostImage,
          as: 'images',
          attributes: ['id', 'image_url', 'display_order']
        },
        {
          model: Donation,
          as: 'donations',
          attributes: ['id', 'donor_name', 'quantity', 'message', 'created_at']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: posts
    });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const activePosts = await NeedPost.count({ where: { status: 'active' } });
    const totalDonations = await Donation.sum('quantity') || 0;
    const familiesHelped = await NeedPost.count({ where: { status: 'fulfilled' } });

    res.status(200).json({
      success: true,
      data: {
        activePosts,
        totalDonations,
        familiesHelped
      }
    });
  } catch (error) {
    next(error);
  }
};
