import bcrypt from 'bcryptjs';
import db from '../models/index.js';

const { User } = db;

async function recreateAdmin() {
  try {
    const adminEmail = 'idearigs@gmail.com';
    const adminPassword = 'Admin@2024';
    const adminName = 'System Administrator';

    // Delete existing admin
    await User.destroy({ where: { email: adminEmail } });
    console.log('Existing admin deleted');

    // Create new admin user (password will be hashed by model hook)
    const admin = await User.create({
      email: adminEmail,
      password: adminPassword, // Plain password - will be hashed by beforeCreate hook
      full_name: adminName,
      role: 'admin',
      user_type: 'donor',
      is_verified: true
    });

    console.log('\nAdmin user created successfully!');
    console.log('Email:', admin.email);
    console.log('Password: Admin@2024');
    console.log('Role:', admin.role);
    console.log('ID:', admin.id);

    // Verify password works
    const testMatch = await bcrypt.compare(adminPassword, admin.password);
    console.log('\nPassword verification:', testMatch ? 'SUCCESS' : 'FAILED');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

recreateAdmin();
