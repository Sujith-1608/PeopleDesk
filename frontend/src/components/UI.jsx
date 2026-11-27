import React from "react";
import { useEffect, useState } from 'react';
export function PageHeader({eyebrow,title,description,action}){return <div className="page-header"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action}</div>}
export function Card({children,className=''}){return <section className={`card ${className}`}>{children}</section>}
export function Table({columns,rows,empty='No records found.'}){return <div className="table-wrap"><table><thead><tr>{columns.map(c=><th key={c.key}>{c.label}</th>)}</tr></thead><tbody>{rows.length?rows.map((row,i)=><tr key={row.id??row.emp_id??row.payroll_id??row.leave_id??row.attendance_id??i}>{columns.map(c=><td key={c.key}>{c.render?c.render(row):row[c.key]??'—'}</td>)}</tr>):<tr><td colSpan={columns.length} className="empty">{empty}</td></tr>}</tbody></table></div>}
export function Modal({title,onClose,children}){useEffect(()=>{function esc(e){if(e.key==='Escape')onClose();}window.addEventListener('keydown',esc);return()=>window.removeEventListener('keydown',esc)},[onClose]);return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><div className="modal"><div className="modal-head"><h2>{title}</h2><button className="icon-button" onClick={onClose}>×</button></div>{children}</div></div>}
export function Field({label,children}){return <label className="field"><span>{label}</span>{children}</label>}
export function useLoad(loader,deps=[]){const [data,setData]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState('');async function refresh(){try{setLoading(true);setError('');setData(await loader());}catch(e){setError(e.message)}finally{setLoading(false)}}useEffect(()=>{refresh()},deps);return {data,setData,loading,error,refresh};}
export function Notice({error}){return error?<div className="notice error">{error}</div>:null}
export function money(value){return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(Number(value||0));}
export function date(value){return value?String(value).slice(0,10):'—';}
export function Status({value}){const cls=String(value||'').toLowerCase().replaceAll(' ','-');return <span className={`status-pill ${cls}`}>{value}</span>}
