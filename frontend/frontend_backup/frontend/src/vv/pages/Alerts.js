import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/styles.css';
import api from '../services/api';

const Icons = {
    Back: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
        </svg>
    ),
    Pharmacy: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D69E2E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
        </svg>
    ),
    Empty: () => (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
    )
};

const Alerts = () => {
    const navigate = useNavigate();
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/products');
            if (response.data && response.data.success) {
                const products = response.data.data;
                const alertItems = [];
                
                products.forEach(p => {
                    if (p.quantityOnHand === 0) {
                        alertItems.push({
                            id: p._id,
                            type: 'critical',
                            name: p.name,
                            code: p.code || 'N/A',
                            quantity: 0,
                            status: 'Out of Stock',
                            icon: '🔥',
                            gradient: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.05))',
                            color: '#EF4444'
                        });
                    } else if (p.quantityOnHand <= 10) {
                        alertItems.push({
                            id: p._id,
                            type: 'low',
                            name: p.name,
                            code: p.code || 'N/A',
                            quantity: p.quantityOnHand,
                            status: 'Running Low',
                            icon: '⚡',
                            gradient: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.05))',
                            color: '#F59E0B'
                        });
                    } else {
                        alertItems.push({
                            id: p._id,
                            type: 'ok',
                            name: p.name,
                            code: p.code || 'N/A',
                            quantity: p.quantityOnHand,
                            status: 'In Stock',
                            icon: '✅',
                            gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.03))',
                            color: '#10B981'
                        });
                    }
                });
                
                setAlerts(alertItems);
            }
        } catch (error) {
            console.error('Error fetching alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        critical: alerts.filter(a => a.type === 'critical').length,
        low: alerts.filter(a => a.type === 'low').length,
        ok: alerts.filter(a => a.type === 'ok').length
    };

    const filteredAlerts = filter === 'all' ? alerts : alerts.filter(a => a.type === filter);

    return (
        <div className="alerts-stunning">
            <div className="alerts-stunning-bg"></div>
            
            <header className="alerts-stunning-header">
                <div className="alerts-stunning-left">
                    <Icons.Pharmacy />
                    <span className="alerts-stunning-brand">MedOx <span className="gold">Pharmacy</span></span>
                </div>
                <div className="alerts-stunning-right">
                    <button className="alerts-stunning-back" onClick={() => navigate('/dashboard')}>
                        <Icons.Back /> Back
                    </button>
                </div>
            </header>

            <div className="alerts-stunning-content">
                <div className="alerts-stunning-container">
                    <div className="alerts-stunning-top">
                        <div>
                            <h1>Inventory Alerts</h1>
                            <p>Live monitoring of your stock levels</p>
                        </div>
                        <div className="alerts-stunning-time">
                            <span className="time-dot"></span>
                            Live Updates
                        </div>
                    </div>

                    <div className="alerts-stunning-stats">
                        <div className="stunning-stat critical" onClick={() => setFilter('critical')}>
                            <div className="stunning-stat-icon">🔥</div>
                            <div>
                                <span className="stunning-stat-number">{stats.critical}</span>
                                <span className="stunning-stat-label">Critical</span>
                            </div>
                            <div className="stunning-stat-bar" style={{ width: stats.critical > 0 ? '100%' : '0%' }}></div>
                        </div>
                        <div className="stunning-stat low" onClick={() => setFilter('low')}>
                            <div className="stunning-stat-icon">⚡</div>
                            <div>
                                <span className="stunning-stat-number">{stats.low}</span>
                                <span className="stunning-stat-label">Low Stock</span>
                            </div>
                            <div className="stunning-stat-bar" style={{ width: stats.low > 0 ? '100%' : '0%' }}></div>
                        </div>
                        <div className="stunning-stat ok" onClick={() => setFilter('ok')}>
                            <div className="stunning-stat-icon">✅</div>
                            <div>
                                <span className="stunning-stat-number">{stats.ok}</span>
                                <span className="stunning-stat-label">In Stock</span>
                            </div>
                            <div className="stunning-stat-bar" style={{ width: '100%' }}></div>
                        </div>
                    </div>

                    <div className="alerts-stunning-filters">
                        <button className={`stunning-filter ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                            All
                            <span className="filter-count">{alerts.length}</span>
                        </button>
                        <button className={`stunning-filter ${filter === 'critical' ? 'active' : ''}`} onClick={() => setFilter('critical')}>
                            Critical
                            <span className="filter-count">{stats.critical}</span>
                        </button>
                        <button className={`stunning-filter ${filter === 'low' ? 'active' : ''}`} onClick={() => setFilter('low')}>
                            Low Stock
                            <span className="filter-count">{stats.low}</span>
                        </button>
                        <button className={`stunning-filter ${filter === 'ok' ? 'active' : ''}`} onClick={() => setFilter('ok')}>
                            In Stock
                            <span className="filter-count">{stats.ok}</span>
                        </button>
                    </div>

                    <div className="alerts-stunning-list">
                        {loading ? (
                            <div className="stunning-loading">Loading alerts...</div>
                        ) : filteredAlerts.length === 0 ? (
                            <div className="stunning-empty">No alerts for this category</div>
                        ) : (
                            filteredAlerts.map((alert, index) => (
                                <div 
                                    key={alert.id} 
                                    className="stunning-alert"
                                    style={{ 
                                        background: alert.gradient,
                                        borderColor: alert.color,
                                        animationDelay: `${index * 0.05}s`
                                    }}
                                    onClick={() => navigate(`/stock-card/${alert.id}`)}
                                >
                                    <div className="stunning-alert-left">
                                        <span className="stunning-alert-icon">{alert.icon}</span>
                                        <div>
                                            <div className="stunning-alert-name">{alert.name}</div>
                                            <div className="stunning-alert-code">{alert.code}</div>
                                        </div>
                                    </div>
                                    <div className="stunning-alert-center">
                                        <span className="stunning-alert-qty">{alert.quantity}</span>
                                        <span className="stunning-alert-unit">units</span>
                                    </div>
                                    <div className="stunning-alert-right">
                                        <span className="stunning-alert-status" style={{ color: alert.color }}>
                                            {alert.status}
                                        </span>
                                        <span className="stunning-alert-arrow">→</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Alerts;
