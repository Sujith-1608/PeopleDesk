
import { Router } from 'express';
import pool from '../db-postgres.js';

const router = Router();

// GET: Fetch attendance records with optional date filter.
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         a.*,
         CONCAT(e.first_name, ' ', e.last_name) AS employee_name
       FROM attendance a
       JOIN employees e ON e.emp_id = a.emp_id
       WHERE ($1::date IS NULL OR a.attendance_date = $1::date)
       ORDER BY a.attendance_date DESC, a.attendance_id DESC
       LIMIT 200`,
      [req.query.date || null]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST: Create attendance record.
router.post('/', async (req, res, next) => {
  try {
    const {
      emp_id,
      attendance_date,
      check_in,
      check_out,
      attendance_status
    } = req.body;

    if (!emp_id || !attendance_date || !attendance_status) {
      return res.status(400).json({
        message: 'Employee, date and status are required'
      });
    }

    const { rows } = await pool.query(
      `INSERT INTO attendance
       (emp_id, attendance_date, check_in, check_out, attendance_status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING attendance_id`,
      [
        emp_id,
        attendance_date,
        check_in || null,
        check_out || null,
        attendance_status
      ]
    );

    res.status(201).json({
      attendance_id: rows[0].attendance_id,
      message: 'Attendance saved'
    });
  } catch (err) {
    next(err);
  }
});

export default router;
