import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import InfoScreen from '../components/InfoScreen';
import CondicionesEntregaInput from '../components/CondicionesEntregaInput';
import WalletApprovalMock from '../components/WalletApprovalMock';

const tipos = [
  { value: 'servicio', label: ' ⚙️ Servicio' },
  { value: 'venta', label: ' 💰 Venta' },
  { value: 'reparacion', label: ' 🛠️ Reparación' },
];

export default function ContractCreateScreen({ onCreated }) {
  const [tipo, setTipo] = useState('servicio');
  const [monto, setMonto] = useState('');
  const [plazoEntrega, setPlazoEntrega] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [contraparteId, setContraparteId] = useState('');
  const [condicionesEntrega, setCondicionesEntrega] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contractCreated, setContractCreated] = useState(false);
  const [contractData, setContractData] = useState(null);
  const [showWalletMock, setShowWalletMock] = useState(false);
  const [awaitingWallet, setAwaitingWallet] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const world_id = currentUser.world_id || currentUser.world_id;
      if (!world_id) {
        throw new Error('No se pudo obtener la información del usuario');
      }

      setAwaitingWallet(true);
      await new Promise(resolve => setTimeout(resolve, 2000)); 
      setShowWalletMock(true);
      await new Promise(resolve => {
        const check = () => {
          if (!showWalletMock) resolve();
          else setTimeout(check, 80);
        };
        check();
      });
      setAwaitingWallet(false);

      if (!window.MiniKit || typeof window.MiniKit.pay !== 'function') {
        throw new Error('No se encontró la integración de la wallet. Abre la app dentro de World App.');
      }

      // 1. Realizar pago con MiniKit (wallet)
      if (!window.MiniKit || typeof window.MiniKit.pay !== 'function') {
        throw new Error('No se encontró la integración de la wallet. Abre la app dentro de World App.');
      }

      // Monto a pagar: monto + comisión (3%)
      const montoTotal = parseFloat(monto);
      if (isNaN(montoTotal) || montoTotal < 10) {
        throw new Error('El monto ingresado no es válido.');
      }
      const montoConComision = +(montoTotal).toFixed(2); // El backend calcula la comisión

      // Lógica de pago (puedes ajustar el memo/description según lo que acepte MiniKit)
      let pago;
      try {
        pago = await window.MiniKit.pay({
          amount: 0.001,
          description: `Pago creación para contrato (${tipo})`,
          currency: 'WDL',
        });
      } catch (err) {
        throw new Error('El pago fue cancelado o falló. No se creó el contrato.');
      }

      if (!pago || pago.status !== 'success') {
        throw new Error('El pago no fue exitoso. No se creó el contrato.');
      }

      // 2. Crear el contrato solo si el pago fue exitoso
      const response = await axios.post('/api/contracts', {
        tipo,
        monto: montoConComision,
        plazoEntrega,
        descripcion,
        condicionesEntrega,
        creadorWorldId: world_id,
        contraparteWorldId: contraparteId || undefined,
        pagoTx: pago.txHash || pago.transactionHash || null, // Guarda referencia de la transacción si existe
      });

      if (!response.data?.codigoVinculacion) {
        throw new Error('No se recibió un código de vinculación válido');
      }

      setContractData(response.data);
      setContractCreated(true);
    } catch (err) {
      console.error('Error creando contrato o pagando:', err);
      setError(err.response?.data?.error || err.message || 'Error al crear el contrato o pagar');
    } finally {
      setLoading(false);
    }
  };

  if (contractCreated && contractData?.codigoVinculacion) {
    return (
      <InfoScreen 
        title={<span style={{color:'#0A2E5A', fontWeight:700, fontSize: '1.6rem', letterSpacing:'-1px'}}>¡Contrato Creado Éxitosamente!</span>}
        code={contractData.codigoVinculacion}
        icon={<i className="bi bi-check-circle-fill" style={{color:'#00a878', fontSize: '2.6rem'}}></i>}
        description={<span style={{color:'#0A2E5A', fontWeight:500, fontSize:'1.05rem'}}>El contrato ha sido creado éxitosamente.</span>}
        actions={
          [
            {
              label: 'Ver mis contratos',
              icon: <i className="bi bi-list"></i>,
              variant: 'secondary',
              onClick: () => {
                  navigate('/contracts');
              }
            },
          ]
        }
      />
    );
  }

  const handleApproveWallet = async () => {
    setShowWalletMock(false);
    setLoading(true);
    setError(null);
    try {
      // ... (toda tu lógica de pago y guardado aquí)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error al crear el contrato o pagar');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRejectWallet = () => {
    setShowWalletMock(false);
    setError('El usuario rechazó la aprobación del pago. No se creó el contrato.');
  };

  return (
    <>
    {showWalletMock && (
      <WalletApprovalMock
        open={showWalletMock}
        onClose={handleRejectWallet}
        onApprove={handleApproveWallet}
        onReject={handleRejectWallet}
        amount={monto || 0}
        currency="WDL"
      />
    )}
    <div className="home-main">
      <div className="card shadow-sm m-3" style={{border: 'none', background: '#f9fafb'}}>
        <div className="card-body mx-2">
          <h2 className="card-title text-center mb-4 fs-4 fw-bold" style={{color:'#0A2E5A', letterSpacing:'-1px'}}>Crear Contrato</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-bold">Tipo de contrato</label>
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
              <label htmlFor="monto" className="form-label fw-bold" style={{color:'#0A2E5A'}}>Monto (WDL)</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-currency-dollar"></i></span>
                <input
                  type="number"
                  min="10"
                  max="1999"
                  step="0.01"
                  className="form-control fw-bold fs-6"
                  style={{background:'#f2f6fa', color:'#0A2E5A', border:'none', borderRadius:10, letterSpacing:'0.25em'}}
                  id="monto"
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
                    Comisión (3%): <b>{(parseFloat(monto)*0.03).toFixed(2)} WDL</b> &nbsp;|&nbsp; Recibirás: <b>{(parseFloat(monto)*0.97).toFixed(2)} WDL</b>
                  </span>
                </div>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="plazoEntrega" className="form-label fw-bold fs-6" style={{color:'#0A2E5A', fontSize:'1.1rem'}}>Fecha límite de entrega</label>
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
                      className="form-control fw-bold fs-6"
                      style={{background:'#f2f6fa', color:'#0A2E5A', border:'none', borderRadius:10}}
                      id="plazoEntrega"
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
              <label htmlFor="descripcion" className="form-label fw-bold fs-6" style={{color:'#0A2E5A', fontSize:'1.1rem'}}>Descripción</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-card-text"></i></span>
                <textarea
                  className="form-control fw-bold fs-7 text fw-normal"
                  style={{background:'#f2f6fa', color:'#0A2E5A', border:'none', borderRadius:10,}}
                  id="descripcion"
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  minLength={20}
                  rows={3}
                  required
                />
              </div>
            </div>
            <CondicionesEntregaInput value={condicionesEntrega} onChange={setCondicionesEntrega} disabled={loading} />
            <button type="submit" className="btn btn-primary btn-md w-100 d-flex align-items-center justify-content-center gap-2 py-3" disabled={loading || descripcion.length < 20 || !monto || isNaN(parseFloat(monto)) || parseFloat(monto) < 10 || parseFloat(monto) > 1999 || !tipo}>
              <i className="bi bi-plus-circle"></i> Crear contrato
            </button>
          </form>
          <div className="mt-2 mb-4" style={{backgroundColor: 'rgba(13, 110, 253, 0.08)', borderRadius: 8, padding: '8px 12px'}}>
            <div className="d-flex align-items-start">
              <i className="bi bi-info-circle me-2 mt-1 text-primary"></i>
              <span className="fs-7 text-dark" style={{textAlign: 'justify', lineHeight: '1.25', fontSize: '0.77em'}}>
                Cuando confirmes la creación del contrato, se descontará automáticamente una comisión del <b>3%</b> sobre el monto ingresado. Revisa bien los datos antes de continuar.
              </span>
            </div>
          </div>

          {/* Error message */}
          {/* {error && <div className="alert alert-danger mt-3 text-center">{error}</div>} */}
        </div>
      </div>
    </div>
  </>
  );
}
