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
  reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reporter_ip: {
    type: DataTypes.STRING,
    allowNull: true
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
    }
  ]
});

export default PostFlag;
