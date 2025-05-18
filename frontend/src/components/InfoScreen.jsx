import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function InfoScreen({
  title = 'Información',
  description = '',
  code = '',
  actions = [],
  onClose = null,
  icon = null,
  children
}) {
  const navigate = useNavigate();
  
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center w-100 min-vh-100 bg-light p-3" style={{minHeight: '100vh'}}>
      <div className="card shadow-lg border-0 animate__animated animate__fadeInDown animate__faster position-relative" style={{maxWidth: 420, minWidth: 270, borderRadius: 18}}>
        <button 
          className="btn-close position-absolute end-0 top-0 m-3" 
          style={{zIndex:2}} 
          onClick={handleClose} 
          aria-label="Cerrar" 
        />
        <div className="card-body d-flex flex-column align-items-center justify-content-center py-4 px-3">
          {icon && (
            <div className="mb-3 text-center" style={{fontSize:'3em', color:'#198754'}}>
              {icon}
            </div>
          )}
          <h2 className="mb-2 text-center fw-bold" style={{fontSize:'1.5em'}}>{title}</h2>
          {description && <div className="mb-3 text-secondary text-center" style={{fontSize:'1.08em'}}>{description}</div>}
          {code && (
            <div className="my-4 w-100">
              <label className="form-label d-block text-center mb-2 fw-bold">Código de Vinculación</label>
              <div className="input-group input-group-lg mb-2">
                <input 
                  type="text"
                  className="form-control text-center font-monospace fs-4 fw-bold border-primary"
                  value={code}
                  readOnly
                  style={{
                    letterSpacing: '0.5em',
                    backgroundColor: '#f8f9fa',
                    padding: '0.75rem 1rem'
                  }}
                />
                <button 
                  className="btn btn-primary" 
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(code);
                    alert('¡Código copiado al portapapeles!');
                  }}
                  title="Copiar código"
                >
                  <i className="bi bi-clipboard"></i>
                </button>
              </div>
              <p className="text-muted small text-center mb-0">
                Comparte este código con la contraparte para que pueda aceptar el contrato
              </p>
            </div>
          )}
          {children && <div className="w-100 mt-2 mb-2">{children}</div>}
          <div className="d-flex flex-column gap-2 mt-3 w-100">
            {actions.map((action, idx) => (
              <button
                key={idx}
                className={action.className || 'btn btn-primary btn-md'}
                onClick={action.onClick}
                style={{fontSize:'1.rem'}}
              >
                {action.icon && <span className="me-2">{action.icon}</span>}{action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
