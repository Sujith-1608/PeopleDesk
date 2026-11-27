
import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET: Fetch all payroll records.
router.get('/', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.*,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name
      FROM Payroll p
      JOIN Employees e ON e.emp_id = p.emp_id
      ORDER BY p.payroll_month DESC, p.payroll_id DESC
    `);

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST: Generate payroll.
router.post('/', async (req, res, next) => {
  const conn = await pool.getConnection();
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

    await conn.beginTransaction();
    transactionStarted = true;

    // Allow both Active and On Leave employees.
    const [employees] = await conn.execute(
      `SELECT base_salary
       FROM Employees
       WHERE emp_id = ?
       AND employment_status IN ('Active', 'On Leave')
       FOR UPDATE`,
      [employeeId]
    );

    if (employees.length === 0) {
      await conn.rollback();
      transactionStarted = false;

      return res.status(404).json({
        message: 'Eligible employee not found'
      });
    }

    const basicSalary = Number(employees[0].base_salary);

    if (basicSalary + allowanceAmount < deductionAmount) {
      await conn.rollback();
      transactionStarted = false;

      return res.status(400).json({
        message: 'Deductions cannot exceed total salary'
      });
    }

    const [result] = await conn.execute(
      `INSERT INTO Payroll
       (emp_id, payroll_month, basic_salary, allowances, deductions)
       VALUES (?, ?, ?, ?, ?)`,
      [
        employeeId,
        payroll_month,
        basicSalary,
        allowanceAmount,
        deductionAmount
      ]
    );

    await conn.commit();
    transactionStarted = false;

    res.status(201).json({
      payroll_id: result.insertId,
      message: 'Payroll generated successfully'
    });

  } catch (err) {
    if (transactionStarted) {
      await conn.rollback();
    }

    next(err);
  } finally {
    conn.release();
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

    const paymentDate =
      payment_status === 'Paid'
        ? new Date().toISOString().slice(0, 10)
        : null;

    const [result] = await pool.execute(
      `UPDATE Payroll
       SET payment_status = ?, payment_date = ?
       WHERE payroll_id = ?`,
      [payment_status, paymentDate, payrollId]
    );

    if (result.affectedRows === 0) {
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
