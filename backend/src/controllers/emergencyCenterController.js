import db from '../models/index.js';

const { EmergencyCenter } = db;

export const getAllCenters = async (req, res, next) => {
  try {
    const { district, verified } = req.query;

    const where = {};

    if (district) {
      where.district = district;
    }

    if (verified !== undefined) {
      where.is_verified = verified === 'true';
    }

    const centers = await EmergencyCenter.findAll({
      where,
      order: [
        ['is_verified', 'DESC'],
        ['created_at', 'DESC']
      ]
    });

    res.status(200).json({
      success: true,
      count: centers.length,
      data: centers
    });
  } catch (error) {
    next(error);
  }
};

export const getCenter = async (req, res, next) => {
  try {
    const center = await EmergencyCenter.findByPk(req.params.id);

    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Emergency center not found'
      });
    }

    res.status(200).json({
      success: true,
      data: center
    });
  } catch (error) {
    next(error);
  }
};

export const createCenter = async (req, res, next) => {
  try {
    const {
      name,
      address,
      district,
      phone,
      location_lat,
      location_lng,
      needs_list
    } = req.body;

    const center = await EmergencyCenter.create({
      name,
      address,
      district,
      phone,
      location_lat,
      location_lng,
      needs_list,
      is_verified: req.user && req.user.role === 'admin' ? true : false
    });

    res.status(201).json({
      success: true,
      data: center
    });
  } catch (error) {
    next(error);
  }
};

export const updateCenter = async (req, res, next) => {
  try {
    const center = await EmergencyCenter.findByPk(req.params.id);

    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Emergency center not found'
      });
    }

    const allowedUpdates = [
      'name',
      'address',
      'district',
      'phone',
      'location_lat',
      'location_lng',
      'needs_list',
      'is_verified'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    await center.update(updates);

    res.status(200).json({
      success: true,
      data: center
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCenter = async (req, res, next) => {
  try {
    const center = await EmergencyCenter.findByPk(req.params.id);

    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Emergency center not found'
      });
    }

    await center.destroy();

    res.status(200).json({
      success: true,
      message: 'Emergency center deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
