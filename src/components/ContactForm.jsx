import React, { useState } from 'react'
import { sanitize } from '../utils/sanitize'

export default function ContactForm({ onSubmitContact }){
  const [form, setForm] = useState({ name:'', email:'', message:'' })
  const [error, setError] = useState('')

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: sanitize(value) }))
  }

  const submit = (e) => {
    e.preventDefault()
    if(!form.name || !form.email || !form.message){ setError('Por favor completa todos los campos'); return }
    // simple email check
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if(!re.test(form.email)){ setError('Email inválido'); return }
    setError('')
    if(onSubmitContact) onSubmitContact(form)
    setForm({ name:'', email:'', message:'' })
  }

  return (
    <form onSubmit={submit} className="space-y-4" aria-label="Formulario de contacto">
      <div>
        <label htmlFor="contact-name" className="block font-medium">Nombre</label>
        <input id="contact-name" name="name" value={form.name} onChange={onChange} className="input-field" required />
      </div>

      <div>
        <label htmlFor="contact-email" className="block font-medium">Email</label>
        <input id="contact-email" name="email" type="email" value={form.email} onChange={onChange} className="input-field" required />
      </div>

      <div>
        <label htmlFor="contact-message" className="block font-medium">Mensaje</label>
        <textarea id="contact-message" name="message" value={form.message} onChange={onChange} className="input-field h-24" required />
      </div>

      {error && <div role="alert" className="text-red-600">{error}</div>}

      <div className="flex items-center justify-end">
        <button type="submit" className="btn-primary">Enviar</button>
      </div>
    </form>
  )
}
