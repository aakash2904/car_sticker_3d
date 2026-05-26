const bcrypt = require('bcryptjs');
const supabase = require('./supabaseClient');

async function seed() {
  console.log('Seeding admin user...');

  const hashed = await bcrypt.hash('admin123', 10);

  const { data, error } = await supabase
    .from('users')
    .insert([{
      userid: 'admin',
      password: hashed,
      name: 'Administrator',
      role: 'admin'
    }])
    .select('id, userid, name, role')
    .single();

  if (error) {
    console.error('Error seeding user:', error.message);
    process.exit(1);
  }

  console.log('Admin user created successfully:');
  console.log(data);
  console.log('\n--- Login credentials ---');
  console.log('User ID : admin');
  console.log('Password: admin123');
  process.exit(0);
}

seed();
