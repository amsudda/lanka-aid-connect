import db from '../models/index.js';

const { DonorProfile, Donation, NeedPost } = db;

export const getProfile = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const profile = await DonorProfile.findOne({
      where: { user_id: userId }
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
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

export const updateProfileStats = async (userId) => {
  try {
    const profile = await DonorProfile.findOne({
      where: { user_id: userId }
    });

    if (!profile) return;

    const totalDonations = await Donation.sum('quantity', {
      where: { donor_id: userId }
    }) || 0;

    const uniquePosts = await Donation.count({
      where: { donor_id: userId },
      distinct: true,
      col: 'post_id'
    });

    const uniqueDistricts = await Donation.findAll({
      where: { donor_id: userId },
      include: [{
        model: NeedPost,
        as: 'post',
        attributes: ['location_district']
      }],
      attributes: [],
      group: ['post.location_district']
    });

    await profile.update({
      items_donated: totalDonations,
      families_helped: uniquePosts,
      districts_active: uniqueDistricts.length
    });

    return profile;
  } catch (error) {
    console.error('Error updating profile stats:', error);
  }
};

export const getLeaderboard = async (req, res, next) => {
  try {
    const { limit = 10, sortBy = 'items_donated' } = req.query;

    const validSortFields = ['items_donated', 'families_helped', 'districts_active'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'items_donated';

    const profiles = await DonorProfile.findAll({
      order: [[sortField, 'DESC']],
      limit: parseInt(limit),
      attributes: ['id', 'full_name', 'avatar_url', 'families_helped', 'items_donated', 'districts_active', 'badges']
    });

    res.status(200).json({
      success: true,
      count: profiles.length,
      data: profiles
    });
  } catch (error) {
    next(error);
  }
};
