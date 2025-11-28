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
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
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
    }
  ]
});

export default Donation;
