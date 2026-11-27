const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function getToken(){ return localStorage.getItem('epms_token'); }
export function setSession(token,user){
  localStorage.setItem('epms_token',token);
  localStorage.setItem('epms_user',JSON.stringify(user));
}
export function clearSession(){
  localStorage.removeItem('epms_token');
  localStorage.removeItem('epms_user');
}
export function getUser(){
  try{return JSON.parse(localStorage.getItem('epms_user')||'null');}catch{return null;}
}
export async function api(path, options={}){
  const headers={'Content-Type':'application/json',...(options.headers||{})};
  const token=getToken();
  if(token) headers.Authorization=`Bearer ${token}`;
  const response=await fetch(`${API_URL}${path}`,{...options,headers});
  const data=await response.json().catch(()=>({}));
  if(response.status===401){clearSession(); if(location.pathname!=='/login') location.href='/login';}
  if(!response.ok) throw new Error(data.message||'Request failed');
  return data;
}
