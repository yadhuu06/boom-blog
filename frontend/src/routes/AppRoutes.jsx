import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react"; 
import App from "../App";
import UsersPage from "../features/users/pages/UsersPage";
import { LoginPage } from "../features/users/pages/LoginPage";

const AppRoutes = () => (
  <BrowserRouter> 
    <Routes>
      <Route path= "/" element={<LoginPage/>}/>
      <Route path="/users" element={<UsersPage />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;