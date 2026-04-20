import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import { setupAppUpdateSync } from "./lib/updateManager";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


window.addEventListener("load", () => {
  window.setTimeout(() => {
    document.getElementById("app-boot-splash")?.classList.add("is-hidden");
  }, 700);
});


setupAppUpdateSync();
