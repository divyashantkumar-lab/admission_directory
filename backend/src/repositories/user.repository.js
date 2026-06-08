const fs = require('fs');
const csv = require('csv-parser');
const { USERS_CSV_PATH } = require('../config/constants');

function parseUsersFromBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const rows = [];
    const stream = require('stream');
    const readable = stream.Readable.from(buffer.toString());
    readable
      .pipe(csv())
      .on('data', (row) => {
        rows.push({
          email: (row.email || '').trim().toLowerCase(),
          passwordHash: (row.passwordHash || '').trim(),
          role: (row.role || 'user').trim(),
          name: (row.name || '').trim(),
        });
      })
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

async function readAll() {
  if (!fs.existsSync(USERS_CSV_PATH)) {
    return [];
  }
  const buffer = fs.readFileSync(USERS_CSV_PATH);
  return parseUsersFromBuffer(buffer);
}

async function findByEmail(email) {
  const users = await readAll();
  const normalized = email.trim().toLowerCase();
  return users.find((u) => u.email === normalized) || null;
}

async function create(user) {
  const users = await readAll();
  const normalized = user.email.trim().toLowerCase();
  if (users.some((u) => u.email === normalized)) {
    const err = new Error('Email already registered');
    err.code = 'DUPLICATE_EMAIL';
    throw err;
  }
  users.push({
    email: normalized,
    passwordHash: user.passwordHash,
    role: user.role || 'user',
    name: user.name || '',
  });
  writeUsers(users);
  return {
    email: normalized,
    role: user.role || 'user',
    name: user.name || '',
  };
}

function writeUsers(users) {
  const header = 'email,passwordHash,role,name\n';
  const lines = users.map(
    (u) =>
      `${escapeCsv(u.email)},${escapeCsv(u.passwordHash)},${escapeCsv(u.role)},${escapeCsv(u.name)}`
  );
  fs.writeFileSync(USERS_CSV_PATH, header + lines.join('\n') + '\n', 'utf8');
}

function escapeCsv(value) {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

module.exports = {
  readAll,
  findByEmail,
  create,
};
