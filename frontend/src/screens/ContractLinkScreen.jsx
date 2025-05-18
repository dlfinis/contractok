import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import axios from 'axios';

export default function ContractLinkScreen() {
  const [codigo, setCodigo] = useState('');
  const [contrato, setContrato] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accion, setAccion] = useState(null); // 'aprobado' o 'rechazado'

  const fetchContrato = async () => {
    setLoading(true);
    setError(null);
    setContrato(null);
    try {
      const res = await axios.get(`/api/contracts/code/${codigo}`);
      setContrato(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Contrato no encontrado');
    } finally {
      setLoading(false);
    }
  };

  const aprobarRechazar = async (aprobar) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`/api/contracts/${contractId}/approve`, { aprobar });
      setContrato(res.data);
      setAccion(aprobar ? 'aprobado' : 'rechazado');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar contrato');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4 position-relative" style={{maxWidth: 480, minHeight: '92vh'}}>
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-center mb-4">Vincular/Consultar Contrato</h2>
          <div className="mb-3">
            <label className="form-label">Código de vinculación</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-link-45deg"></i></span>
              <input
                type="text"
                maxLength={4}
                className="form-control text-uppercase text-center fw-bold fs-5"
                placeholder="Ej: A3F9"
                value={codigo}
                onChange={e => setCodigo(e.target.value.toUpperCase())}
                style={{letterSpacing:'0.3em'}}
              />
              <button className="btn btn-primary d-flex align-items-center gap-2" onClick={fetchContrato} disabled={loading || codigo.length !== 4}>
                <i className="bi bi-search"></i> Consultar
              </button>
            </div>
          </div>
          {loading && <div className="text-center my-3">Cargando...</div>}
          {contrato && (
            <div className="card mt-4">
              <div className="card-body">
                <h4 className="card-title mb-3 text-success">Contrato encontrado</h4>
                <div className="mb-2"><strong>ID:</strong> {contrato.id}</div>
                <div className="mb-2"><strong>Tipo:</strong> {contrato.tipo}</div>
                <div className="mb-2"><strong>Monto:</strong> {contrato.monto}</div>
                <div className="mb-2"><strong>Estado:</strong> {contrato.estado}</div>
                <div className="mb-2"><strong>Descripción:</strong> {contrato.descripcion}</div>
                <div className="mb-2"><strong>Fecha límite:</strong> {contrato.fechaLimite}</div>
                <div className="d-flex gap-2 mt-3">
                  <button className="btn btn-success flex-fill d-flex align-items-center justify-content-center gap-2" onClick={() => aprobarRechazar(true)} disabled={accion==='aprobado'}>
                    <i className="bi bi-check-circle"></i> Aprobar
                  </button>
                  <button className="btn btn-warning flex-fill d-flex align-items-center justify-content-center gap-2" onClick={() => aprobarRechazar(false)} disabled={accion==='rechazado'}>
                    <i className="bi bi-x-circle"></i> Rechazar
                  </button>
                </div>
              </div>
            </div>
          )}
          {accion && <div className="alert alert-success mt-3 text-center">Contrato {accion}</div>}
          {error && <div className="alert alert-danger mt-3 text-center">{error}</div>}
        </div>
      </div>
    </div>
  );
}
