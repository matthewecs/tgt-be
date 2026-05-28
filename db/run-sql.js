require('dotenv').config();
const { execSync } = require('child_process');
const path = require('path');

const file = process.argv[2];
if (!file) {
  console.error('Usage: node db/run-sql.js <file.sql>');
  process.exit(1);
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

const absPath = path.resolve(file);
console.log(`Running ${absPath} against ${url.replace(/:\/\/.*@/, '://<credentials>@')} ...`);

try {
  execSync(`psql "${url}" -f "${absPath}"`, { stdio: 'inherit' });
} catch {
  process.exit(1);
}
