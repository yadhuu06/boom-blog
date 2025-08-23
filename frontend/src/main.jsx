import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AppRoutes from "./routes/AppRoutes";
import "./index.css";

// Get the root element from the HTML
const container = document.getElementById("root");

// Create a root using React 18 API
const root = createRoot(container);

// Render the app inside StrictMode
root.render(
  <StrictMode>
    <AppRoutes />
  </StrictMode>
);
