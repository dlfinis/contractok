import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Mock data
const mockContract = {
  id: 'C-2025-001',
  title: 'Desarrollo de Página Web',
  partes: [
    { nombre: 'Ana', rol: 'Proveedor', icon: 'bi-person-circle' },
    { nombre: 'Bob', rol: 'Cliente', icon: 'bi-person-badge' }
  ],
  monto: '500 WDL',
  descripcion: 'Desarrollo completo de una web institucional para empresa X. Incluye diseño, frontend y backend.',
  fecha: '2025-05-01',
};

const mockArbitraje = {
  estado: 'En proceso',
  tiempoRestante: 60 * 60 * 12, // 12 horas en segundos
  comentarios: [
    {
      autor: 'Bob',
      fecha: '2025-05-21 09:30',
      texto: 'El proveedor no entregó el proyecto en la fecha acordada. Solicito reembolso.',
      icon: 'bi-exclamation-diamond-fill',
    },
    {
      autor: 'Ana',
      fecha: '2025-05-21 10:05',
      texto: 'El cliente no entregó los materiales necesarios a tiempo.',
      icon: 'bi-chat-left-dots-fill',
    },
  ],
  progreso: 30, // porcentaje
};

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

export default function ArbitrationProcessScreen() {
  const [tiempo, setTiempo] = useState(mockArbitraje.tiempoRestante);

  useEffect(() => {
    if (tiempo > 0) {
      const timer = setInterval(() => setTiempo(t => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [tiempo]);

  return (
    <div className="container py-5" style={{maxWidth: 700}}>
      <div className="mb-4 text-center">
        <span className="badge rounded-pill bg-warning text-dark shadow-sm px-4 py-2 fs-6 animate__animated animate__pulse animate__infinite" style={{fontWeight:600, fontSize:'1.1rem'}}>Arbitraje en proceso <i className="bi bi-hourglass-split ms-2"></i></span>
      </div>
      <div className="card shadow-lg mb-4 border-0" style={{borderRadius:18, background:'#f5fbff'}}>
        <div className="card-body">
          <div className="d-flex align-items-center mb-2">
            <i className="bi bi-file-earmark-text text-primary me-2 fs-4"></i>
            <span className="fw-bold fs-5" style={{color:'#0A2E5A'}}>{mockContract.title}</span>
            <span className="badge bg-primary ms-3">{mockContract.id}</span>
          </div>
          <div className="d-flex flex-wrap gap-2 mb-2">
            {mockContract.partes.map((p, idx) => (
              <span key={idx} className="badge bg-light text-dark border border-primary px-3 py-2" style={{fontWeight:500, fontSize:'1em'}}>
                <i className={`bi ${p.icon} me-1`}></i>{p.nombre} <span className="text-secondary">({p.rol})</span>
              </span>
            ))}
          </div>
          <div className="mb-2">
            <span className="fw-bold text-success">Monto: {mockContract.monto}</span>
          </div>
          <div className="mb-2">
            <span className="text-secondary">{mockContract.descripcion}</span>
          </div>
          <div className="mb-2">
            <i className="bi bi-calendar-event me-1"></i>
            <span className="text-secondary">Creado: {mockContract.fecha}</span>
          </div>
          {/* Condiciones de entrega */}
          <div className="mb-2">
            <div className="fw-bold mb-1" style={{color:'#0A2E5A', fontSize:'1em'}}>
              <i className="bi bi-list-check me-1 text-primary"></i> Condiciones de entrega
            </div>
            <ul className="list-unstyled mb-0">
              <li className="d-flex align-items-center mb-1"><i className="bi bi-check-circle-fill text-success me-2"></i>Entrega de diseño en Figma</li>
              <li className="d-flex align-items-center mb-1"><i className="bi bi-send-x-fill text-danger me-2"></i>Publicación del sitio en hosting</li>
              <li className="d-flex align-items-center"><i className="bi bi-send-x-fill text-danger me-2"></i>Manual de usuario básico</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="card shadow border-0 mb-4" style={{borderRadius:18, background:'#fffbe8'}}>
        <div className="card-body">
          <div className="d-flex align-items-center mb-2">
            <i className="bi bi-shield-check text-warning me-2 fs-5"></i>
            <span className="fw-bold fs-6" style={{color:'#B8860B'}}>Estado: {mockArbitraje.estado}</span>
            <span className="badge bg-info text-dark ms-3" style={{fontSize:'0.95em'}}><i className="bi bi-cpu me-1"></i>Arbitraje IA</span>
            <div className="ms-auto">
              <span className="badge bg-dark text-warning px-3 py-2 fs-7" style={{fontWeight:500}}>
                Tiempo restante: {formatTime(tiempo)}
              </span>
            </div>
          </div>
          <div className="progress mb-2" style={{height:8, borderRadius:6}}>
            <div className="progress-bar bg-warning" role="progressbar" style={{width: `${mockArbitraje.progreso}%`, transition:'width 1s'}} aria-valuenow={mockArbitraje.progreso} aria-valuemin="0" aria-valuemax="100"></div>
          </div>
          <div className="text-secondary fs-7 mb-2">El arbitraje está siendo evaluado por el sistema. Pronto recibirás una resolución.</div>
        </div>
      </div>
      <div className="card shadow-sm border-0" style={{borderRadius:18, background:'#f2f6fa'}}>
        <div className="card-body">
          <div className="d-flex align-items-center mb-3">
            <i className="bi bi-chat-left-text text-primary me-2 fs-5"></i>
            <span className="fw-bold fs-6" style={{color:'#0A2E5A'}}>Comentarios de la disputa</span>
          </div>
          <div className="timeline-arb">
            {mockArbitraje.comentarios.map((c, idx) => (
              <div key={idx} className="mb-3 d-flex align-items-start gap-2 animate__animated animate__fadeInUp" style={{animationDelay:`${idx*0.2}s`, animationFillMode:'backwards'}}>
                <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-2" style={{minWidth:38, minHeight:38, display:'flex', alignItems:'center', justifyContent:'center'}}>
                  <i className={`bi ${c.icon} text-primary fs-5`}></i>
                </div>
                <div>
                  <div className="fw-bold text-dark">{c.autor} <span className="text-secondary fs-7">({c.fecha})</span></div>
                  <div className="text-secondary">{c.texto}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="alert alert-info mt-3 mb-0 text-center animate__animated animate__pulse animate__infinite" style={{borderRadius:10}}>
            El arbitraje está en curso. Puedes seguir el estado aquí.
          </div>
        </div>
      </div>
      {/* Pensamientos de la IA */}
      <div className="card mt-4 border-0 shadow-sm" style={{borderRadius:16, background:'#eaf6ff'}}>
        <div className="card-body">
          <div className="d-flex align-items-center mb-2">
            <i className="bi bi-robot text-info me-2 fs-4"></i>
            <span className="fw-bold fs-6" style={{color:'#0A2E5A'}}>Pensamientos de la IA</span>
          </div>
          <div className="text-secondary" style={{fontSize:'1em'}}>
            <ul className="mb-1 ps-3">
              <li>Analizando argumentos de ambas partes y comentarios recientes.</li>
              <li>Revisando condiciones de entrega acordadas y cumplimiento.</li>
              <li>Buscando inconsistencias o evidencia relevante.</li>
              <li>Priorizando imparcialidad y justicia en la resolución.</li>
            </ul>
            <span className="text-info"><i className="bi bi-lightbulb me-1"></i>La IA está procesando toda la información para emitir un veredicto justo y transparente.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
