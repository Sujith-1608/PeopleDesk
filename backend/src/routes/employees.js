import { Router } from 'express';
import pool from '../db.js';
const router = Router();

router.get('/', async (req,res,next) => {
  try {
    const q = `%${req.query.search || ''}%`;
    const [rows] = await pool.execute(`
      SELECT e.*, d.department_name, j.job_title
      FROM Employees e
      JOIN Departments d ON d.department_id=e.department_id
      JOIN Jobs j ON j.job_id=e.job_id
      WHERE e.first_name LIKE ? OR e.last_name LIKE ? OR e.email LIKE ?
      ORDER BY e.emp_id DESC`, [q,q,q]);
    res.json(rows);
  } catch(err){ next(err); }
});

router.get('/:id', async (req,res,next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM Employees WHERE emp_id=?',[req.params.id]);
    if(!rows[0]) return res.status(404).json({message:'Employee not found'});
    res.json(rows[0]);
  } catch(err){ next(err); }
});

router.post('/', async (req,res,next) => {
  try {
    const {first_name,last_name,email,phone,hire_date,department_id,job_id,base_salary,employment_status='Active'}=req.body;
    if(!first_name||!last_name||!email||!hire_date||!department_id||!job_id||base_salary===undefined)
      return res.status(400).json({message:'Please provide all required employee fields'});
    const [result]=await pool.execute(
      `INSERT INTO Employees(first_name,last_name,email,phone,hire_date,department_id,job_id,base_salary,employment_status)
       VALUES(?,?,?,?,?,?,?,?,?)`,
      [first_name,last_name,email,phone||null,hire_date,department_id,job_id,base_salary,employment_status]
    );
    res.status(201).json({emp_id:result.insertId,message:'Employee created'});
  } catch(err){ next(err); }
});

router.put('/:id', async (req,res,next) => {
  try {
    const {first_name,last_name,email,phone,hire_date,department_id,job_id,base_salary,employment_status}=req.body;
    const [result]=await pool.execute(
      `UPDATE Employees SET first_name=?,last_name=?,email=?,phone=?,hire_date=?,
       department_id=?,job_id=?,base_salary=?,employment_status=? WHERE emp_id=?`,
      [first_name,last_name,email,phone||null,hire_date,department_id,job_id,base_salary,employment_status,req.params.id]
    );
    if(!result.affectedRows) return res.status(404).json({message:'Employee not found'});
    res.json({message:'Employee updated'});
  } catch(err){ next(err); }
});

router.delete('/:id', async (req,res,next) => {
  try {
    const [result]=await pool.execute('DELETE FROM Employees WHERE emp_id=?',[req.params.id]);
    if(!result.affectedRows) return res.status(404).json({message:'Employee not found'});
    res.json({message:'Employee deleted'});
  } catch(err){ next(err); }
});
export default router;
