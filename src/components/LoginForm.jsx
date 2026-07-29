import React, { useState } from 'react'
import { sanitize, hashString } from '../utils/sanitize'

export default function LoginForm({ onLogin, handleValidacion, onClose }){
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: sanitize(value) }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const v = handleValidacion(form)
    if(!v.ok){ setError(v.message); return }
    const hashed = await hashString(form.password)
    const res = onLogin({ email: form.email, passwordHash: hashed })
    if(res && res.ok){ setForm({ email:'', password:'' }); setError(''); if(onClose) onClose() }
    else setError(res.message || 'Credenciales inválidas')
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" aria-label="Formulario de login">
      <div>
        <label htmlFor="email" className="block font-medium">Email</label>
        <input id="email" name="email" type="email" value={form.email} onChange={onChange} className="input-field" required />
      </div>

      <div>
        <label htmlFor="password" className="block font-medium">Contraseña</label>
        <input id="password" name="password" type="password" value={form.password} onChange={onChange} className="input-field" required />
      </div>

      {error && <div role="alert" className="text-red-600">{error}</div>}

      <div className="flex items-center justify-end">
        <button type="submit" className="btn-primary">Ingresar</button>
      </div>
    </form>
  )
}
