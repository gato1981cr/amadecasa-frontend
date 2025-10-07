import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // si no existe, puedes omitir esta línea

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
