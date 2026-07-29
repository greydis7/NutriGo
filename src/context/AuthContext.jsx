import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }){
  const [user, setUser] = useState(()=>{
    try{ return JSON.parse(localStorage.getItem('user')) }catch{ return null }
  })
  const [token, setToken] = useState(()=> localStorage.getItem('token') || null)
  const base = import.meta.env.VITE_API_URL || ''

  useEffect(()=>{
    if(user) localStorage.setItem('user', JSON.stringify(user))
    else localStorage.removeItem('user')
  },[user])

  useEffect(()=>{
    if(token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  },[token])

  async function register({ name, email, password }){
    try{
      const res = await fetch(`${base}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })
      const data = await res.json()
      if(!res.ok) throw new Error(data.message || 'Registro fallido')
      setUser(data.user || { name, email })
      setToken(data.token || '')
      return { ok: true, data }
    }catch(err){
      return { ok: false, message: err.message }
    }
  }

  async function login({ email, password }){
    try{
      const res = await fetch(`${base}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if(!res.ok) throw new Error(data.message || 'Login fallido')
      setUser(data.user || { email })
      setToken(data.token || '')
      return { ok: true, data }
    }catch(err){
      return { ok: false, message: err.message }
    }
  }

  function logout(){
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(){
  return useContext(AuthContext)
}

export default AuthProvider
