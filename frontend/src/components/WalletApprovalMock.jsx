import React from "react";

/**
 * Mock visual para simular la aprobación de una transacción de wallet.
 * Aparece como una tarjeta centrada encima de todo, pero NO ocupa toda la pantalla.
 * Props:
 *   open: boolean (si se muestra)
 *   onClose: función para cerrar
 *   amount: monto a aprobar
 *   currency: string (opcional, default 'WDL')
 */
export default function WalletApprovalMock({ open, onClose, amount, currency = "WDL", onApprove, onReject }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      zIndex: 2000,
      pointerEvents: "none"
    }}>
      <div
        style={{
          position: "absolute",
          top: "20vh",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#fff",
          borderRadius: 14,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          padding: 28,
          minWidth: 340,
          maxWidth: "90vw",
          textAlign: "center",
          pointerEvents: "auto"
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 8,
            right: 14,
            background: "none",
            border: "none",
            fontSize: 22,
            cursor: "pointer"
          }}
          aria-label="Cerrar"
        >×</button>
        <div style={{ fontSize: 48, marginBottom: 10 }}>🔐</div>
        <h3 style={{ margin: "12px 0 8px 0" }}>Aprobar transacción</h3>
        <div style={{ color: "#333", fontWeight: 500, marginBottom: 10 }}>
          Debes aprobar la transacción de pago en tu wallet
        </div>
        <div style={{ fontSize: 18, margin: "10px 0", color: "#444" }}>
          <span style={{ fontWeight: 600 }}>{amount}</span> {currency}
        </div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 18 }}>
          <button
            type="button"
            className="btn btn-success"
            style={{ minWidth: 90, fontWeight: 600 }}
            onClick={onApprove}
          >Aprobar</button>
          <button
            type="button"
            className="btn btn-outline-danger"
            style={{ minWidth: 90, fontWeight: 600 }}
            onClick={onReject || onClose}
          >Rechazar</button>
        </div>
      </div>
    </div>
  );
}
