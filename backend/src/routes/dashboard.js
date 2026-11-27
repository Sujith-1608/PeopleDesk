import { Router } from 'express';
import pool from '../db.js';
const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const [[employees]] = await pool.query("SELECT COUNT(*) AS total FROM Employees");
    const [[active]] = await pool.query("SELECT COUNT(*) AS total FROM Employees WHERE employment_status='Active'");
    const [[departments]] = await pool.query("SELECT COUNT(*) AS total FROM Departments");
    const [[pendingLeaves]] = await pool.query("SELECT COUNT(*) AS total FROM Leave_Requests WHERE leave_status='Pending'");
    const [[payroll]] = await pool.query(
      "SELECT COALESCE(SUM(net_salary),0) AS total FROM Payroll WHERE payroll_month = DATE_FORMAT(CURRENT_DATE,'%Y-%m-01')"
    );
    const [recent] = await pool.query(`
      SELECT e.emp_id, CONCAT(e.first_name,' ',e.last_name) AS employee_name,
             d.department_name, e.base_salary, e.employment_status
      FROM Employees e JOIN Departments d ON d.department_id=e.department_id
      ORDER BY e.created_at DESC LIMIT 5
    `);
    res.json({
      stats: {
        employees: employees.total, activeEmployees: active.total,
        departments: departments.total, pendingLeaves: pendingLeaves.total,
        currentMonthPayroll: payroll.total
      },
      recentEmployees: recent
    });
  } catch (err) { next(err); }
});
export default router;
