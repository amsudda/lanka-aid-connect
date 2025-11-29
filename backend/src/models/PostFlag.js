import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PostFlag = sequelize.define('PostFlag', {
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
  reporter_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  reason: {
    type: DataTypes.ENUM('spam', 'scam', 'fake', 'harassment', 'inappropriate', 'other'),
    allowNull: false,
    defaultValue: 'other'
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reporter_ip: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'resolved', 'dismissed'),
    defaultValue: 'pending',
    allowNull: false
  },
  is_resolved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  }
}, {
  tableName: 'post_flags',
  indexes: [
    {
      fields: ['post_id']
    },
    {
      fields: ['reporter_id']
    },
    {
      fields: ['status']
    }
  ]
});

export default PostFlag;
