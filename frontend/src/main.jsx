import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { MiniKitProvider } from '@worldcoin/minikit-js/minikit-provider';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MiniKitProvider>
      <App />
    </MiniKitProvider>
  </React.StrictMode>
);
