import React, { useState } from 'react';

export default function CondicionesEntregaInput({ value = [], onChange, disabled }) {
  const [input, setInput] = useState('');

  const [error, setError] = useState('');
  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) {
      setError('No puedes agregar una condición vacía');
      return;
    }
    if (value.some(v => v.toLowerCase() === trimmed.toLowerCase())) {
      setError('Esta condición ya fue agregada');
      return;
    }
    onChange([...value, trimmed]);
    setInput('');
    setError('');
  };

  const handleRemove = (idx) => {
    const newArr = value.filter((_, i) => i !== idx);
    onChange(newArr);
  };

  return (
    <div className="mb-3">
      <label className="form-label fw-bold fs-6" style={{color:'#0A2E5A'}}>Condiciones de Entrega <span className="fw-normal text-secondary">(opcional, puedes agregar varias)</span></label>
      <div className="input-group mb-2">
        <input
          type="text"
          className="form-control"
          placeholder="Ej: El producto debe estar empacado en caja original"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => (e.key === 'Enter' ? handleAdd() : undefined)}
          disabled={disabled}
        />
        <button
          className="btn fw-bold"
          style={{background:'#0A2E5A', color:'white', borderRadius:10, marginLeft:4}}
          type="button"
          onClick={handleAdd}
          disabled={disabled || !input.trim()}
        >
          <i className="bi bi-plus-circle me-1"></i>Agregar
        </button>
      </div>
      {error && (
        <div className="alert alert-warning py-2 mb-2 d-flex align-items-center gap-2" style={{fontSize:'0.97rem'}}>
          <i className="bi bi-exclamation-circle-fill me-1"></i> {error}
        </div>
      )}
      <ul className="list-group mb-2">
        {value.map((cond, idx) => (
          <li key={idx} className="list-group-item d-flex justify-content-between align-items-center px-2 py-2" style={{border:'none', background:'#f2f6fa', borderRadius:8, marginBottom:4}}>
            <span style={{color:'#0A2E5A', fontWeight:500}}>
              <i className="bi bi-check2-circle text-success me-2"></i>{cond}
            </span>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger ms-2"
              style={{borderRadius:8, fontSize:14, padding:'2px 10px'}}
              onClick={() => handleRemove(idx)}
              disabled={disabled}
            >
              <i className="bi bi-x"></i>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
