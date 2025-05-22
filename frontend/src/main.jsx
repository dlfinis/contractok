import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import MiniKitProvider from "./providers/MiniKitProvider";

if (import.meta.env.MODE === "development") {
  const eruda = await import("eruda");
  // eruda.default.init();
  //Mock temporal de MiniKit para pruebas locales
  if (!window.MiniKit) {
    window.MiniKit = {
      pay: async ({ amount, description, currency }) => {
        console.log('[MOCK MiniKit] Pago simulado:', { amount, description, currency });
        await new Promise(res => setTimeout(res, 800));
        return { status: 'success', txHash: 'MOCK_TX_HASH_' + Math.random().toString(36).slice(2,10) };
      }
    };
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <MiniKitProvider>
        <App />
      </MiniKitProvider>
    </BrowserRouter>
  </React.StrictMode>
);
