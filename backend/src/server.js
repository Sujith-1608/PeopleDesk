
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import pool from './db-postgres.js';

import { authenticate } from './middleware/auth.js';

import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import employeeRoutes from './routes/employees.js';
import departmentRoutes from './routes/departments.js';
import attendanceRoutes from './routes/attendance.js';
import leaveRoutes from './routes/leaves.js';
import payrollRoutes from './routes/payroll.js';
import referenceRoutes from './routes/reference.js';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const allowed = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim());

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowed.includes(origin)) {
      return cb(null, true);
    }

    return cb(new Error('Origin not allowed by CORS'));
  }
}));

// Parse JSON requests
app.use(express.json({ limit: '1mb' }));

// Database health check
app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');

    res.json({
      status: 'ok',
      database: 'connected'
    });
  } catch (err) {
    console.error('Database health check failed:', err.message);

    res.status(503).json({
      status: 'error',
      database: 'disconnected'
    });
  }
});

// Public authentication route
app.use('/api/auth', authRoutes);

// Protect all routes below this middleware
app.use('/api', authenticate);

// Application routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/reference', referenceRoutes);

// Global error handling middleware
app.use((err, _req, res, _next) => {
  console.error(err);

  // Unique constraint violation
  if (err.code === '23505') {
    return res.status(409).json({
      message: 'A record with these unique values already exists'
    });
  }

  // Foreign key violation
  if (err.code === '23503') {
    return res.status(409).json({
      message: 'This record is linked to other records or references a record that does not exist'
    });
  }

  // Check constraint or invalid input syntax
  if (err.code === '23514' || err.code === '22P02') {
    return res.status(400).json({
      message: 'Invalid data provided'
    });
  }

  // Generic server error
  res.status(500).json({
    message: process.env.NODE_ENV === 'production'
      ? 'Something went wrong'
      : err.message
  });
});

// Start server
const port = Number(process.env.PORT || 5000);

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
