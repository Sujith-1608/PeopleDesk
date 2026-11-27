
import { Router } from 'express';
import pool from '../db-postgres.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const { rows: employeeRows } = await pool.query(
      'SELECT COUNT(*)::int AS total FROM employees'
    );

    const { rows: activeRows } = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM employees
       WHERE employment_status = 'Active'`
    );

    const { rows: departmentRows } = await pool.query(
      'SELECT COUNT(*)::int AS total FROM departments'
    );

    const { rows: pendingLeaveRows } = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM leave_requests
       WHERE leave_status = 'Pending'`
    );

    const { rows: payrollRows } = await pool.query(
      `SELECT COALESCE(SUM(net_salary), 0)::float8 AS total
       FROM payroll
       WHERE payroll_month = DATE_TRUNC('month', CURRENT_DATE)::date`
    );

    const { rows: recent } = await pool.query(`
      SELECT
        e.emp_id,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        d.department_name,
        e.base_salary,
        e.employment_status
      FROM employees e
      JOIN departments d ON d.department_id = e.department_id
      ORDER BY e.created_at DESC
      LIMIT 5
    `);

    res.json({
      stats: {
        employees: employeeRows[0].total,
        activeEmployees: activeRows[0].total,
        departments: departmentRows[0].total,
        pendingLeaves: pendingLeaveRows[0].total,
        currentMonthPayroll: payrollRows[0].total
      },
      recentEmployees: recent
    });

  } catch (err) {
    next(err);
  }
});

export default router;
