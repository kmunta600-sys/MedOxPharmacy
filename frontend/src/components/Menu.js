import React from 'react';
import { Link } from 'react-router-dom';

const Menu = () => {
  return (
    <nav style={{
      background: '#1a1a2e',
      padding: '12px 20px',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px'
    }}>
      <Link to="/dashboard" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', padding: '8px 16px' }}>Dashboard</Link>
      <Link to="/products" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', padding: '8px 16px' }}>Add Product</Link>
      <Link to="/receive" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', padding: '8px 16px' }}>Receive</Link>
      <Link to="/dispense" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', padding: '8px 16px' }}>Dispense</Link>
      <Link to="/adjust" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', padding: '8px 16px' }}>Adjustment</Link>
      <Link to="/search" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', padding: '8px 16px' }}>Search</Link>
      <Link to="/quarantine" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', padding: '8px 16px' }}>Quarantine</Link>
      <Link to="/stockcard" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', padding: '8px 16px' }}>Stock Card</Link>
      <Link to="/settings" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', padding: '8px 16px' }}>Settings</Link>
    </nav>
  );
};

export default Menu;



