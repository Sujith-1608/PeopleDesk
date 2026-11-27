import React from "react";
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Departments from './pages/Departments';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import Payroll from './pages/Payroll';
import { getToken } from './api';

function Protected(){return getToken()?<Layout/>:<Navigate to="/login" replace/>;}
export default function App(){
 return <Routes>
  <Route path="/login" element={getToken()?<Navigate to="/" replace/>:<Login/>}/>
  <Route element={<Protected/>}>
   <Route path="/" element={<Dashboard/>}/>
   <Route path="/employees" element={<Employees/>}/>
   <Route path="/departments" element={<Departments/>}/>
   <Route path="/attendance" element={<Attendance/>}/>
   <Route path="/leaves" element={<Leaves/>}/>
   <Route path="/payroll" element={<Payroll/>}/>
  </Route>
  <Route path="*" element={<Navigate to="/" replace/>}/>
 </Routes>;
}
