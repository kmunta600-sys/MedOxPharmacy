import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/AddProduct';
import Stock from './pages/Stock';
import DispenseStock from './pages/DispenseStock';
import ReceiveStock from './pages/ReceiveStock';
import StockAdjustment from './pages/StockAdjustment';
import Settings from './pages/Settings';
import Landing from './pages/Landing';
import './index.css';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
        <Route path="/stock" element={<ProtectedRoute><Stock /></ProtectedRoute>} />
        <Route path="/dispense" element={<ProtectedRoute><DispenseStock /></ProtectedRoute>} />
        <Route path="/receive" element={<ProtectedRoute><ReceiveStock /></ProtectedRoute>} />
        <Route path="/adjust" element={<ProtectedRoute><StockAdjustment /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
