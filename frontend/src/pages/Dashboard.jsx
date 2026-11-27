import React from "react";
import { useLoad,PageHeader,Card,money,Table,Status } from '../components/UI';
import { api } from '../api';
import { Users, UserCheck, Building2, CalendarClock, Wallet, ArrowUpRight } from 'lucide-react';
const icons=[Users,UserCheck,Building2,CalendarClock,Wallet];
export default function Dashboard(){
 const {data,error,loading}=useLoad(()=>api('/dashboard'));
 const stats=data.stats||{};
 const cards=[
  ['Total employees',stats.employees||0,'Across your organization'],
  ['Active employees',stats.activeEmployees||0,'Currently on the team'],
  ['Departments',stats.departments||0,'Organizational units'],
  ['Pending leave',stats.pendingLeaves||0,'Awaiting review'],
  ['Current month payroll',money(stats.currentMonthPayroll),'Total net payroll']
 ];
 return <><PageHeader eyebrow="OVERVIEW" title="Good day, welcome back" description="Here’s what’s happening across your organization today."/><div className="stat-grid">{cards.map(([label,value,sub],i)=>{const Icon=icons[i];return <Card className="stat-card" key={label}><div className="stat-top"><span>{label}</span><div className="stat-icon"><Icon size={18}/></div></div><div className="stat-value">{loading?'—':value}</div><div className="stat-sub">{sub}</div></Card>})}</div>{error&&<div className="notice error">{error}</div>}<div className="section-heading"><div><h2>Recently added employees</h2><p>Your latest team members</p></div><a href="/employees" className="text-link">View all <ArrowUpRight size={15}/></a></div><Card><Table columns={[{key:'emp_id',label:'ID'},{key:'employee_name',label:'Employee'},{key:'department_name',label:'Department'},{key:'base_salary',label:'Base salary',render:r=>money(r.base_salary)},{key:'employment_status',label:'Status',render:r=><Status value={r.employment_status}/> }]} rows={data.recentEmployees||[]}/></Card></>;
}
