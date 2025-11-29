import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DonationImage = sequelize.define('DonationImage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  donation_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'donations',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  display_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'donation_images',
  indexes: [
    {
      fields: ['donation_id']
    }
  ]
});

export default DonationImage;
