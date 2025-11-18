import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'enterprise_docs',
  synchronize: false,
  logging: true,
});

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Connected to database');

    // Generate API key
    const apiKey = uuidv4();
    const apiKeyHash = await bcrypt.hash(apiKey, 10);

    // Create default project
    const result = await AppDataSource.query(
      `INSERT INTO projects (name, slug, repository_url, api_key_hash)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (slug) DO UPDATE SET api_key_hash = $4
       RETURNING id`,
      ['Default Project', 'default', 'https://github.com/your-org/docs', apiKeyHash]
    );

    const projectId = result[0].id;

    console.log('✅ Created default project');
    console.log('\n📋 Project Details:');
    console.log(`  Project ID: ${projectId}`);
    console.log(`  Project Slug: default`);
    console.log(`  API Key: ${apiKey}`);
    console.log('\n⚠️  Save this API key! It will not be shown again.');
    console.log('\n🚀 Use this API key in your CLI configuration:');
    console.log(`  docs-cli init`);
    console.log(`  API Key: ${apiKey}`);

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
