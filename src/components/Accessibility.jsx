import React, { useState } from 'react'

export default function Accessibility({ theme, setTheme, textScale, setTextScale }){
  const [open, setOpen] = useState(false)

  const increase = () => setTextScale((s) => (s === 'text-base' ? 'text-lg' : s === 'text-lg' ? 'text-2xl' : 'text-2xl'))
  const decrease = () => setTextScale((s) => (s === 'text-2xl' ? 'text-lg' : s === 'text-lg' ? 'text-base' : 'text-base'))

  return (
    <div>
      <button
        aria-label="Accesibilidad"
        className="accessibility-fab"
        onClick={() => setOpen((o) => !o)}
      >
        ♿
      </button>

      {open && (
        <aside className="accessibility-panel" role="region" aria-label="Panel de accesibilidad">
          <h3 className="font-bold">Accesibilidad</h3>
          <div className="controls">
            <button onClick={decrease} aria-label="Disminuir" title="Disminuir">-</button>
            <button onClick={increase} aria-label="Agrandar" title="Agrandar">+</button>
          </div>
        </aside>
      )}
    </div>
  )
}
