import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ErrorBoundary from '../components/ErrorBoundary';

const MainLayout = () => (
  <div>
    <ErrorBoundary>
      <Navbar />
      <Outlet />
    </ErrorBoundary>
  </div>
);

export default MainLayout;