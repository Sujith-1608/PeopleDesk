import { Router } from 'express';
import pool from '../db.js';
const router=Router();
router.get('/',async(req,res,next)=>{
  try{
    const [rows]=await pool.execute(`SELECT a.*,CONCAT(e.first_name,' ',e.last_name) employee_name
      FROM Attendance a JOIN Employees e ON e.emp_id=a.emp_id
      WHERE (? IS NULL OR a.attendance_date=?) ORDER BY a.attendance_date DESC,a.attendance_id DESC LIMIT 200`,
      [req.query.date||null,req.query.date||null]);
    res.json(rows);
  }catch(err){next(err);}
});
router.post('/',async(req,res,next)=>{
  try{
    const {emp_id,attendance_date,check_in,check_out,attendance_status}=req.body;
    if(!emp_id||!attendance_date||!attendance_status) return res.status(400).json({message:'Employee, date and status are required'});
    const [r]=await pool.execute(`INSERT INTO Attendance(emp_id,attendance_date,check_in,check_out,attendance_status)
      VALUES(?,?,?,?,?)`,[emp_id,attendance_date,check_in||null,check_out||null,attendance_status]);
    res.status(201).json({attendance_id:r.insertId,message:'Attendance saved'});
  }catch(err){next(err);}
});
export default router;
