import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function cleanupPosts() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('🔄 Connected to database');
    console.log('⚠️  This will delete ALL posts and related data!');

    // Delete in order to respect foreign key constraints
    console.log('\n📝 Deleting post images...');
    const [imagesResult] = await connection.query('DELETE FROM post_images');
    console.log(`✓ Deleted ${imagesResult.affectedRows} post images`);

    console.log('\n📝 Deleting donations...');
    const [donationsResult] = await connection.query('DELETE FROM donations');
    console.log(`✓ Deleted ${donationsResult.affectedRows} donations`);

    console.log('\n📝 Deleting post flags...');
    const [flagsResult] = await connection.query('DELETE FROM post_flags');
    console.log(`✓ Deleted ${flagsResult.affectedRows} post flags`);

    console.log('\n📝 Deleting notifications...');
    const [notificationsResult] = await connection.query('DELETE FROM notifications WHERE related_post_id IS NOT NULL');
    console.log(`✓ Deleted ${notificationsResult.affectedRows} notifications`);

    console.log('\n📝 Deleting need posts...');
    const [postsResult] = await connection.query('DELETE FROM need_posts');
    console.log(`✓ Deleted ${postsResult.affectedRows} need posts`);

    console.log('\n✅ All test posts and related data deleted successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

cleanupPosts();
