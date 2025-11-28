import db from '../models/index.js';
import { testConnection } from '../config/database.js';

const migrate = async () => {
  try {
    console.log('🔄 Starting database migration...');

    const isConnected = await testConnection();

    if (!isConnected) {
      console.error('❌ Database connection failed. Migration aborted.');
      process.exit(1);
    }

    await db.sequelize.sync({ force: false, alter: true });

    console.log('✅ Database migration completed successfully!');
    console.log('\nTables created/updated:');
    console.log('  - users');
    console.log('  - donor_profiles');
    console.log('  - need_posts');
    console.log('  - post_images');
    console.log('  - donations');
    console.log('  - emergency_centers');
    console.log('  - post_flags');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrate();
