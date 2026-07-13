import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import AddProduct from './pages/AddProduct';
import ReceiveStock from './pages/ReceiveStock';
import DispenseStock from './pages/DispenseStock';
import StockAdjustment from './pages/StockAdjustment';
import SearchProducts from './pages/SearchProducts';
import Quarantine from './pages/Quarantine';
import StockCard from './pages/StockCard';
import Settings from './pages/Settings';
import Activity from './pages/Activity';
import Alerts from './pages/Alerts';
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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
        <Route path="/receive" element={<ProtectedRoute><ReceiveStock /></ProtectedRoute>} />
        <Route path="/dispense" element={<ProtectedRoute><DispenseStock /></ProtectedRoute>} />
        <Route path="/adjust" element={<ProtectedRoute><StockAdjustment /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><SearchProducts /></ProtectedRoute>} />
        <Route path="/quarantine" element={<ProtectedRoute><Quarantine /></ProtectedRoute>} />
        <Route path="/stockcard" element={<ProtectedRoute><StockCard /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/activity" element={<ProtectedRoute><Activity /></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
