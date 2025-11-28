import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DonorProfile = sequelize.define('DonorProfile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  avatar_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  families_helped: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  items_donated: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  districts_active: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  badges: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  tableName: 'donor_profiles',
  indexes: [
    {
      unique: true,
      fields: ['user_id']
    }
  ]
});

export default DonorProfile;
