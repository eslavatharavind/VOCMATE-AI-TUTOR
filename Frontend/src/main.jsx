// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css"

// Custom modal replacement for window.alert
if (typeof window !== "undefined") {
  window.alert = function (message) {
    let modal = document.getElementById("custom-alert-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "custom-alert-modal";
      modal.className = "custom-alert-modal-overlay";
      modal.innerHTML = `
        <div class="custom-alert-modal-box">
          <div class="custom-alert-modal-content">
            <span class="custom-alert-modal-icon">🎯</span>
            <p id="custom-alert-modal-text"></p>
          </div>
          <button class="custom-alert-modal-btn">Dismiss</button>
        </div>
      `;
      document.body.appendChild(modal);
      
      const closeBtn = modal.querySelector(".custom-alert-modal-btn");
      closeBtn.addEventListener("click", () => {
        modal.classList.remove("active");
      });
    }
    
    document.getElementById("custom-alert-modal-text").innerText = message;
    setTimeout(() => {
      modal.classList.add("active");
    }, 10);
  };
}


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
