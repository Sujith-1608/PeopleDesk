import { Router } from 'express';
import pool from '../db.js';
const router=Router();
router.get('/',async(_req,res,next)=>{
  try{
    const [rows]=await pool.query(`SELECT l.*,CONCAT(e.first_name,' ',e.last_name) employee_name
      FROM Leave_Requests l JOIN Employees e ON e.emp_id=l.emp_id
      ORDER BY l.applied_on DESC,l.leave_id DESC`);
    res.json(rows);
  }catch(err){next(err);}
});
router.post('/',async(req,res,next)=>{
  try{
    const {emp_id,leave_type,start_date,end_date,reason}=req.body;
    if(!emp_id||!leave_type||!start_date||!end_date) return res.status(400).json({message:'Please complete required leave fields'});
    const [r]=await pool.execute(`INSERT INTO Leave_Requests(emp_id,leave_type,start_date,end_date,reason)
      VALUES(?,?,?,?,?)`,[emp_id,leave_type,start_date,end_date,reason||null]);
    res.status(201).json({leave_id:r.insertId,message:'Leave request submitted'});
  }catch(err){next(err);}
});
router.patch('/:id/status',async(req,res,next)=>{
  try{
    const {leave_status}=req.body;
    if(!['Approved','Rejected'].includes(leave_status)) return res.status(400).json({message:'Status must be Approved or Rejected'});
    const [r]=await pool.execute(`UPDATE Leave_Requests SET leave_status=?,reviewed_at=NOW()
      WHERE leave_id=? AND leave_status='Pending'`,[leave_status,req.params.id]);
    if(!r.affectedRows) return res.status(404).json({message:'Pending leave request not found'});
    res.json({message:`Leave ${leave_status.toLowerCase()}`});
  }catch(err){next(err);}
});
export default router;
