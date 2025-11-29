import sequelize from '../config/database.js';
import User from './User.js';
import DonorProfile from './DonorProfile.js';
import NeedPost from './NeedPost.js';
import PostImage from './PostImage.js';
import Donation from './Donation.js';
import DonationImage from './DonationImage.js';
import EmergencyCenter from './EmergencyCenter.js';
import PostFlag from './PostFlag.js';
import Notification from './Notification.js';

// Define associations
User.hasOne(DonorProfile, { foreignKey: 'user_id', as: 'profile' });
DonorProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(NeedPost, { foreignKey: 'user_id', as: 'posts' });
NeedPost.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

NeedPost.hasMany(PostImage, { foreignKey: 'post_id', as: 'images' });
PostImage.belongsTo(NeedPost, { foreignKey: 'post_id', as: 'post' });

NeedPost.hasMany(Donation, { foreignKey: 'post_id', as: 'donations' });
Donation.belongsTo(NeedPost, { foreignKey: 'post_id', as: 'post' });

User.hasMany(Donation, { foreignKey: 'donor_id', as: 'donations' });
Donation.belongsTo(User, { foreignKey: 'donor_id', as: 'donor' });

Donation.hasMany(DonationImage, { foreignKey: 'donation_id', as: 'images' });
DonationImage.belongsTo(Donation, { foreignKey: 'donation_id', as: 'donation' });

NeedPost.hasMany(PostFlag, { foreignKey: 'post_id', as: 'flags' });
PostFlag.belongsTo(NeedPost, { foreignKey: 'post_id', as: 'post' });

User.hasMany(PostFlag, { foreignKey: 'reporter_id', as: 'flags' });
PostFlag.belongsTo(User, { foreignKey: 'reporter_id', as: 'reporter' });

User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Notification.belongsTo(NeedPost, { foreignKey: 'related_post_id', as: 'relatedPost' });
Notification.belongsTo(Donation, { foreignKey: 'related_donation_id', as: 'relatedDonation' });

const db = {
  sequelize,
  User,
  DonorProfile,
  NeedPost,
  PostImage,
  Donation,
  DonationImage,
  EmergencyCenter,
  PostFlag,
  Notification
};

export default db;
