
import { Router } from 'express';
import pool from '../db-postgres.js';

const router = Router();

// GET: Fetch all leave requests.
router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        l.*,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name
      FROM leave_requests l
      JOIN employees e ON e.emp_id = l.emp_id
      ORDER BY l.applied_on DESC, l.leave_id DESC
    `);

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST: Submit a leave request.
router.post('/', async (req, res, next) => {
  try {
    const {
      emp_id,
      leave_type,
      start_date,
      end_date,
      reason
    } = req.body;

    if (!emp_id || !leave_type || !start_date || !end_date) {
      return res.status(400).json({
        message: 'Please complete required leave fields'
      });
    }

    const { rows } = await pool.query(
      `INSERT INTO leave_requests
       (emp_id, leave_type, start_date, end_date, reason)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING leave_id`,
      [
        emp_id,
        leave_type,
        start_date,
        end_date,
        reason || null
      ]
    );

    res.status(201).json({
      leave_id: rows[0].leave_id,
      message: 'Leave request submitted'
    });
  } catch (err) {
    next(err);
  }
});

// PATCH: Approve or reject a pending leave request.
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { leave_status } = req.body;

    if (!['Approved', 'Rejected'].includes(leave_status)) {
      return res.status(400).json({
        message: 'Status must be Approved or Rejected'
      });
    }

    const result = await pool.query(
      `UPDATE leave_requests
       SET leave_status = $1,
           reviewed_at = NOW()
       WHERE leave_id = $2
         AND leave_status = 'Pending'`,
      [leave_status, req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: 'Pending leave request not found'
      });
    }

    res.json({
      message: `Leave ${leave_status.toLowerCase()}`
    });
  } catch (err) {
    next(err);
  }
});

export default router;
