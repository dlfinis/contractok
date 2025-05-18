import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import MiniKitProvider from "./providers/MiniKitProvider";

if (import.meta.env.MODE === "development") {
  const eruda = await import("eruda");
  eruda.default.init();
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MiniKitProvider>
      <App />
    </MiniKitProvider>
  </React.StrictMode>
);
