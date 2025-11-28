import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const EmergencyCenter = sequelize.define('EmergencyCenter', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  district: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
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
  needs_list: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'emergency_centers',
  indexes: [
    {
      fields: ['district']
    },
    {
      fields: ['is_verified']
    }
  ]
});

export default EmergencyCenter;
