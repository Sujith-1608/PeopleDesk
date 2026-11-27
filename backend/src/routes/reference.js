
import { Router } from 'express';
import pool from '../db-postgres.js';

const router = Router();

router.get('/jobs', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT job_id, job_title FROM jobs ORDER BY job_title'
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;
