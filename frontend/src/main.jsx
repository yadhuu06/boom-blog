import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import AppRoutes from "./routes/AppRoutes";
import store from "./store/store"; 
import "./index.css";
import { Toaster } from 'react-hot-toast';

const container = document.getElementById("root");

const root = createRoot(container);

root.render(
  <StrictMode>
    <Toaster position="top-right" reverseOrder={false} />
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  </StrictMode>
);
