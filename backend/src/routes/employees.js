
import { Router } from 'express';
import pool from '../db-postgres.js';

const router = Router();

// GET all employees with search
router.get('/', async (req, res, next) => {
  try {
    const q = `%${req.query.search || ''}%`;

    const { rows } = await pool.query(
      `SELECT e.*, d.department_name, j.job_title
       FROM employees e
       JOIN departments d ON d.department_id = e.department_id
       JOIN jobs j ON j.job_id = e.job_id
       WHERE e.first_name ILIKE $1
          OR e.last_name ILIKE $1
          OR e.email ILIKE $1
       ORDER BY e.emp_id DESC`,
      [q]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET employee by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM employees WHERE emp_id = $1',
      [req.params.id]
    );

    if (!rows[0]) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// CREATE employee
router.post('/', async (req, res, next) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      hire_date,
      department_id,
      job_id,
      base_salary,
      employment_status = 'Active'
    } = req.body;

    if (
      !first_name || !last_name || !email || !hire_date ||
      !department_id || !job_id || base_salary === undefined
    ) {
      return res.status(400).json({
        message: 'Please provide all required employee fields'
      });
    }

    const result = await pool.query(
      `INSERT INTO employees
       (first_name, last_name, email, phone, hire_date,
        department_id, job_id, base_salary, employment_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING emp_id`,
      [
        first_name, last_name, email, phone || null,
        hire_date, department_id, job_id,
        base_salary, employment_status
      ]
    );

    res.status(201).json({
      emp_id: result.rows[0].emp_id,
      message: 'Employee created'
    });
  } catch (err) {
    next(err);
  }
});

// UPDATE employee
router.put('/:id', async (req, res, next) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      hire_date,
      department_id,
      job_id,
      base_salary,
      employment_status
    } = req.body;

    const result = await pool.query(
      `UPDATE employees
       SET first_name = $1,
           last_name = $2,
           email = $3,
           phone = $4,
           hire_date = $5,
           department_id = $6,
           job_id = $7,
           base_salary = $8,
           employment_status = $9
       WHERE emp_id = $10`,
      [
        first_name, last_name, email, phone || null,
        hire_date, department_id, job_id,
        base_salary, employment_status, req.params.id
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ message: 'Employee updated' });
  } catch (err) {
    next(err);
  }
});

// DELETE employee
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(
      'DELETE FROM employees WHERE emp_id = $1',
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ message: 'Employee deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
