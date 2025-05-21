import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import axios from 'axios';

export default function ContractLinkScreen({ mode }) {
  const { id } = useParams();
  const isSearchMode = mode === 'buscar';
  const [codigo, setCodigo] = useState(id || '');
  // Elimina la declaración duplicada de codigo

  const [contrato, setContrato] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accion, setAccion] = useState(null); // 'aprobado' o 'rechazado'
  
  // Si se proporciona un id en la URL y estamos en modo vincular, buscar automáticamente
  useEffect(() => {
    if (id && !isSearchMode) {
      setCodigo(id);
      fetchContrato();
    }
  }, [id, isSearchMode]);

  const fetchContrato = async () => {
    setLoading(true);
    setError(null);
    setContrato(null);
    try {
      const res = await axios.get(`/api/contracts/code/${codigo}`);
      console.log('Contrato encontrado:', res.data);
      setContrato(res.data);
    } catch (err) {
      console.log('Error al buscar contrato:', err);
      setError(err.response?.data?.message || 'Contrato no encontrado');
    } finally {
      setLoading(false);
    }
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [accionPendiente, setAccionPendiente] = useState(null);

  const mostrarConfirmacion = (accion) => {
    setAccionPendiente(accion);
    setShowConfirmModal(true);
  };

  const confirmarAccion = async () => {
    setShowConfirmModal(false);
    
    if (!contrato?.id) {
      setError('No se pudo obtener el ID del contrato');
      return;
    }
    
    setLoading(true);
    setError(null);
    // Ocultar los detalles del contrato mientras se procesa
    const contratoTemporal = { ...contrato };
    setContrato(null);
    
    try {
      const contratoId = Number(contratoTemporal.id);
      const accion = accionPendiente ? 'aprobado' : 'rechazado';
      
      console.log('Enviando solicitud de:', accion, 'para el contrato ID:', contratoId);
      
      const res = await axios.post(
        `/api/contracts/${contratoId}/approve`, 
        { aprobar: accionPendiente },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Respuesta del servidor:', {
        status: res.status,
        data: res.data
      });
      
      if (res.data && res.data.error) {
        throw new Error(res.data.error);
      }
      
      setContrato(res.data);
      setAccion(accion);
      
      // Mostrar mensaje de éxito y redirigir después de 2 segundos
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
      
    } catch (err) {
      console.error('Error al procesar la acción:', {
        error: err.message,
        response: err.response?.data,
        status: err.response?.status,
        stack: err.stack
      });
      
      // Restaurar los datos del contrato en caso de error
      setContrato(contratoTemporal);
      
      let mensajeError = 'Error al actualizar el contrato';
      if (err.response?.data?.error) {
        mensajeError = err.response.data.error;
      } else if (err.message) {
        mensajeError = err.message;
      }
      
      setError(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-main">
      <div className="card shadow-sm m-3" style={{border: 'none', background: '#f9fafb'}}>
        <div className="card-body">
          <h2 className="card-title text-center mb-4 fs-4 fw-bold" style={{color: '#0A2E5A', letterSpacing: '-1px'}}>
            {isSearchMode ? 'Buscar contrato' : 'Vincular a contrato'}
          </h2>
          <div className="mb-4">
            <div className="input-group input-group-md" style={{boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderRadius: 12}}>
              <input
                type="text"
                className="form-control form-control-md fs-6 text-uppercase text-center fw-bold"
                placeholder="Código"
                maxLength={4}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && codigo.trim() && fetchContrato()}
                style={{letterSpacing: '0.25em', border: 'none', background: '#f2f6fa', borderRadius: 12, color: '#0A2E5A'}}
              />
              <button
                className="btn fw-bold fs-7"
                style={{background: '#0A2E5A', color: 'white', borderRadius: 12, padding: '10px 28px', boxShadow: '0 2px 4px rgba(0,0,0,0.07)'}}
                type="button"
                onClick={fetchContrato}
                disabled={loading || codigo.length !== 4}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                ) : (
                  <i className="bi bi-search me-1"></i>
                )}
                {isSearchMode ? 'Buscar' : 'Consultar'}
              </button>
            </div>
            {!isSearchMode && (
              <div className="form-text text-center mt-2">
                Ingresa el código de 4 dígitos que te compartieron
              </div>
            )}
          </div>
          {loading && (
            <div className="text-center my-5 py-5">
              <div className="spinner-border" style={{color: '#0A2E5A'}} role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-2" style={{color: '#0A2E5A', fontWeight: 600}}>Procesando tu solicitud...</p>
            </div>
          )}
          {contrato && (
            <div className="card mt-4" style={{borderRadius: 16, border: 'none', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}}>
              <div className="card-body" style={{padding: 24}}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="mb-0 fs-6 fw-bold" style={{color: '#0A2E5A'}}>
                    <span role="img" aria-label="Contrato" style={{marginRight: 8}}>📄</span>
                    Detalles
                  </h4>
                  {
                    <span className="px-2 py-1 mx-2 fs-12 text-center fw-bold" style={{
                      background: contrato.estado === 'aprobado' ? '#00a878' : contrato.estado === 'rechazado' ? '#dc3545' : contrato.estado === 'pendiente' ? '#ffc107' : '#adb5bd',
                      color: contrato.estado === 'pendiente' ? '#0A2E5A' : 'white',
                      borderRadius: 10,
                      display: 'inline-flex',
                      gap: 8
                    }}>
                      {contrato.estado === 'aprobado' && <span role="img" aria-label="Aprobado" style={{marginRight: 8}}>✅</span>}
                      {contrato.estado === 'rechazado' && <span role="img" aria-label="Rechazado" style={{marginRight: 8}}>❌</span>}
                      {contrato.estado === 'pendiente' && <span role="img" aria-label="Pendiente" style={{marginRight: 8}}>⏳</span>}
                      {contrato.estado ? contrato.estado.toUpperCase() : 'DESCONOCIDO'}
                    </span>
                  }
                </div>
                <div className="mb-2"><strong>Creado:</strong> {new Date(contrato.createdAt).toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' })}</div>
                {contrato && (
                  <div className="contract-details mt-4">
                    <div className="card mb-3">
                      <div className="card-body">
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Tipo:</span>
                          <strong className="text-capitalize">{contrato.tipo}</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Monto:</span>
                          <strong>${parseFloat(contrato.monto).toLocaleString()}</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Plazo de entrega:</span>
                          <strong>{new Date(contrato.plazoEntrega).toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' })}</strong>
                        </div>
                        <div className="mt-3">
                          <p className="text-muted mb-1">Descripción:</p>
                          <p className="mb-0">{contrato.descripcion}</p>
                        </div>
                      </div>
                    </div>
                    
                    {!isSearchMode && !accion && (
                      <div className="d-grid gap-2">
                        <button 
                          className="btn"
                          style={{background: '#00a878', color: 'white', fontWeight: 600, borderRadius: 10, fontSize: 17, marginBottom: 8, boxShadow: '0 2px 4px rgba(0,168,120,0.07)'}}
                          onClick={() => mostrarConfirmacion(true)} 
                          disabled={loading}
                        >
                          <span role="img" aria-label="Aprobar" style={{marginRight: 8}}>✅</span>
                          {loading ? 'Procesando...' : 'Aprobar Contrato'}
                        </button>
                        <button 
                          className="btn"
                          style={{background: '#fff', color: '#dc3545', fontWeight: 600, border: '2px solid #dc3545', borderRadius: 10, fontSize: 17, marginBottom: 8, marginLeft: 0}}
                          onClick={() => mostrarConfirmacion(false)} 
                          disabled={loading}
                        >
                          <span role="img" aria-label="Rechazar" style={{marginRight: 8}}>❌</span>
                          Rechazar Contrato
                        </button>
                      </div>
                    )}
                    
                    {accion && (
                      <div className="alert alert-success text-center">
                        <i className="bi bi-check-circle-fill me-2"></i>
                        Contrato {accion} correctamente. Redirigiendo...
                        <div className="spinner-border spinner-border-sm ms-2" role="status">
                          <span className="visually-hidden">Cargando...</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          {accion && <div className="alert alert-success mt-3 text-center" style={{background: '#e8f5e9', color: '#00a878', border: 'none', fontWeight: 600, borderRadius: 10}}>✅ Contrato {accion}</div>}
          {error && (
            <div className="alert alert-danger mt-3 d-flex align-items-center" role="alert" style={{background: '#fff3f3', color: '#dc3545', border: 'none', fontWeight: 600, borderRadius: 10}}>
              <span role="img" aria-label="Error" style={{marginRight: 8}}>❌</span>
              <div>{error}</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de confirmación */}
      <div className={`modal fade ${showConfirmModal ? 'show d-block' : ''}`} tabIndex="-1" style={{backgroundColor: showConfirmModal ? 'rgba(0,0,0,0.37)' : 'transparent', zIndex: 9999}}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{borderRadius: 16, border: 'none'}}>
            <div className="modal-header" style={{background: '#f9fafb', borderBottom: 'none', borderRadius: '16px 16px 0 0'}}>
              <h5 className="modal-title" style={{fontWeight: 700, color: '#0A2E5A'}}>
                {accionPendiente ? <span role="img" aria-label="Aprobar" style={{marginRight: 8}}>✅</span> : <span role="img" aria-label="Rechazar" style={{marginRight: 8}}>❌</span>}
                Confirmar acción
              </h5>
              <button type="button" className="btn-close" onClick={() => setShowConfirmModal(false)}></button>
            </div>
            <div className="modal-body">
              ¿Estás seguro de que deseas {accionPendiente ? 'aprobar' : 'rechazar'} este contrato?
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>
                <i className="bi bi-x-lg me-1"></i> Cancelar
              </button>
              <button 
                type="button" 
                className="btn"
                style={{background: accionPendiente ? '#00a878' : '#fff', color: accionPendiente ? 'white' : '#dc3545', fontWeight: 600, border: accionPendiente ? 'none' : '2px solid #dc3545', borderRadius: 10, fontSize: 17, minWidth: 120}}
                onClick={confirmarAccion}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    Procesando...
                  </>
                ) : (
                  <>
                    {accionPendiente ? <span role="img" aria-label="Aprobar" style={{marginRight: 8}}>✅</span> : <span role="img" aria-label="Rechazar" style={{marginRight: 8}}>❌</span>}
                    {accionPendiente ? 'Aprobar' : 'Rechazar'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Fondo oscuro del modal */}
      {showConfirmModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};
