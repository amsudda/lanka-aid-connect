import db from '../models/index.js';

const { Donation, NeedPost, DonorProfile } = db;

export const createDonation = async (req, res, next) => {
  try {
    const { id: postId } = req.params;
    const { donor_name, quantity, message } = req.body;

    const post = await NeedPost.findByPk(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Need post not found'
      });
    }

    if (post.status === 'fulfilled') {
      return res.status(400).json({
        success: false,
        message: 'This need has already been fulfilled'
      });
    }

    const donation = await Donation.create({
      post_id: postId,
      donor_id: req.user ? req.user.id : null,
      donor_name,
      quantity,
      message
    });

    const newQuantityDonated = Math.min(
      post.quantity_donated + quantity,
      post.quantity_needed
    );

    await post.update({
      quantity_donated: newQuantityDonated,
      status: newQuantityDonated >= post.quantity_needed ? 'fulfilled' : 'active'
    });

    if (req.user) {
      const [profile] = await DonorProfile.findOrCreate({
        where: { user_id: req.user.id },
        defaults: {
          user_id: req.user.id,
          full_name: donor_name,
          families_helped: 0,
          items_donated: 0,
          districts_active: 0
        }
      });

      const itemsDonated = profile.items_donated + quantity;
      const familiesHelped = profile.families_helped + 1;

      const uniqueDistricts = await Donation.findAll({
        where: { donor_id: req.user.id },
        include: [{
          model: NeedPost,
          as: 'post',
          attributes: ['location_district']
        }],
        attributes: [],
        group: ['post.location_district']
      });

      await profile.update({
        items_donated: itemsDonated,
        families_helped: familiesHelped,
        districts_active: uniqueDistricts.length
      });
    }

    res.status(201).json({
      success: true,
      data: donation
    });
  } catch (error) {
    next(error);
  }
};

export const getDonationsByPost = async (req, res, next) => {
  try {
    const { id: postId } = req.params;

    const donations = await Donation.findAll({
      where: { post_id: postId },
      order: [['created_at', 'DESC']],
      attributes: ['id', 'donor_name', 'quantity', 'message', 'created_at']
    });

    res.status(200).json({
      success: true,
      count: donations.length,
      data: donations
    });
  } catch (error) {
    next(error);
  }
};

export const getDonationsByUser = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const donations = await Donation.findAll({
      where: { donor_id: req.user.id },
      include: [{
        model: NeedPost,
        as: 'post',
        attributes: ['id', 'title', 'category', 'status']
      }],
      order: [['created_at', 'DESC']],
      limit: 50
    });

    res.status(200).json({
      success: true,
      count: donations.length,
      data: donations
    });
  } catch (error) {
    next(error);
  }
};
