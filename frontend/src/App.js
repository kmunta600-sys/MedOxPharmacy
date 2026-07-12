import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Landing from './pages/Landing';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
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
import About from './pages/About';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/add-product" element={<AddProduct />} />
                <Route path="/receive" element={<ReceiveStock />} />
                <Route path="/dispense" element={<DispenseStock />} />
                <Route path="/adjustment" element={<StockAdjustment />} />
                <Route path="/stock-adjustment" element={<StockAdjustment />} />
                <Route path="/search" element={<SearchProducts />} />
                <Route path="/quarantine" element={<Quarantine />} />
                <Route path="/stock-card" element={<StockCard />} />
                <Route path="/stock-card/:productId" element={<StockCard />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/about" element={<About />} />
                <Route path="/activity" element={<Activity />} />
                <Route path="/alerts" element={<Alerts />} />
            </Routes>
        </Router>
    );
}

export default App;