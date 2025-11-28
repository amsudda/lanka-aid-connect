import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PostImage = sequelize.define('PostImage', {
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
  image_url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  display_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'post_images',
  indexes: [
    {
      fields: ['post_id']
    },
    {
      fields: ['display_order']
    }
  ]
});

export default PostImage;
