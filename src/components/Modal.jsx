import React, { useEffect } from 'react'

export default function Modal({isOpen, onClose, title, children}){
  useEffect(()=>{
    function onKey(e){ if(e.key==='Escape') onClose(); }
    if(isOpen) document.addEventListener('keydown', onKey);
    return ()=> document.removeEventListener('keydown', onKey);
  },[isOpen,onClose])

  if(!isOpen) return null
  return (
    <div className="modal active" role="dialog" aria-modal="true">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose} aria-label="Cerrar modal">&times;</button>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  )
}
