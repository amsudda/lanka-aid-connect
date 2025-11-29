import bcrypt from 'bcryptjs';
import db from '../models/index.js';

const { User } = db;

async function createAdmin() {
  try {
    // Admin credentials
    const adminEmail = 'idearigs@gmail.com';
    const adminPassword = 'Admin@2024'; // Change this to a secure password
    const adminName = 'System Administrator';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });

    if (existingAdmin) {
      console.log('Admin user already exists!');

      // Update password and ensure admin role
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await existingAdmin.update({
        password: hashedPassword,
        role: 'admin',
        full_name: adminName,
        is_verified: true
      });
      console.log('Admin user updated successfully!');
      console.log('Email:', adminEmail);
      console.log('Password:', adminPassword);
      console.log('Role:', 'admin');
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      // Create admin user
      const admin = await User.create({
        email: adminEmail,
        password: hashedPassword,
        full_name: adminName,
        role: 'admin',
        user_type: 'donor', // Required field, but not used for admin
        is_verified: true
      });

      console.log('Admin user created successfully!');
      console.log('Email:', adminEmail);
      console.log('Password:', adminPassword);
      console.log('Please change this password after first login!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdmin();
