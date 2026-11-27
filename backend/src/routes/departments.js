import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET: Fetch all departments with employee counts.
router.get('/', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        d.*,
        COUNT(e.emp_id) AS employee_count
      FROM Departments d
      LEFT JOIN Employees e
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

    const [result] = await pool.execute(
      `INSERT INTO Departments (department_name, location)
       VALUES (?, ?)`,
      [department_name.trim(), location?.trim() || null]
    );

    res.status(201).json({
      department_id: result.insertId,
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

    const [result] = await pool.execute(
      `UPDATE Departments
       SET department_name = ?, location = ?
       WHERE department_id = ?`,
      [
        department_name.trim(),
        location?.trim() || null,
        departmentId
      ]
    );

    if (result.affectedRows === 0) {
      const [existing] = await pool.execute(
        'SELECT department_id FROM Departments WHERE department_id = ?',
        [departmentId]
      );

      if (existing.length === 0) {
        return res.status(404).json({
          message: 'Department not found'
        });
      }
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

    const [departments] = await pool.execute(
      'SELECT department_id FROM Departments WHERE department_id = ?',
      [departmentId]
    );

    if (departments.length === 0) {
      return res.status(404).json({
        message: 'Department not found'
      });
    }

    const [employees] = await pool.execute(
      'SELECT COUNT(*) AS employee_count FROM Employees WHERE department_id = ?',
      [departmentId]
    );

    if (employees[0].employee_count > 0) {
      return res.status(409).json({
        message: 'Cannot delete a department that has employees'
      });
    }

    await pool.execute(
      'DELETE FROM Departments WHERE department_id = ?',
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
