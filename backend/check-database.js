import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Connected to MySQL database\n');

    // Check need_posts table
    const [posts] = await connection.execute('SELECT * FROM need_posts ORDER BY created_at DESC');

    console.log(`📊 Total posts in database: ${posts.length}\n`);

    if (posts.length > 0) {
      console.log('📝 Recent posts:');
      console.log('=' .repeat(80));

      posts.forEach((post, index) => {
        console.log(`\n${index + 1}. ${post.title}`);
        console.log(`   ID: ${post.id}`);
        console.log(`   Name: ${post.victim_name}`);
        console.log(`   Location: ${post.location_city || ''} ${post.location_district}`);
        console.log(`   Category: ${post.category}`);
        console.log(`   Quantity: ${post.quantity_donated}/${post.quantity_needed}`);
        console.log(`   Status: ${post.status}`);
        console.log(`   Created: ${post.created_at}`);
      });
    } else {
      console.log('❌ No posts found in database');
    }

    // Check if there are any recent posts (last 5 minutes)
    const [recentPosts] = await connection.execute(
      'SELECT * FROM need_posts WHERE created_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE)'
    );

    if (recentPosts.length > 0) {
      console.log('\n\n🆕 Posts created in the last 5 minutes:');
      console.log('=' .repeat(80));
      recentPosts.forEach((post) => {
        console.log(`\n📌 ${post.title}`);
        console.log(`   Created: ${post.created_at}`);
        console.log(`   Description: ${post.description.substring(0, 100)}...`);
      });
    }

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDatabase();
