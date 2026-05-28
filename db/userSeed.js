require('dotenv').config();
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const seedUsers = [
  {
    name: 'Administrator',
    username: 'admin',
    email: 'admin@tgt.co.id',
    password: 'admin123',
    role: 'admin',
  },
  {
    name: 'Owner TGT',
    username: 'owner',
    email: 'owner@tgt.co.id',
    password: 'owner123',
    role: 'owner',
  },
  {
    name: 'Worker TGT',
    username: 'worker',
    email: 'worker@tgt.co.id',
    password: 'worker123',
    role: 'worker',
  },
];

async function run() {
  const client = await pool.connect();
  try {
    for (const u of seedUsers) {
      const { rows } = await client.query('SELECT id FROM roles WHERE name = $1', [u.role]);
      if (!rows[0]) {
        console.error(`Role '${u.role}' not found — run db:seed first`);
        process.exit(1);
      }
      const roleId = rows[0].id;
      const hash = await bcrypt.hash(u.password, 10);
      await client.query(
        `INSERT INTO users (name, username, email, password_hash, role_id)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (username) DO NOTHING`,
        [u.name, u.username, u.email, hash, roleId]
      );
      console.log(`Seeded user: ${u.username} (${u.role}) — password: ${u.password}`);
    }
    console.log('User seeding complete.');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
