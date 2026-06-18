const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost', port: 5433,
  user: 'admin', password: 'adminpassword',
  database: 'servesmart',
});

async function resetPasswords() {
  const users = [
    { username: '091234567', password: 'soldier123' },
    { username: 'admin1', password: 'admin123' },
    { username: 'kitchen1', password: 'kitchen123' },
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 12);
    await pool.query('UPDATE users SET password_hash = $1 WHERE username = $2', [hash, u.username]);
    console.log(`✅ Reset password for ${u.username}`);
  }

  await pool.end();
  console.log('Done!');
}

resetPasswords().catch(console.error);
