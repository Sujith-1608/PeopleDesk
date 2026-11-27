import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import pool from './db.js';
import { authenticate } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import employeeRoutes from './routes/employees.js';
import departmentRoutes from './routes/departments.js';
import attendanceRoutes from './routes/attendance.js';
import leaveRoutes from './routes/leaves.js';
import payrollRoutes from './routes/payroll.js';
import referenceRoutes from './routes/reference.js';

dotenv.config();
const app=express();
app.use(helmet());
const allowed=(process.env.CLIENT_ORIGIN||'http://localhost:5173').split(',').map(s=>s.trim());
app.use(cors({origin:(origin,cb)=>{
  if(!origin||allowed.includes(origin)) return cb(null,true);
  return cb(new Error('Origin not allowed by CORS'));
}}));
app.use(express.json({limit:'1mb'}));

app.get('/api/health',async(_req,res)=>{
  try{await pool.query('SELECT 1');res.json({status:'ok',database:'connected'});}
  catch{res.status(503).json({status:'error',database:'disconnected'});}
});
app.use('/api/auth',authRoutes);
app.use('/api',authenticate);
app.use('/api/dashboard',dashboardRoutes);
app.use('/api/employees',employeeRoutes);
app.use('/api/departments',departmentRoutes);
app.use('/api/attendance',attendanceRoutes);
app.use('/api/leaves',leaveRoutes);
app.use('/api/payroll',payrollRoutes);
app.use('/api/reference',referenceRoutes);

app.use((err,_req,res,_next)=>{
  console.error(err);
  if(err.code==='ER_DUP_ENTRY') return res.status(409).json({message:'A record with these unique values already exists'});
  if(err.code==='ER_NO_REFERENCED_ROW_2') return res.status(400).json({message:'Referenced employee, department or job does not exist'});
  if(err.code==='ER_ROW_IS_REFERENCED_2') return res.status(409).json({message:'This record is linked to other records and cannot be deleted'});
  res.status(500).json({message:process.env.NODE_ENV==='production'?'Something went wrong':err.message});
});
const port=Number(process.env.PORT||5000);
app.listen(port,()=>console.log(`API listening on port ${port}`));
