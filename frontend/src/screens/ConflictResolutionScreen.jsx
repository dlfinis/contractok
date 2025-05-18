import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function ConflictResolutionScreen() {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [arbitrationType, setArbitrationType] = useState('ia');
  const [showArbitrationModal, setShowArbitrationModal] = useState(false);
  const [arbitrationFee, setArbitrationFee] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate arbitration fee (0.5% per $50, max 5%)
  const calculateArbitrationFee = (amount) => {
    const percentage = Math.min(Math.floor(amount / 50) * 0.5, 5);
    return (amount * percentage) / 100;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch contract details
        const contractRes = await axios.get(`/api/contracts/${contractId}`);
        setContract(contractRes.data);
        
        // Calculate arbitration fee
        const fee = calculateArbitrationFee(contractRes.data.monto);
        setArbitrationFee(fee);
        
        // Fetch messages
        const messagesRes = await axios.get(`/api/contracts/${contractId}/messages`);
        setMessages(messagesRes.data);
        
        // Fetch wallet balance
        const walletRes = await axios.get('/api/wallet/balance');
        setWalletBalance(walletRes.data.balance);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('No se pudo cargar la información del conflicto');
        toast.error('Error al cargar el conflicto');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [contractId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    try {
      const newMessage = {
        id: Date.now(), // Temporary ID
        content: message,
        sender: 'currentUser', // Replace with actual user ID
        timestamp: new Date().toISOString(),
        isTemporary: true
      };
      
      setMessages([...messages, newMessage]);
      setMessage('');
      
      // Send to API
      await axios.post(`/api/contracts/${contractId}/messages`, {
        content: message
      });
      
      // Refresh messages to get the actual data from the server
      const messagesRes = await axios.get(`/api/contracts/${contractId}/messages`);
      setMessages(messagesRes.data);
      
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Error al enviar el mensaje');
      
      // Remove temporary message if there was an error
      setMessages(messages.filter(m => !m.isTemporary));
    }
  };

  const handleStartArbitration = () => {
    setShowArbitrationModal(true);
  };

  const handleConfirmArbitration = async () => {
    if (arbitrationType === 'arbitros' && walletBalance < arbitrationFee) {
      toast.error('Saldo insuficiente para cubrir la tarifa de arbitraje');
      return;
    }
    
    setShowArbitrationModal(false);
    setShowConfirmModal(true);
  };

  const handleSubmitArbitration = async () => {
    try {
      setIsSubmitting(true);
      
      // Call API to start arbitration
      await axios.post(`/api/contracts/${contractId}/start-arbitration`, {
        type: arbitrationType,
        fee: arbitrationType === 'arbitros' ? arbitrationFee : 0
      });
      
      toast.success('Proceso de arbitraje iniciado correctamente');
      navigate(`/contracts/${contractId}`);
      
    } catch (err) {
      console.error('Error starting arbitration:', err);
      toast.error('Error al iniciar el arbitraje');
    } finally {
      setIsSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando conflicto...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
        <div className="text-center mt-3">
          <Link to="/contracts" className="btn btn-primary">
            <i className="bi bi-arrow-left me-2"></i>Volver a la lista de contratos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center mb-4">
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-outline-secondary me-3"
        >
          <i className="bi bi-arrow-left"></i>
        </button>
        <h2 className="mb-0">Resolución de Conflicto</h2>
      </div>
      
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">{contract?.nombre || 'Contrato sin nombre'}</h5>
          <span className="badge bg-danger">En Disputa</span>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <p><strong>Monto:</strong> ${parseFloat(contract?.monto || 0).toLocaleString()}</p>
              <p><strong>Fecha de creación:</strong> {new Date(contract?.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Contraparte:</strong> {contract?.contraparte?.nombre || 'No especificada'}</p>
              <p><strong>Estado:</strong> {contract?.estado || 'pendiente'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header bg-white">
          <h5 className="mb-0">Mensajes</h5>
        </div>
        <div 
          className="card-body" 
          style={{ 
            maxHeight: '400px', 
            overflowY: 'auto',
            backgroundColor: '#f8f9fa'
          }}
        >
          {messages.length === 0 ? (
            <div className="text-center text-muted py-4">
              <i className="bi bi-chat-square-text" style={{ fontSize: '2rem' }}></i>
              <p className="mt-2 mb-0">No hay mensajes aún. Sé el primero en comentar.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`mb-3 d-flex ${msg.sender === 'currentUser' ? 'justify-content-end' : 'justify-content-start'}`}
              >
                <div 
                  className={`p-3 rounded-3 ${msg.sender === 'currentUser' ? 'bg-primary text-white' : 'bg-white'}`}
                  style={{ maxWidth: '70%' }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <small className="fw-bold">
                      {msg.sender === 'currentUser' ? 'Tú' : contract?.contraparte?.nombre || 'Contraparte'}
                    </small>
                    <small className="ms-2">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </small>
                  </div>
                  <p className="mb-0">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="card-footer">
          <form onSubmit={handleSendMessage} className="d-flex">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Escribe tu mensaje..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSubmitting}
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={!message.trim() || isSubmitting}
            >
              <i className="bi bi-send-fill"></i>
            </button>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header bg-white">
          <h5 className="mb-0">Iniciar Proceso de Arbitraje</h5>
        </div>
        <div className="card-body">
          <p className="text-muted">
            Si no han podido llegar a un acuerdo, pueden iniciar un proceso de arbitraje. 
            Elija el tipo de arbitraje que prefiera:
          </p>
          
          <div className="row">
            <div className="col-md-6 mb-3">
              <div 
                className={`card h-100 ${arbitrationType === 'ia' ? 'border-primary' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => setArbitrationType('ia')}
              >
                <div className="card-body">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="arbitrationType"
                      id="arbitrationIA"
                      checked={arbitrationType === 'ia'}
                      onChange={() => setArbitrationType('ia')}
                    />
                    <label className="form-check-label fw-bold" htmlFor="arbitrationIA">
                      Arbitraje por IA
                    </label>
                  </div>
                  <div className="mt-2">
                    <p className="mb-1"><i className="bi bi-check-circle-fill text-success me-2"></i>Gratuito</p>
                    <p className="mb-1"><i className="bi bi-clock-fill text-warning me-2"></i>Resolución en 24 horas</p>
                    <p className="mb-0"><i className="bi bi-robot text-info me-2"></i>Análisis automático por IA</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-6 mb-3">
              <div 
                className={`card h-100 ${arbitrationType === 'arbitros' ? 'border-primary' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => setArbitrationType('arbitros')}
              >
                <div className="card-body">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="arbitrationType"
                      id="arbitrationHuman"
                      checked={arbitrationType === 'arbitros'}
                      onChange={() => setArbitrationType('arbitros')}
                    />
                    <label className="form-check-label fw-bold" htmlFor="arbitrationHuman">
                      Arbitraje con Especialistas
                    </label>
                  </div>
                  <div className="mt-2">
                    <p className="mb-1">
                      <i className="bi bi-cash-coin text-success me-2"></i>
                      Costo: ${arbitrationFee.toFixed(2)} ({(Math.min(Math.floor(contract?.monto / 50) * 0.5, 5)).toFixed(1)}% del monto)
                    </p>
                    <p className="mb-1"><i className="bi bi-people-fill text-primary me-2"></i>Revisión por expertos legales</p>
                    <p className="mb-0"><i className="bi bi-shield-check text-success me-2"></i>Resolución en 3-5 días hábiles</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="alert alert-info">
            <h6 className="alert-heading">¿Cómo se calcula la tarifa?</h6>
            <p className="mb-1">
              La tarifa de arbitraje con especialistas se calcula así:
            </p>
            <ul className="mb-0">
              <li>0.5% por cada $50 del monto del contrato</li>
              <li>Máximo del 5% del monto total</li>
              <li>Mínimo de $5</li>
            </ul>
            <p className="mt-2 mb-0">
              <strong>Ejemplo:</strong> Para un contrato de $1,000 la tarifa sería ${calculateArbitrationFee(1000).toFixed(2)} (1%)
            </p>
          </div>
          
          <div className="d-flex justify-content-end">
            <button 
              className="btn btn-primary"
              onClick={handleStartArbitration}
              disabled={isSubmitting}
            >
              <i className="bi bi-shield-lock me-2"></i>
              Iniciar Arbitraje
            </button>
          </div>
        </div>
      </div>

      {/* Arbitration Confirmation Modal */}
      <Modal show={showArbitrationModal} onHide={() => setShowArbitrationModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Arbitraje</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {arbitrationType === 'ia' ? (
            <>
              <p>¿Estás seguro de que deseas iniciar el arbitraje por IA?</p>
              <ul>
                <li>Este servicio es gratuito</li>
                <li>La resolución puede tardar hasta 24 horas</li>
                <li>La decisión de la IA será definitiva</li>
              </ul>
            </>
          ) : (
            <>
              <p>¿Estás seguro de que deseas iniciar el arbitraje con especialistas?</p>
              <ul>
                <li>Costo: <strong>${arbitrationFee.toFixed(2)}</strong></li>
                <li>Se descontará de tu billetera</li>
                <li>Saldo disponible: ${walletBalance.toFixed(2)}</li>
                <li>La resolución puede tardar de 3 a 5 días hábiles</li>
              </ul>
              {walletBalance < arbitrationFee && (
                <div className="alert alert-warning mt-3">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  No tienes suficiente saldo para cubrir la tarifa de arbitraje.
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowArbitrationModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleConfirmArbitration}
            disabled={arbitrationType === 'arbitros' && walletBalance < arbitrationFee}
          >
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Final Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => !isSubmitting && setShowConfirmModal(false)}>
        <Modal.Header closeButton={!isSubmitting}>
          <Modal.Title>Confirmar Pago</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isSubmitting ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Procesando...</span>
              </div>
              <p>Procesando tu solicitud de arbitraje...</p>
            </div>
          ) : (
            <>
              <p>Al confirmar, se realizará el cargo de <strong>${arbitrationFee.toFixed(2)}</strong> a tu billetera.</p>
              <p>¿Deseas continuar?</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowConfirmModal(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmitArbitration}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Procesando...' : 'Confirmar Pago'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
