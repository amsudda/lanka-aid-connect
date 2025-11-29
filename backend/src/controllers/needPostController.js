import db from '../models/index.js';
import { Op } from 'sequelize';

const { NeedPost, PostImage, Donation, User } = db;

export const getAllNeedPosts = async (req, res, next) => {
  try {
    console.log('\n========== GET ALL POSTS REQUEST ==========');
    console.log('🟢 BACKEND: getAllNeedPosts controller invoked');
    console.log('🟢 Method:', req.method);
    console.log('🟢 URL:', req.originalUrl);

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
    console.log('\n========== CREATE POST REQUEST ==========');
    console.log('🔴 BACKEND: createNeedPost controller invoked');
    console.log('🔴 Method:', req.method);
    console.log('🔴 URL:', req.originalUrl);
    console.log('🔴 Headers:', JSON.stringify(req.headers, null, 2));
    console.log('🔴 Body keys:', Object.keys(req.body));
    console.log('🔴 Files:', req.files ? Object.keys(req.files) : 'none');
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
      quantity_needed,
      num_adults,
      num_children,
      num_infants,
      infant_ages,
      is_group_request,
      group_size
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
        voice_note_url = `/uploads/${voiceNoteFile.filename}`;
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
      edit_pin,
      num_adults: num_adults ? parseInt(num_adults) : 1,
      num_children: num_children ? parseInt(num_children) : 0,
      num_infants: num_infants ? parseInt(num_infants) : 0,
      infant_ages: infant_ages ? JSON.parse(infant_ages) : null,
      is_group_request: is_group_request === 'true' || is_group_request === true,
      group_size: group_size ? parseInt(group_size) : null
    });

    // Handle image uploads (filter out voice note from files array)
    if (req.files) {
      console.log('📷 Processing uploads...');
      console.log('📷 req.files type:', Array.isArray(req.files) ? 'array' : 'object');
      console.log('📷 req.files keys:', Object.keys(req.files));

      const imageFiles = Array.isArray(req.files)
        ? req.files.filter(f => f.fieldname === 'images')
        : req.files['images'] || [];

      console.log('📷 Image files found:', imageFiles.length);

      if (imageFiles.length > 0) {
        imageFiles.forEach((file, idx) => {
          console.log(`📷 Image ${idx + 1}:`, {
            fieldname: file.fieldname,
            filename: file.filename,
            size: file.size,
            mimetype: file.mimetype,
            path: file.path,
            url: `/uploads/${file.filename}`
          });
        });

        const imagePromises = imageFiles.map((file, index) => {
          return PostImage.create({
            post_id: post.id,
            image_url: `/uploads/${file.filename}`,
            display_order: index
          });
        });

        const createdImages = await Promise.all(imagePromises);
        console.log('📷 Successfully created', createdImages.length, 'image records in database');
      } else {
        console.log('📷 No image files to process');
      }
    } else {
      console.log('📷 No files uploaded');
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

    console.log('🔴 BACKEND: Post created successfully, ID:', post.id);
    console.log('🔴 BACKEND: Sending response with data and pin');
    console.log('========== CREATE POST REQUEST COMPLETE ==========\n');

    res.status(201).json({
      success: true,
      data: fullPost,
      pin: edit_pin
    });
  } catch (error) {
    console.error('🔴 BACKEND: Error in createNeedPost:', error);
    console.log('========== CREATE POST REQUEST FAILED ==========\n');
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
    // Count total posts
    const total = await NeedPost.count();

    // Count active posts
    const active = await NeedPost.count({ where: { status: 'active' } });

    // Count fulfilled posts
    const fulfilled = await NeedPost.count({ where: { status: 'fulfilled' } });

    // Sum total quantity needed
    const totalQuantityNeeded = await NeedPost.sum('quantity_needed') || 0;

    // Sum total quantity donated
    const totalQuantityDonated = await Donation.sum('quantity') || 0;

    res.status(200).json({
      success: true,
      total,
      active,
      fulfilled,
      totalQuantityNeeded,
      totalQuantityDonated
    });
  } catch (error) {
    next(error);
  }
};
