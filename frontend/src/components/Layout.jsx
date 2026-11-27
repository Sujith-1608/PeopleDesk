import React from "react";
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, Clock3, CalendarDays, Wallet, LogOut, BriefcaseBusiness } from 'lucide-react';
import { clearSession, getUser } from '../api';

const links=[
  {to:'/',label:'Overview',icon:LayoutDashboard},
  {to:'/employees',label:'Employees',icon:Users},
  {to:'/departments',label:'Departments',icon:Building2},
  {to:'/attendance',label:'Attendance',icon:Clock3},
  {to:'/leaves',label:'Leave requests',icon:CalendarDays},
  {to:'/payroll',label:'Payroll',icon:Wallet}
];
export default function Layout(){
  const navigate=useNavigate(); const user=getUser();
  function logout(){clearSession();navigate('/login');}
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">P</div><div><b>PeopleDesk</b><small>PEOPLE OPERATIONS</small></div></div>
      <div className="nav-label">WORKSPACE</div>
      <nav>{links.map(({to,label,icon:Icon})=><NavLink key={to} to={to} end={to==='/'} className={({isActive})=>isActive?'nav-link active':'nav-link'}><Icon size={18}/><span>{label}</span></NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="profile"><div className="avatar">{(user?.name||'A').slice(0,1).toUpperCase()}</div><div className="profile-text"><b>{user?.name||'Administrator'}</b><small>{user?.role||'admin'}</small></div><button className="icon-button" onClick={logout} title="Sign out"><LogOut size={17}/></button></div></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <b>Management</b></div><div className="top-user"><span className="status-dot"></span> System online</div></header>
      <div className="page-content"><Outlet /></div>
    </main>
  </div>;
}
