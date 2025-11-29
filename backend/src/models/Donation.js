import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Donation = sequelize.define('Donation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  post_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'need_posts',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  donor_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  donor_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  donor_phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false
  },
  item_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pledged', 'in_transit', 'delivered', 'fulfilled'),
    defaultValue: 'pledged',
    allowNull: false
  },
  fulfilled_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'donations',
  indexes: [
    {
      fields: ['post_id']
    },
    {
      fields: ['donor_id']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['status']
    }
  ]
});

export default Donation;
