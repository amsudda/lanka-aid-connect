import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const NeedPost = sequelize.define('NeedPost', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  victim_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  whatsapp_link: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location_district: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location_city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location_landmark: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location_lat: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true
  },
  location_lng: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM('food', 'dry_rations', 'baby_items', 'medical', 'clothes', 'other'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  quantity_needed: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false
  },
  quantity_donated: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('active', 'fulfilled', 'flagged', 'hidden'),
    defaultValue: 'active'
  },
  edit_pin: {
    type: DataTypes.STRING(4),
    allowNull: false
  },
  flag_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  voice_note_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  // Family composition fields
  num_adults: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: true
  },
  num_children: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: true
  },
  num_infants: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: true
  },
  infant_ages: {
    type: DataTypes.JSON, // Store array of ages like [1, 3, 6] months
    allowNull: true
  },
  is_group_request: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  group_size: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'need_posts',
  indexes: [
    {
      fields: ['category']
    },
    {
      fields: ['status']
    },
    {
      fields: ['location_district']
    },
    {
      fields: ['created_at']
    }
  ]
});

export default NeedPost;
