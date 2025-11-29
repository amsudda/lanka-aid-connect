import db from '../models/index.js';
import { createNotification } from './notificationController.js';

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

    const wasFulfilled = post.status === 'fulfilled';
    const newStatus = newQuantityDonated >= post.quantity_needed ? 'fulfilled' : 'active';

    await post.update({
      quantity_donated: newQuantityDonated,
      status: newStatus
    });

    // Create notification for the post owner (requester)
    if (post.user_id) {
      try {
        await createNotification({
          user_id: post.user_id,
          type: 'donation_received',
          title: '🎉 New Donation Received!',
          message: `${donor_name} donated ${quantity} ${quantity > 1 ? 'items' : 'item'} to your post "${post.title}"${message ? `: "${message}"` : ''}`,
          link: `/need/${post.id}`,
          related_post_id: post.id,
          related_donation_id: donation.id,
          metadata: {
            donor_name,
            quantity,
            post_title: post.title
          }
        });
      } catch (notifError) {
        console.error('Failed to create donation notification:', notifError);
      }
    }

    // Create notification if post just became fulfilled
    if (!wasFulfilled && newStatus === 'fulfilled' && post.user_id) {
      try {
        await createNotification({
          user_id: post.user_id,
          type: 'post_fulfilled',
          title: '✅ Your Request is Fulfilled!',
          message: `Great news! Your post "${post.title}" has received all the items needed. Thank you to all donors!`,
          link: `/need/${post.id}`,
          related_post_id: post.id,
          metadata: {
            post_title: post.title,
            total_quantity: post.quantity_needed
          }
        });
      } catch (notifError) {
        console.error('Failed to create fulfillment notification:', notifError);
      }
    }

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

    // Get the post to check if current user is the owner
    const post = await NeedPost.findByPk(postId);
    const isOwner = req.user && post && post.user_id === req.user.id;

    const donations = await Donation.findAll({
      where: { post_id: postId },
      include: [
        {
          model: db.DonationImage,
          as: 'images',
          attributes: ['id', 'image_url', 'display_order']
        },
        {
          model: db.User,
          as: 'donor',
          attributes: ['id', 'full_name', 'avatar_url']
        }
      ],
      order: [['created_at', 'DESC']],
      attributes: [
        'id',
        'donor_name',
        // Only show phone to post owner
        ...(isOwner ? ['donor_phone'] : []),
        'quantity',
        'item_description',
        'message',
        'status',
        'created_at',
        'fulfilled_at'
      ]
    });

    res.status(200).json({
      success: true,
      count: donations.length,
      data: donations,
      isOwner: isOwner
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

export const confirmDonationReceipt = async (req, res, next) => {
  try {
    const { donationId } = req.params;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const donation = await Donation.findByPk(donationId, {
      include: [{
        model: NeedPost,
        as: 'post'
      }]
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    // Verify the user is the post owner
    if (donation.post.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the post owner can confirm receipt'
      });
    }

    // Update donation status to fulfilled
    await donation.update({
      status: 'fulfilled',
      fulfilled_at: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Donation receipt confirmed successfully',
      data: donation
    });
  } catch (error) {
    next(error);
  }
};
