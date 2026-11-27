
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import pool from './db-postgres.js';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

dotenv.config();

const rl = readline.createInterface({ input, output });

try {
  const fullName = await rl.question('Admin full name: ');
  const email = await rl.question('Admin email: ');
  const password = await rl.question('Admin password (minimum 12 characters): ');

  if (!fullName.trim() || !email.trim() || password.length < 12) {
    throw new Error(
      'Name and email are required; password must be at least 12 characters.'
    );
  }

  const hash = await bcrypt.hash(password, 12);

  await pool.query(
    `INSERT INTO users (full_name, email, password_hash, role)
     VALUES ($1, $2, $3, 'admin')`,
    [fullName.trim(), email.trim().toLowerCase(), hash]
  );

  console.log('Admin account created successfully in PostgreSQL!');

} catch (err) {
  console.error('Error:', err.message);
  process.exitCode = 1;

} finally {
  rl.close();
  await pool.end();
}
