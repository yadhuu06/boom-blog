import React from "react"; // Required for older setups or if JSX transform is not enabled
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux"; // For Redux store
import AppRoutes from "./routes/AppRoutes";
import store from "./store/store"; 
import "./index.css";
import { Toaster } from 'react-hot-toast';
// Get the root element from the HTML
const container = document.getElementById("root");

// Create a root using React 18 API
const root = createRoot(container);

// Render the app inside StrictMode with Redux Provider
root.render(
  <StrictMode>
    <Toaster position="top-right" reverseOrder={false} />
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  </StrictMode>
);
