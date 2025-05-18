import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import MiniKitProvider from "./providers/MiniKitProvider";

if (import.meta.env.MODE === "development") {
  const eruda = await import("eruda");
  eruda.default.init();
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
