import db from '../models/index.js';
import { testConnection } from '../config/database.js';

const { EmergencyCenter, NeedPost, PostImage } = db;

// Emergency centers removed - will be added manually by admins
// No test/sample emergency centers will be seeded

const samplePosts = [
  {
    victim_name: 'Nimal Perera',
    phone_number: '+94771234567',
    whatsapp_link: 'https://wa.me/94771234567',
    location_district: 'Colombo',
    location_city: 'Nugegoda',
    category: 'food',
    title: 'Urgent: Food needed for family of 5',
    description: 'Our home was damaged in recent floods. We need rice, lentils, and other basic food items for a family of 5 including 2 children.',
    quantity_needed: 10,
    quantity_donated: 3,
    status: 'active',
    edit_pin: '1234'
  },
  {
    victim_name: 'Kamala Silva',
    phone_number: '+94772345678',
    whatsapp_link: 'https://wa.me/94772345678',
    location_district: 'Gampaha',
    location_city: 'Negombo',
    category: 'baby_items',
    title: 'Baby essentials needed urgently',
    description: 'Lost everything in the landslide. Need diapers, baby formula, and baby clothes for 6-month-old.',
    quantity_needed: 5,
    quantity_donated: 0,
    status: 'active',
    edit_pin: '2345'
  },
  {
    victim_name: 'Sunil Fernando',
    phone_number: '+94773456789',
    whatsapp_link: 'https://wa.me/94773456789',
    location_district: 'Kalutara',
    location_city: 'Panadura',
    category: 'medical',
    title: 'Medical supplies for elderly mother',
    description: 'Need medications and medical supplies for my 75-year-old mother who has diabetes and high blood pressure.',
    quantity_needed: 3,
    quantity_donated: 2,
    status: 'active',
    edit_pin: '3456'
  },
  {
    victim_name: 'Anusha Jayawardena',
    phone_number: '+94774567890',
    whatsapp_link: 'https://wa.me/94774567890',
    location_district: 'Galle',
    location_city: 'Galle City',
    category: 'clothes',
    title: 'Clothing for children',
    description: 'Need clothes for 3 children aged 5, 8, and 10 after losing everything in the disaster.',
    quantity_needed: 15,
    quantity_donated: 15,
    status: 'fulfilled',
    edit_pin: '4567'
  }
];

const seed = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    const isConnected = await testConnection();

    if (!isConnected) {
      console.error('❌ Database connection failed. Seeding aborted.');
      process.exit(1);
    }

    console.log('🗑️  Clearing existing data...');
    await EmergencyCenter.destroy({ where: {} });
    await NeedPost.destroy({ where: {} });

    console.log('📦 Seeding sample need posts...');
    await NeedPost.bulkCreate(samplePosts);
    console.log(`✅ Created ${samplePosts.length} sample need posts`);

    console.log('ℹ️  Emergency centers not seeded - will be added manually by admins');

    console.log('\n✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seed();
