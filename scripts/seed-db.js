const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env variables
const dotenvPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(dotenvPath)) {
  const envConfig = fs.readFileSync(dotenvPath, 'utf-8');
  envConfig.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length === 2) {
      process.env[parts[0].trim()] = parts[1].trim();
    }
  });
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_KEY === 'placeholder-key') {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY is required in .env to run the seeder script!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function seed() {
  console.log('Starting Supabase database seeding...');
  
  // Read local seedData file
  const seedPath = path.resolve(__dirname, '../src/data/seedData.json');
  if (!fs.existsSync(seedPath)) {
    console.error(`ERROR: Seed file not found at ${seedPath}`);
    process.exit(1);
  }

  const { categories, phrases } = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
  console.log(`Loaded ${categories.length} categories and ${phrases.length} phrases from seed file.`);

  // 1. Insert Categories in batches of 10
  console.log('\nSeeding categories...');
  for (let i = 0; i < categories.length; i += 10) {
    const batch = categories.slice(i, i + 10);
    const { error } = await supabase.from('categories').upsert(
      batch.map(c => ({
        id: c.id,
        language_id: c.language_id,
        name: c.name,
        description: c.description
      }))
    );
    if (error) {
      console.error(`Error seeding category batch starting at index ${i}:`, error.message);
    } else {
      console.log(`Seeded categories ${i + 1} to ${Math.min(i + 10, categories.length)}`);
    }
  }

  // 2. Insert Phrases in batches of 100
  console.log('\nSeeding phrases (this may take a moment)...');
  for (let i = 0; i < phrases.length; i += 100) {
    const batch = phrases.slice(i, i + 100);
    const { error } = await supabase.from('phrases').upsert(
      batch.map(p => ({
        id: p.id,
        language_id: p.language_id,
        category_id: p.category_id,
        text: p.text,
        translation: p.translation,
        explanation: p.explanation,
        difficulty: p.difficulty,
        audio_url: p.audio_url,
        voice_name: p.voice_name,
        speed: p.speed,
        is_published: true
      }))
    );
    if (error) {
      console.error(`Error seeding phrase batch starting at index ${i}:`, error.message);
    } else {
      console.log(`Seeded phrases ${i + 1} to ${Math.min(i + 100, phrases.length)}`);
    }
  }

  console.log('\nDatabase seeding completed successfully!');
}

seed();
