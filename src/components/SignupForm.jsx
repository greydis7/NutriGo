import React, { useState } from 'react'
import { sanitize, hashString } from '../utils/sanitize'

function onlyLettersAndSpaces(str){
  return /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(str)
}

function strictEmail(str){
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(str)
}

function formatRUT(value){
  if(!value) return ''
  // remove non numbers and K/k
  const v = value.replace(/[^0-9kK]/g,'')
  const body = v.slice(0, -1)
  const dv = v.slice(-1)
  let rev = body.split('').reverse().join('')
  let formatted = ''
  for(let i=0;i<rev.length;i++){
    if(i!==0 && i%3===0) formatted = '.' + formatted
    formatted = rev[i] + formatted
  }
  if(v.length>0) return formatted + '-' + dv.toUpperCase()
  return ''
}

function validateRut(fullRut){
  if(!fullRut) return false
  const rut = fullRut.replace(/\./g,'').replace(/-/g,'')
  const body = rut.slice(0,-1)
  let dv = rut.slice(-1).toUpperCase()
  let sum = 0
  let mul = 2
  for(let i=body.length-1;i>=0;i--){
    sum += parseInt(body.charAt(i),10)*mul
    mul = mul === 7 ? 2 : mul + 1
  }
  const res = 11 - (sum % 11)
  const dvExpected = res === 11 ? '0' : res === 10 ? 'K' : String(res)
  return dv === dvExpected
}

export default function SignupForm({ onRegister, handleValidacion, onClose }){
  const [form, setForm] = useState({ name: '', email: '', rut: '', password: '' })
  const [error, setError] = useState('')

  const onChange = (e) => {
    const { name, value } = e.target
    if(name === 'rut'){
      const formatted = formatRUT(value)
      setForm((f) => ({ ...f, rut: sanitize(formatted) }))
    } else {
      setForm((f) => ({ ...f, [name]: sanitize(value) }))
    }
  }

  const onInputRut = (e) => {
    const { value } = e.target
    const formatted = formatRUT(value)
    e.target.value = formatted
    setForm((f) => ({ ...f, rut: sanitize(formatted) }))
  }

  const validateLocal = () => {
    // Nombre: min 3 y solo letras
    if(!form.name || form.name.trim().length < 3 || !onlyLettersAndSpaces(form.name)) return { ok:false, message:'Nombre inválido. Mínimo 3 letras, solo letras y espacios.' }
    if(!form.email || !strictEmail(form.email)) return { ok:false, message:'Email inválido.' }
    if(!form.rut || !validateRut(form.rut)) return { ok:false, message:'RUT inválido. Formato esperado XX.XXX.XXX-X' }
    // Contraseña: min8, 1 uppercase, 1 number, 1 symbol
    if(!form.password || !/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(form.password)) return { ok:false, message:'Contraseña débil. Mínimo 8 caracteres, 1 mayúscula, 1 número, 1 símbolo.' }
    return { ok:true }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const local = validateLocal()
    if(!local.ok){ setError(local.message); return }
    const v = handleValidacion ? handleValidacion(form) : { ok:true }
    if(!v.ok){ setError(v.message); return }
    const hashed = await hashString(form.password)
    const user = { name: form.name.trim(), email: form.email.trim(), rut: form.rut.trim(), passwordHash: hashed }
    onRegister(user)
    setForm({ name:'', email:'', rut:'', password:'' })
    setError('')
    if(onClose) onClose()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" aria-label="Formulario de registro">
      <div>
        <label htmlFor="name" className="block font-medium">Nombre</label>
        <input id="name" name="name" value={form.name} onChange={onChange} placeholder="Nombre completo (mín. 3 letras)" className="input-field" required />
      </div>

      <div>
        <label htmlFor="email" className="block font-medium">Email</label>
        <input id="email" name="email" type="email" value={form.email} onChange={onChange} placeholder="example@dominio.com" className="input-field" required />
      </div>

      <div>
        <label htmlFor="rut" className="block font-medium">RUT / ID</label>
        <input id="rut" name="rut" value={form.rut} onChange={onChange} onInput={onInputRut} placeholder="Ingresa tu RUT con puntos y guion" className="input-field" />
      </div>

      <div>
        <label htmlFor="password" className="block font-medium">Contraseña</label>
        <input id="password" name="password" type="password" value={form.password} onChange={onChange} placeholder="Mínimo 8 caracteres, 1 mayúscula, 1 número, 1 símbolo" className="input-field" required />
      </div>

      {error && <div role="alert" className="text-red-600">{error}</div>}

      <div className="flex items-center justify-end">
        <button type="submit" className="btn-primary">Registrarse</button>
      </div>
    </form>
  )
}
