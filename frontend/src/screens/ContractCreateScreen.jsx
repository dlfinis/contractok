import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import axios from 'axios';
import InfoScreen from '../components/InfoScreen';

const tipos = [
  { value: 'servicio', label: 'Servicio' },
  { value: 'venta', label: 'Venta' },
  { value: 'reparacion', label: 'Reparación' },
];

export default function ContractCreateScreen({ onCreated }) {
  const [showToast, setShowToast] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tipo, setTipo] = useState('servicio');
  const [monto, setMonto] = useState('');
  const [plazoEntrega, setPlazoEntrega] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [creadorId, setCreadorId] = useState(''); // placeholder, debe venir del login
  const [contraparteId, setContraparteId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Obtener nullifier_hash de localStorage o valor por defecto
      let nullifier_hash = 'default_nullifier';
      try {
        const stored = localStorage.getItem('wld_nullifier_hash');
        if (stored) nullifier_hash = stored;
      } catch (e) {}
      const res = await axios.post('/api/contracts', {
        tipo,
        monto: parseFloat(monto),
        plazoEntrega,
        descripcion,
        creadorHashId: nullifier_hash,
        contraparteHashId: contraparteId || undefined,
      });
      if (onCreated) {
        onCreated(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear contrato');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4 position-relative" style={{maxWidth: 480, minHeight: '92vh'}}>
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-center mb-4">Crear Contrato</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Tipo de contrato</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-file-earmark-text"></i></span>
                <select className="form-select" value={tipo} onChange={e => setTipo(e.target.value)} required>
                  <option value="">Selecciona un tipo</option>
                  {tipos.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              {tipo === '' && (
                <div className="alert alert-danger py-2 mt-2 mb-0">
                  Debes seleccionar el tipo de contrato.
                </div>
              )}
            </div>
            <div className="mb-3">
              <label className="form-label">Monto (WDL)</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-currency-dollar"></i></span>
                <input
                  type="number"
                  min="10"
                  max="1999"
                  step="0.01"
                  className="form-control"
                  value={monto}
                  onChange={e => setMonto(e.target.value)}
                  required
                />
              </div>
              {monto && (!/^[0-9]+(\.[0-9]+)?$/.test(monto) || parseFloat(monto) < 10) && (
                <div className="alert alert-danger py-2 mt-2 mb-0">
                  El monto mínimo es 10 WDL.
                </div>
              )}
              {monto && /^[0-9]+(\.[0-9]+)?$/.test(monto) && parseFloat(monto) > 1999 && (
                <div className="alert alert-danger py-2 mt-2 mb-0">
                  El monto máximo permitido es 1999 WDL.
                </div>
              )}
              {monto && /^[0-9]+(\.[0-9]+)?$/.test(monto) && parseFloat(monto) >= 10 && (
                <div className="mt-2 mb-1" style={{backgroundColor: 'rgba(13, 110, 253, 0.08)', borderRadius: 8, padding: '7px 12px'}}>
                  <span className="fs-7 text-secondary">
                    <i className="bi bi-calculator me-1"></i>
                    Comisión (1%): <b>{(parseFloat(monto)*0.01).toFixed(2)} WDL</b> &nbsp;|&nbsp; Recibirás: <b>{(parseFloat(monto)*0.99).toFixed(2)} WDL</b>
                  </span>
                </div>
              )}
            </div>
            <div className="mb-3">
              <label className="form-label">Fecha límite de entrega</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-calendar-event"></i></span>
                {(() => {
                  const today = new Date();
                  const minDate = today.toISOString().split('T')[0];
                  const maxDateObj = new Date(today);
                  maxDateObj.setMonth(maxDateObj.getMonth() + 3);
                  // Ajuste si el mes se pasa de diciembre
                  if (maxDateObj.getMonth() > 11) {
                    maxDateObj.setFullYear(maxDateObj.getFullYear() + 1);
                    maxDateObj.setMonth(maxDateObj.getMonth() % 12);
                  }
                  const maxDate = maxDateObj.toISOString().split('T')[0];
                  return (
                    <input
                      type="date"
                      className="form-control"
                      value={plazoEntrega}
                      min={minDate}
                      max={maxDate}
                      onChange={e => setPlazoEntrega(e.target.value)}
                      required
                    />
                  );
                })()}
              </div>
            </div>
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <label className="form-label mb-0">Descripción</label>
                <span className={`small fw-bold ${descripcion.length < 100 ? 'text-danger' : 'text-success'}`}>Caract.: {descripcion.length}/100</span>
              </div>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-card-text"></i></span>
                <textarea
                  className="form-control"
                  value={descripcion}
                  minLength={100}
                  onChange={e => {
                    const value = e.target.value;
                    if (/l{9}/i.test(value.slice(-9))) {
                      const loremWords = [
                        'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'pellentesque', 'euismod', 'urna', 'tincidunt', 'nisi', 'nisl', 'aliquam', 'erat', 'volutpat', 'vitae', 'sapien', 'sem', 'faucibus', 'leo', 'vel', 'dictum', 'auctor', 'nulla', 'facilisi', 'quisque', 'placerat', 'arcu', 'eget', 'hendrerit', 'lacinia', 'turpis', 'pretium', 'integer', 'porta', 'massa', 'nec', 'aliquet', 'tempus', 'vivamus', 'velit', 'mattis', 'blandit', 'purus', 'gravida', 'magna', 'suscipit', 'morbi', 'tristique', 'senectus', 'netus', 'malesuada', 'fames', 'ac', 'egestas', 'mauris', 'rhoncus', 'habitasse', 'platea', 'dictumst', 'curabitur', 'scelerisque', 'luctus', 'duis', 'aliquet', 'enim', 'tortor', 'at', 'auctor', 'urna', 'nunc', 'vel', 'risus', 'commodo', 'viverra', 'mauris', 'in', 'aliquam', 'sem', 'fringilla', 'ut', 'morbi', 'tincidunt', 'augue', 'interdum', 'velit', 'euismod', 'in', 'pellentesque', 'massa', 'placerat', 'duis', 'ultricies', 'lacus', 'sed', 'turpis', 'tincidunt', 'id', 'aliquet', 'tellus', 'in', 'hac', 'habitasse', 'platea', 'dictumst'
                      ];
                      let result = '';
                      let i = 0;
                      while (result.length < 120) {
                        result += loremWords[i % loremWords.length] + ' ';
                        i++;
                      }
                      result = result.slice(0, 100).trim();
                      setDescripcion(result);
                    } else {
                      setDescripcion(value);
                    }
                  }}
                  rows={3}
                  required
                />

              </div>
            </div>


            {descripcion.length < 100 && (
              <div className="alert alert-danger py-2 mb-3 mt-2">
                La descripción debe tener al menos 100 caracteres.
              </div>
            )}
            <button type="submit" className="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center gap-2 py-3" disabled={loading || descripcion.length < 100 || !monto || isNaN(parseFloat(monto)) || parseFloat(monto) < 10 || parseFloat(monto) > 1999 || !tipo}>
              <i className="bi bi-plus-circle"></i> Crear contrato
            </button>
          </form>
          <div className="mt-2 mb-1" style={{backgroundColor: 'rgba(13, 110, 253, 0.08)', borderRadius: 8, padding: '8px 12px'}}>
            <div className="d-flex align-items-start">
              <i className="bi bi-info-circle me-2 mt-1 text-primary"></i>
              <span className="fs-7 text-dark" style={{textAlign: 'justify', lineHeight: '1.25', fontSize: '0.77em'}}>
                Cuando confirmes la creación del contrato, se descontará automáticamente una comisión del <b>1%</b> sobre el monto ingresado. Revisa bien los datos antes de continuar. Esta comisión es necesaria para mantener la plataforma segura y operativa.
              </span>
            </div>
          </div>


          {/* Toast de éxito */}
          {showToast && (
            <div className="position-fixed bottom-0 end-0 p-3" style={{zIndex: 1200}}>
              <div className="toast show align-items-center text-bg-success border-0 animate__animated animate__fadeInUp animate__faster" role="alert">
                <div className="d-flex align-items-center">
                  <i className="bi bi-check-circle-fill fs-4 me-2"></i>
                  <div className="toast-body p-2 pe-3 small">
                    ¡Contrato creado exitosamente!
                  </div>
                </div>
              </div>
            </div>
          )}
          {error && <div className="alert alert-danger mt-3 text-center">{error}</div>}
        </div>
      </div>
    </div>
  );
}
