
import { Router } from 'express';
import pool from '../db-postgres.js';

const router = Router();

// GET: Fetch all payroll records.
router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        p.*,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name
      FROM payroll p
      JOIN employees e ON e.emp_id = p.emp_id
      ORDER BY p.payroll_month DESC, p.payroll_id DESC
    `);

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST: Generate payroll.
router.post('/', async (req, res, next) => {
  let client;
  let transactionStarted = false;

  try {
    const {
      emp_id,
      payroll_month,
      allowances = 0,
      deductions = 0
    } = req.body;

    if (!emp_id || !payroll_month) {
      return res.status(400).json({
        message: 'Employee and payroll month are required'
      });
    }

    if (!/^\d{4}-\d{2}-01$/.test(payroll_month)) {
      return res.status(400).json({
        message: 'Payroll month must use YYYY-MM-01'
      });
    }

    const employeeId = Number(emp_id);
    const allowanceAmount = Number(allowances);
    const deductionAmount = Number(deductions);

    if (
      !Number.isInteger(employeeId) ||
      employeeId <= 0 ||
      !Number.isFinite(allowanceAmount) ||
      !Number.isFinite(deductionAmount) ||
      allowanceAmount < 0 ||
      deductionAmount < 0
    ) {
      return res.status(400).json({
        message: 'Invalid payroll details'
      });
    }

    client = await pool.connect();

    await client.query('BEGIN');
    transactionStarted = true;

    // Allow both Active and On Leave employees.
    const { rows: employees } = await client.query(
      `SELECT base_salary
       FROM employees
       WHERE emp_id = $1
         AND employment_status IN ('Active', 'On Leave')
       FOR UPDATE`,
      [employeeId]
    );

    if (employees.length === 0) {
      await client.query('ROLLBACK');
      transactionStarted = false;

      return res.status(404).json({
        message: 'Eligible employee not found'
      });
    }

    const basicSalary = Number(employees[0].base_salary);

    if (basicSalary + allowanceAmount < deductionAmount) {
      await client.query('ROLLBACK');
      transactionStarted = false;

      return res.status(400).json({
        message: 'Deductions cannot exceed total salary'
      });
    }

    const { rows } = await client.query(
      `INSERT INTO payroll
       (emp_id, payroll_month, basic_salary, allowances, deductions)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING payroll_id`,
      [
        employeeId,
        payroll_month,
        basicSalary,
        allowanceAmount,
        deductionAmount
      ]
    );

    await client.query('COMMIT');
    transactionStarted = false;

    res.status(201).json({
      payroll_id: rows[0].payroll_id,
      message: 'Payroll generated successfully'
    });

  } catch (err) {
    if (transactionStarted && client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Payroll rollback failed:', rollbackError.message);
      }
    }

    next(err);
  } finally {
    if (client) {
      client.release();
    }
  }
});

// PATCH: Update payroll payment status.
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { payment_status } = req.body;
    const payrollId = Number(req.params.id);

    if (!Number.isInteger(payrollId) || payrollId <= 0) {
      return res.status(400).json({
        message: 'Invalid payroll ID'
      });
    }

    if (!['Paid', 'Failed', 'Pending'].includes(payment_status)) {
      return res.status(400).json({
        message: 'Invalid payment status'
      });
    }

    const { rows } = await pool.query(
      `UPDATE payroll
       SET payment_status = $1,
           payment_date = CASE
             WHEN $1 = 'Paid' THEN CURRENT_DATE
             ELSE NULL
           END
       WHERE payroll_id = $2
       RETURNING payroll_id`,
      [payment_status, payrollId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Payroll record not found'
      });
    }

    res.json({
      message: 'Payroll status updated successfully'
    });

  } catch (err) {
    next(err);
  }
});

export default router;
