import React from "react";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api,setSession } from '../api';
import { Field } from '../components/UI';
import { LockKeyhole, UsersRound } from 'lucide-react';
export default function Login(){
  const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const navigate=useNavigate();
  async function submit(e){e.preventDefault();setBusy(true);setError('');try{const result=await api('/auth/login',{method:'POST',body:JSON.stringify({email,password})});setSession(result.token,result.user);navigate('/');}catch(err){setError(err.message)}finally{setBusy(false)}}
  return <div className="login-page"><div className="login-art"><div className="brand light"><div className="brand-mark">P</div><div><b>PeopleDesk</b><small>PEOPLE OPERATIONS</small></div></div><div className="art-copy"><div className="eyebrow">ONE WORKSPACE. EVERYONE CONNECTED.</div><h1>Make people<br/>operations feel<br/><em>effortless.</em></h1><p>A clearer view of your people, attendance and payroll—so you can focus on the work that matters.</p><div className="art-stat"><UsersRound/><span><b>People first.</b><small>Simple tools for growing teams.</small></span></div></div><div className="art-footer">EMPLOYEE & PAYROLL MANAGEMENT</div></div><div className="login-panel"><form className="login-form" onSubmit={submit}><div className="login-icon"><LockKeyhole/></div><div className="eyebrow">WELCOME BACK</div><h2>Sign in to PeopleDesk</h2><p>Enter your account details to continue.</p>{error&&<div className="notice error">{error}</div>}<Field label="Email address"><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></Field><Field label="Password"><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></Field><button className="btn primary full" disabled={busy}>{busy?'Signing in…':'Sign in'} <span>→</span></button><div className="demo-hint">Use the administrator account you created during setup.</div></form></div></div>
}
