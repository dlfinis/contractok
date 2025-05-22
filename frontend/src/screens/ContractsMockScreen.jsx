import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Pantalla mock de contratos para Ana
import { useState } from 'react';

export default function ContractsMockScreen() {
  // Datos mock de contratos
  const contracts = [
    {
      id: 1,
      descripcion: 'Diseño de logo para startup',
      tipo: 'servicio',
      monto: 150,
      codigoVinculacion: 'A1B2C3',
      estado: 'activo',
      createdAt: '2025-05-10',
      contraparte: 'Carlos',
    },
    {
      id: 2,
      descripcion: 'Venta de laptop usada',
      tipo: 'venta',
      monto: 600,
      codigoVinculacion: 'D4E5F6',
      estado: 'pendiente',
      createdAt: '2025-05-15',
      contraparte: 'Beatriz',
    },
    {
      id: 3,
      descripcion: 'Reparación de aire acondicionado',
      tipo: 'reparacion',
      monto: 80,
      codigoVinculacion: 'G7H8I9',
      estado: 'en disputa',
      createdAt: '2025-05-17',
      contraparte: 'Eduardo',
    },
    {
      id: 4,
      descripcion: 'Desarrollo web landing page',
      tipo: 'servicio',
      monto: 320,
      codigoVinculacion: 'J1K2L3',
      estado: 'completado',
      createdAt: '2025-04-30',
      contraparte: 'María',
    },
  ];

  const getTipoIcon = (tipo) => {
    switch(tipo?.toLowerCase()) {
      case 'servicio': return '⚙️';
      case 'venta': return '💰';
      case 'reparacion': return '🛠️';
      default: return '📄';
    }
  };
  const getTipoLabel = (tipo) => {
    switch(tipo?.toLowerCase()) {
      case 'servicio': return 'Servicio';
      case 'venta': return 'Venta';
      case 'reparacion': return 'Reparación';
      default: return tipo || 'Sin tipo';
    }
  };
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'activo': return 'bg-success';
      case 'pendiente': return 'bg-warning';
      case 'en disputa': return 'bg-danger';
      case 'completado': return 'bg-info';
      default: return 'bg-secondary';
    }
  };

  // Estado para contrato seleccionado
  const [selectedId, setSelectedId] = useState(null);
  const selected = contracts.find(c => c.id === selectedId);

  // Resumen por estado
  const resumen = contracts.reduce((acc, c) => {
    acc[c.estado] = (acc[c.estado] || 0) + 1;
    return acc;
  }, {});

  // Detectar si es móvil
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="container-fluid py-4 px-2 px-md-4" style={{background:'#f2f6fa', minHeight:'100vh'}}>
      <div className="mb-4 d-flex align-items-center gap-3 flex-wrap">
        <i className="bi bi-folder2-open fs-2 text-primary" style={{color:'#0A2E5A'}}></i>
        <h2 className="fw-bold mb-0" style={{color:'#0A2E5A'}}>Tus contratos, Ana</h2>
        <span className="badge bg-primary-subtle text-primary"><i className="bi bi-star-fill me-1"></i></span>
      </div>
      <div className="row g-2 mb-3">
        <div className="col-12 col-sm-auto mb-2 mb-sm-0">
          <button className="btn btn-primary w-100"><i className="bi bi-plus-circle me-1"></i>Nuevo contrato</button>
        </div>
        <div className="col-6 col-sm-auto mb-2 mb-sm-0">
          <button className="btn btn-outline-secondary w-100"><i className="bi bi-arrow-clockwise me-1"></i>Actualizar</button>
        </div>
        <div className="col-6 col-sm-auto">
          <button className="btn btn-outline-dark w-100"><i className="bi bi-download me-1"></i>Descargar</button>
        </div>
      </div>
      {/* Resumen adaptable */}
      <div className="row g-2 mb-3 flex-nowrap overflow-auto" style={{scrollbarWidth:'none'}}>
        <div className="col-6 col-md-3" style={{minWidth: isMobile ? 160 : undefined}}>
          <div className="card shadow-sm border-0 bg-white">
            <div className="card-body py-2 px-3 d-flex align-items-center gap-2">
              <i className="bi bi-files fs-4 text-primary"></i>
              <div>
                <div className="fw-bold" style={{fontSize:'1.2em'}}>{contracts.length}</div>
                <div className="text-muted" style={{fontSize:'0.95em'}}>Total</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-2" style={{minWidth: isMobile ? 130 : undefined}}>
          <div className="card shadow-sm border-0 bg-white">
            <div className="card-body py-2 px-3 d-flex align-items-center gap-2">
              <span className="badge bg-success" style={{width:28, height:28, fontSize:'1em'}}></span>
              <div>
                <div className="fw-bold">{resumen['activo'] || 0}</div>
                <div className="text-muted" style={{fontSize:'0.93em'}}>Activos</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-2" style={{minWidth: isMobile ? 130 : undefined}}>
          <div className="card shadow-sm border-0 bg-white">
            <div className="card-body py-2 px-3 d-flex align-items-center gap-2">
              <span className="badge bg-warning" style={{width:28, height:28, fontSize:'1em'}}></span>
              <div>
                <div className="fw-bold">{resumen['pendiente'] || 0}</div>
                <div className="text-muted" style={{fontSize:'0.93em'}}>Pendientes</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-2" style={{minWidth: isMobile ? 130 : undefined}}>
          <div className="card shadow-sm border-0 bg-white">
            <div className="card-body py-2 px-3 d-flex align-items-center gap-2">
              <span className="badge bg-info" style={{width:28, height:28, fontSize:'1em'}}></span>
              <div>
                <div className="fw-bold">{resumen['completado'] || 0}</div>
                <div className="text-muted" style={{fontSize:'0.93em'}}>Completados</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-2" style={{minWidth: isMobile ? 130 : undefined}}>
          <div className="card shadow-sm border-0 bg-white">
            <div className="card-body py-2 px-3 d-flex align-items-center gap-2">
              <span className="badge bg-danger" style={{width:28, height:28, fontSize:'1em'}}></span>
              <div>
                <div className="fw-bold">{resumen['en disputa'] || 0}</div>
                <div className="text-muted" style={{fontSize:'0.93em'}}>En disputa</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Vista responsive: cards en móvil, tabla en desktop */}
      {isMobile ? (
        <div className="d-flex flex-column gap-3 mt-2">
          {contracts.map(contract => (
            <div key={contract.id} className={`card shadow-sm ${selectedId===contract.id?'border-primary':''}`} style={{borderRadius:14}}>
              <div className="card-body py-3 px-3">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="text-primary fs-4">{getTipoIcon(contract.tipo)}</span>
                  <div className="fw-bold flex-grow-1">{contract.descripcion}</div>
                  <span className={`badge ${getStatusBadgeClass(contract.estado)} ms-2`} style={{fontSize:'0.99em'}}>{contract.estado}</span>
                </div>
                <div className="mb-2 text-muted small">Cod: {contract.codigoVinculacion}</div>
                <div className="row g-1 mb-2">
                  <div className="col-6"><span className="text-muted">Tipo:</span> <span className="badge bg-light text-dark ms-1">{getTipoLabel(contract.tipo)}</span></div>
                  <div className="col-6"><span className="text-muted">Monto:</span> <span className="fw-bold">${parseFloat(contract.monto).toLocaleString()}</span></div>
                  <div className="col-6"><span className="text-muted">Fecha:</span> <span className="fw-bold">{contract.createdAt}</span></div>
                  <div className="col-6"><span className="text-muted">Contraparte:</span> <span className="fw-bold">{contract.contraparte}</span></div>
                </div>
                <div className="d-flex gap-2 mt-2">
                  <button className="btn btn-outline-primary flex-fill" style={{minWidth:0}} onClick={()=>setSelectedId(contract.id)}><i className="bi bi-eye me-1"></i>Ver</button>
                  <button className="btn btn-outline-secondary flex-fill" style={{minWidth:0}}><i className="bi bi-pencil me-1"></i>Editar</button>
                  <button className="btn btn-outline-danger flex-fill" style={{minWidth:0}}><i className="bi bi-trash me-1"></i>Eliminar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-responsive" style={{ width: '100%' }}>
          <table className="table table-borderless table-hover align-middle mb-0 w-100" style={{borderRadius:12, overflow:'hidden'}}>
            <thead className="table-light">
              <tr>
                <th style={{ width: '22%' }}>Contrato</th>
                <th style={{ width: '12%' }}>Tipo</th>
                <th style={{ width: '10%' }}>Monto</th>
                <th style={{ width: '12%' }}>Estado</th>
                <th style={{ width: '13%' }}>Fecha</th>
                <th style={{ width: '13%' }}>Contraparte</th>
                <th style={{ width: '10%' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract) => (
                <tr key={contract.id}
                    style={{cursor:'pointer', background:selectedId===contract.id?'#e8f0fe':'', transition:'background 0.2s'}}
                    onClick={() => setSelectedId(contract.id)}
                    className={selectedId===contract.id?'fw-bold':''}
                >
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-primary fs-5">{getTipoIcon(contract.tipo)}</span>
                      <span style={{whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:140}}>{contract.descripcion}</span>
                    </div>
                    <div className="text-muted small">Cod: {contract.codigoVinculacion}</div>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark border border-1 px-2 py-1" style={{fontSize:'0.92em'}}>{getTipoLabel(contract.tipo)}</span>
                  </td>
                  <td className="text-nowrap">${parseFloat(contract.monto).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(contract.estado)}`} style={{fontSize:'0.97em'}}>{contract.estado}</span>
                  </td>
                  <td className="text-nowrap small text-muted">{contract.createdAt}</td>
                  <td className="text-nowrap small">{contract.contraparte}</td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button className="btn btn-sm btn-outline-primary" title="Ver detalles"><i className="bi bi-eye"></i></button>
                      <button className="btn btn-sm btn-outline-secondary" title="Editar"><i className="bi bi-pencil"></i></button>
                      <button className="btn btn-sm btn-outline-danger" title="Eliminar"><i className="bi bi-trash"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Panel lateral de detalles (desktop) o modal centrado (mobile) */}
      {selected && (
        isMobile ? (
          <div className="modal fade show" tabIndex="-1" style={{display:'block', background:'rgba(0,0,0,0.25)'}}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Contrato #{selected.codigoVinculacion}</h5>
                  <button type="button" className="btn-close" aria-label="Cerrar" onClick={()=>setSelectedId(null)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-2">
                    <span className="text-muted">Descripción:</span>
                    <div className="fw-bold">{selected.descripcion}</div>
                  </div>
                  <div className="mb-2">
                    <span className="text-muted">Tipo:</span> <span className="badge bg-light text-dark ms-1">{getTipoLabel(selected.tipo)}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-muted">Monto:</span> <span className="fw-bold">${parseFloat(selected.monto).toLocaleString()}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-muted">Estado:</span> <span className={`badge ${getStatusBadgeClass(selected.estado)} ms-1`}>{selected.estado}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-muted">Fecha:</span> <span className="fw-bold">{selected.createdAt}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-muted">Contraparte:</span> <span className="fw-bold">{selected.contraparte}</span>
                  </div>
                  <div className="mt-4 d-flex gap-2">
                    <button className="btn btn-outline-primary w-100"><i className="bi bi-eye me-1"></i>Ver</button>
                    <button className="btn btn-outline-secondary w-100"><i className="bi bi-pencil me-1"></i>Editar</button>
                    <button className="btn btn-outline-danger w-100"><i className="bi bi-trash me-1"></i>Eliminar</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="offcanvas offcanvas-end show" tabIndex="-1" style={{visibility:'visible', width:340, background:'#fff', boxShadow:'-2px 0 16px rgba(0,0,0,0.11)', zIndex:1050, position:'fixed', top:0, right:0, height:'100vh'}}>
            <div className="offcanvas-header border-bottom">
              <h5 className="offcanvas-title">Contrato #{selected.codigoVinculacion}</h5>
              <button type="button" className="btn-close" aria-label="Cerrar" onClick={()=>setSelectedId(null)}></button>
            </div>
            <div className="offcanvas-body">
              <div className="mb-2">
                <span className="text-muted">Descripción:</span>
                <div className="fw-bold">{selected.descripcion}</div>
              </div>
              <div className="mb-2">
                <span className="text-muted">Tipo:</span> <span className="badge bg-light text-dark ms-1">{getTipoLabel(selected.tipo)}</span>
              </div>
              <div className="mb-2">
                <span className="text-muted">Monto:</span> <span className="fw-bold">${parseFloat(selected.monto).toLocaleString()}</span>
              </div>
              <div className="mb-2">
                <span className="text-muted">Estado:</span> <span className={`badge ${getStatusBadgeClass(selected.estado)} ms-1`}>{selected.estado}</span>
              </div>
              <div className="mb-2">
                <span className="text-muted">Fecha:</span> <span className="fw-bold">{selected.createdAt}</span>
              </div>
              <div className="mb-2">
                <span className="text-muted">Contraparte:</span> <span className="fw-bold">{selected.contraparte}</span>
              </div>
              <div className="mt-4 d-flex gap-2">
                <button className="btn btn-outline-primary w-100"><i className="bi bi-eye me-1"></i>Ver</button>
                <button className="btn btn-outline-secondary w-100"><i className="bi bi-pencil me-1"></i>Editar</button>
                <button className="btn btn-outline-danger w-100"><i className="bi bi-trash me-1"></i>Eliminar</button>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
