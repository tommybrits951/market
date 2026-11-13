import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import MarketProvider from "./context/MarketProvider.jsx";
import { BrowserRouter } from "react-router";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MarketProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MarketProvider>
  </StrictMode>,
);
