import React from 'react';
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
  return (
    <div className="d-flex flex-column align-items-center justify-content-center w-100 min-vh-100 bg-light p-3" style={{minHeight: '100vh'}}>
      <div className="card shadow-lg border-0 animate__animated animate__fadeInDown animate__faster position-relative" style={{maxWidth: 420, minWidth: 270, borderRadius: 18}}>
        {onClose && (
          <button className="btn-close position-absolute end-0 top-0 m-3" style={{zIndex:2}} onClick={onClose} aria-label="Cerrar" />
        )}
        <div className="card-body d-flex flex-column align-items-center justify-content-center py-4 px-3">
          {icon && (
            <div className="mb-3 text-center" style={{fontSize:'3em', color:'#198754'}}>
              {icon}
            </div>
          )}
          <h2 className="mb-2 text-center fw-bold" style={{fontSize:'1.5em'}}>{title}</h2>
          {description && <div className="mb-3 text-secondary text-center" style={{fontSize:'1.08em'}}>{description}</div>}
          {code && (
            <div className="my-3 d-flex flex-column align-items-center">
              <span className="fw-bold text-primary border border-2 rounded px-4 py-2 shadow-sm bg-white" style={{fontSize:'2.2em',letterSpacfING:'0.22em'}}>{code}</span>
              <div className="small text-muted mt-2">Código de acceso</div>
            </div>
          )}
          {children && <div className="w-100 mt-2 mb-2">{children}</div>}
          <div className="d-flex flex-column gap-2 mt-3 w-100">
            {actions.map((action, idx) => (
              <button
                key={idx}
                className={action.className || 'btn btn-primary btn-lg'}
                onClick={action.onClick}
                style={{fontSize:'1.08em'}}
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
