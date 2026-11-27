
import { Router } from 'express';
import pool from '../db-postgres.js';

const router = Router();

// GET: Fetch all departments with employee counts.
router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        d.*,
        COUNT(e.emp_id)::int AS employee_count
      FROM departments d
      LEFT JOIN employees e
        ON e.department_id = d.department_id
      GROUP BY d.department_id
      ORDER BY d.department_name
    `);

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST: Create a new department.
router.post('/', async (req, res, next) => {
  try {
    const { department_name, location } = req.body;

    if (!department_name?.trim()) {
      return res.status(400).json({
        message: 'Department name is required'
      });
    }

    const { rows } = await pool.query(
      `INSERT INTO departments (department_name, location)
       VALUES ($1, $2)
       RETURNING department_id`,
      [
        department_name.trim(),
        location?.trim() || null
      ]
    );

    res.status(201).json({
      department_id: rows[0].department_id,
      message: 'Department created'
    });
  } catch (err) {
    next(err);
  }
});

// PUT: Update an existing department.
router.put('/:id', async (req, res, next) => {
  try {
    const departmentId = Number(req.params.id);
    const { department_name, location } = req.body;

    if (!Number.isInteger(departmentId) || departmentId <= 0) {
      return res.status(400).json({
        message: 'Invalid department ID'
      });
    }

    if (!department_name?.trim()) {
      return res.status(400).json({
        message: 'Department name is required'
      });
    }

    const result = await pool.query(
      `UPDATE departments
       SET department_name = $1,
           location = $2
       WHERE department_id = $3`,
      [
        department_name.trim(),
        location?.trim() || null,
        departmentId
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: 'Department not found'
      });
    }

    res.json({
      message: 'Department updated successfully'
    });
  } catch (err) {
    next(err);
  }
});

// DELETE: Delete a department only if it has no employees.
router.delete('/:id', async (req, res, next) => {
  try {
    const departmentId = Number(req.params.id);

    if (!Number.isInteger(departmentId) || departmentId <= 0) {
      return res.status(400).json({
        message: 'Invalid department ID'
      });
    }

    const { rows: departments } = await pool.query(
      'SELECT department_id FROM departments WHERE department_id = $1',
      [departmentId]
    );

    if (departments.length === 0) {
      return res.status(404).json({
        message: 'Department not found'
      });
    }

    const { rows: employees } = await pool.query(
      `SELECT COUNT(*)::int AS employee_count
       FROM employees
       WHERE department_id = $1`,
      [departmentId]
    );

    if (employees[0].employee_count > 0) {
      return res.status(409).json({
        message: 'Cannot delete a department that has employees'
      });
    }

    await pool.query(
      'DELETE FROM departments WHERE department_id = $1',
      [departmentId]
    );

    res.json({
      message: 'Department deleted successfully'
    });
  } catch (err) {
    next(err);
  }
});

export default router;
