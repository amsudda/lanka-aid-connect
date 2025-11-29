import sequelize from '../config/database.js';

async function addFlagColumns() {
  try {
    const queryInterface = sequelize.getQueryInterface();

    // Check if columns exist
    const tableDescription = await queryInterface.describeTable('post_flags');

    // Add details column if it doesn't exist
    if (!tableDescription.details) {
      console.log('Adding details column...');
      await queryInterface.addColumn('post_flags', 'details', {
        type: sequelize.Sequelize.TEXT,
        allowNull: true
      });
      console.log('Details column added');
    } else {
      console.log('Details column already exists');
    }

    // Add is_resolved column if it doesn't exist
    if (!tableDescription.is_resolved) {
      console.log('Adding is_resolved column...');
      await queryInterface.addColumn('post_flags', 'is_resolved', {
        type: sequelize.Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
      console.log('is_resolved column added');
    } else {
      console.log('is_resolved column already exists');
    }

    console.log('\nMigration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

addFlagColumns();
