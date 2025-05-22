import React, { useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Pantalla mock para visualización y subida de evidencias por la contraparte
export default function EvidenceUploadMockScreen() {
  // Mock de contrato y usuario
  const contrato = {
    codigo: 'CS-LOGO-2025',
    descripcion: 'Diseño de logotipo para Caramel Sunrise',
    tipo: 'servicio',
    monto: 1500,
    estado: 'en desarrollo',
    fecha: '2025-05-15',
    cliente: 'Ana',
    contraparte: 'Carlos',
    plazoEntrega: '2025-05-30',
    condiciones: ['Entrega editable (AI, PDF, PNG)', 'Paleta aprobada por cliente', 'Prototipo visual'],
  };
  const [archivos, setArchivos] = useState([
    { nombre: 'Prototipo Figma', tipo: 'figma', url: 'https://www.figma.com/proto/CaramelSunriseLogoMock', fecha: '2025-05-20', usuario: 'Carlos' },
    { nombre: 'Pruebas_color_v1.png', tipo: 'imagen', url: 'https://files.caramel.com/pruebas_color_v1.png', fecha: '2025-05-19', usuario: 'Carlos' },
    { nombre: 'Logo_CaramelSunrise.ai', tipo: 'ai', url: 'https://files.caramel.com/Logo_CaramelSunrise.ai', fecha: '2025-05-21', usuario: 'Carlos' },
    { nombre: 'Logo_CaramelSunrise.pdf', tipo: 'pdf', url: 'https://files.caramel.com/Logo_CaramelSunrise.pdf', fecha: '2025-05-21', usuario: 'Carlos' },
    { nombre: 'contrato_firmado.pdf', tipo: 'pdf', url: '#', fecha: '2025-05-15', usuario: 'Ana' },
  ]);
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const inputRef = useRef();

  const handleSubir = (e) => {
    setSubiendo(true);
    setTimeout(() => {
      setArchivos([
        ...archivos,
        { nombre: e.target.files[0].name, tipo: 'otro', url: '#', fecha: '2025-05-21', usuario: 'Carlos' }
      ]);
      setMensaje('Archivo subido exitosamente.');
      setSubiendo(false);
    }, 1200);
  };

  return (
    <div className="container-fluid py-3 px-2 px-sm-3" style={{background:'#f2f6fa', minHeight:'100vh'}}>
      <div className="mx-auto mb-4" style={{maxWidth:540}}>
        <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
          <i className="bi bi-upload fs-2 text-primary"></i>
          <h2 className="fw-bold mb-0 fs-4" style={{color:'#0A2E5A'}}>Subida de evidencias</h2>
        </div>
        <div className="card shadow-sm border-0 mb-3" style={{borderRadius:14}}>
          <div className="card-body p-3 p-sm-4">
            <div className="mb-2 d-flex flex-wrap gap-2 align-items-center">
              <span className="badge bg-info text-dark">Contrato #{contrato.codigo}</span>
              <span className="badge bg-success text-light">{contrato.estado}</span>
            </div>
            <div className="mb-2">
              <b className="text-primary">Cliente:</b> {contrato.cliente} &nbsp; <b className="text-primary">Contraparte:</b> {contrato.contraparte}
            </div>
            <div className="mb-2">
              <b className="text-primary">Descripción:</b> {contrato.descripcion}
            </div>
            <div className="mb-2">
              <b className="text-primary">Tipo:</b> {contrato.tipo} &nbsp; <b>Monto:</b> {contrato.monto} WDL
            </div>
            <div className="mb-2">
              <b className="text-primary">Plazo entrega:</b> {contrato.plazoEntrega}
            </div>
            <div className="mb-2">
              <b className="text-primary">Condiciones:</b>
              <ul className="mb-0 ps-4">
                {contrato.condiciones.map((c,i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          </div>
        </div>
        <div className="card shadow-sm border-0 mb-3" style={{borderRadius:14}}>
          <div className="card-body p-3 p-sm-4">
            <div className="d-flex align-items-center mb-2 gap-2 flex-wrap">
              <i className="bi bi-folder2-open text-primary"></i>
              <b className="text-primary">Archivos subidos por la contraparte</b>
            </div>
            <ul className="list-group mb-3">
              {archivos.map((a,i) => (
                <li key={i} className="list-group-item d-flex align-items-center justify-content-between px-2 py-2" style={{border:'none', background:'#f8fafc', borderRadius:7, marginBottom:4, minHeight:44}}>
                  <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 w-100">
                    {/* Icono según tipo */}
                    <i className={`bi ${
                      a.tipo==='imagen' ? 'bi-file-image' :
                      a.tipo==='pdf' ? 'bi-file-earmark-pdf' :
                      a.tipo==='ai' ? 'bi-filetype-ai' :
                      a.tipo==='figma' ? 'bi-easel3' :
                      'bi-file-earmark'
                    } text-secondary fs-6 flex-shrink-0`}></i>
                    <div className="flex-grow-1">
                      <div className="fw-semibold text-dark d-flex flex-wrap align-items-center gap-1" style={{fontSize:'0.97em'}}>
                        {a.nombre}
                        {a.tipo==='figma' && (
                          <span className="badge bg-warning text-dark px-2 py-1" style={{fontSize:'0.74em'}}>Figma</span>
                        )}
                        {a.tipo==='ai' && (
                          <span className="badge bg-dark text-light px-2 py-1" style={{fontSize:'0.74em'}}>AI</span>
                        )}
                        {a.tipo==='pdf' && (
                          <span className="badge bg-danger text-light px-2 py-1" style={{fontSize:'0.74em'}}>PDF</span>
                        )}
                        {a.tipo==='imagen' && (
                          <span className="badge bg-info text-dark px-2 py-1" style={{fontSize:'0.74em'}}>Imagen</span>
                        )}
                        <span className="badge bg-light text-dark px-2 py-1" style={{fontSize:'0.74em'}}>{a.usuario}</span>
                      </div>
                      <div className="text-muted small" style={{fontSize:'0.80em'}}>{a.fecha}</div>
                    </div>
                    <a href={a.url} className="btn btn-link btn-xs ms-auto px-1 py-0" style={{color:'#0A2E5A', minWidth:24, fontSize:'0.95em'}} title="Descargar"><i className="bi bi-download"></i></a>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mb-2">
              <label className="form-label fw-bold" style={{color:'#0A2E5A'}}>Subir nueva evidencia</label>
              <div className="input-group">
                <input type="file" className="form-control" ref={inputRef} onChange={handleSubir} disabled={subiendo} style={{background:'#f2f6fa', border:'none', borderRadius:10}} />
                <button className="btn btn-primary" type="button" disabled={subiendo} onClick={()=>inputRef.current && inputRef.current.click()}>
                  <i className="bi bi-upload"></i> {subiendo ? 'Subiendo...' : 'Subir'}
                </button>
              </div>
              {mensaje && <div className="alert alert-success mt-2 py-2 px-3">{mensaje}</div>}
            </div>
            <div className="alert alert-info mt-3" style={{fontSize:'0.97em'}}>
              <i className="bi bi-info-circle me-2"></i>
              Aquí puedes ver y subir archivos como evidencia del cumplimiento o avance del contrato. Solo la contraparte puede subir evidencias en esta sección.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
