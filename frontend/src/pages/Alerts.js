import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Dashboard.css';

const Alerts = () => {
    const navigate = useNavigate();
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const rowRefs = useRef([]);

    useEffect(() => {
        loadAlerts();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (alerts.length === 0) return;
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => {
                    const newIndex = Math.min(prev + 1, alerts.length - 1);
                    scrollToRow(newIndex);
                    return newIndex;
                });
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => {
                    const newIndex = Math.max(prev - 1, 0);
                    scrollToRow(newIndex);
                    return newIndex;
                });
            } else if (e.key === 'Home') {
                e.preventDefault();
                setSelectedIndex(0);
                scrollToRow(0);
            } else if (e.key === 'End') {
                e.preventDefault();
                setSelectedIndex(alerts.length - 1);
                scrollToRow(alerts.length - 1);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [alerts]);

    const scrollToRow = (index) => {
        if (rowRefs.current[index]) {
            rowRefs.current[index].scrollIntoView({
                block: 'nearest',
                behavior: 'smooth'
            });
        }
    };

    const loadAlerts = async () => {
        setLoading(true);
        try {
            const response = await api.get('/products');
            if (response.data.success) {
                const products = response.data.data || [];
                const alertsData = [];
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                products.forEach(product => {
                    if (product.expiryDate) {
                        const expiry = new Date(product.expiryDate);
                        const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
                        
                        if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0) {
                            let severity = 'warning';
                            if (daysUntilExpiry <= 7) severity = 'critical';
                            else if (daysUntilExpiry <= 14) severity = 'urgent';
                            
                            alertsData.push({
                                id: `expiry-${product._id}`,
                                type: 'expiry',
                                severity: severity,
                                product: product.name,
                                message: `Expires in ${daysUntilExpiry} days`,
                                date: product.expiryDate,
                                status: 'active'
                            });
                        }
                    }

                    if (product.quantityOnHand === 0) {
                        alertsData.push({
                            id: `stock-${product._id}`,
                            type: 'stock',
                            severity: 'critical',
                            product: product.name,
                            message: 'Out of stock',
                            date: new Date().toISOString(),
                            status: 'active'
                        });
                    } else if (product.quantityOnHand < 10) {
                        alertsData.push({
                            id: `stock-${product._id}`,
                            type: 'stock',
                            severity: 'warning',
                            product: product.name,
                            message: `Low stock: ${product.quantityOnHand} units remaining`,
                            date: new Date().toISOString(),
                            status: 'active'
                        });
                    }
                });

                setAlerts(alertsData);
            } else {
                setAlerts(getMockAlerts());
            }
        } catch (err) {
            console.log('Using mock alerts data');
            setAlerts(getMockAlerts());
        } finally {
            setLoading(false);
        }
    };

    const getMockAlerts = () => {
        return [
            { id: 1, type: 'stock', severity: 'critical', product: 'paracetamal', message: 'Out of stock', date: new Date().toISOString(), status: 'active' },
            { id: 2, type: 'expiry', severity: 'warning', product: 'Test-Ibuprofen', message: 'Expires in 21 days', date: '2026-07-31', status: 'active' },
            { id: 3, type: 'expiry', severity: 'warning', product: 'para', message: 'Expires in 22 days', date: '2026-08-01', status: 'active' },
            { id: 4, type: 'expiry', severity: 'warning', product: 'paracetamal', message: 'Expires in 22 days', date: '2026-08-01', status: 'active' },
            { id: 5, type: 'expiry', severity: 'urgent', product: 'paracetamal', message: 'Expires in 19 days', date: '2026-07-29', status: 'active' },
        ];
    };

    const getSeverityColor = (severity) => {
        const colors = {
            'critical': '#EF4444',
            'urgent': '#F59E0B',
            'warning': '#D69E2E',
            'info': '#3B82F6'
        };
        return colors[severity] || '#6B7280';
    };

    const getSeverityBadge = (severity) => {
        const badges = {
            'critical': 'Critical',
            'urgent': 'Urgent',
            'warning': 'Warning',
            'info': 'Info'
        };
        return badges[severity] || severity;
    };

    // SVG Icons
    const BackIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
        </svg>
    );

    const BellIcon = () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D69E2E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
    );

    const ExpiryIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
        </svg>
    );

    const StockIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <line x1="16" y1="21" x2="16" y2="17"/>
            <line x1="8" y1="21" x2="8" y2="17"/>
            <line x1="2" y1="11" x2="22" y2="11"/>
        </svg>
    );

    const CriticalIcon = () => (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
    );

    const UrgentIcon = () => (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v4"/>
            <path d="M12 17h.01"/>
            <circle cx="12" cy="12" r="10"/>
        </svg>
    );

    const WarningIcon = () => (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D69E2E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v4"/>
            <path d="M12 17h.01"/>
            <circle cx="12" cy="12" r="10"/>
        </svg>
    );

    const getSeverityIcon = (severity) => {
        if (severity === 'critical') return <CriticalIcon />;
        if (severity === 'urgent') return <UrgentIcon />;
        return <WarningIcon />;
    };

    const getTypeIcon = (type) => {
        if (type === 'expiry') return <ExpiryIcon />;
        return <StockIcon />;
    };

    const filteredAlerts = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter);

    return (
        <div className="dashboard-container">
            <div className="dashboard-main" style={{ marginLeft: '0', padding: '30px' }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px',
                    flexWrap: 'wrap',
                    gap: '12px'
                }}>
                    <div>
                        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#FFFFFF', margin: '0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <BellIcon />
                            Alerts
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px', margin: '0' }}>
                            System alerts and notifications
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{
                            padding: '8px 16px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '8px',
                            color: 'rgba(255,255,255,0.4)',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontFamily: 'inherit',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                            e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                            e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
                        }}
                    >
                        <BackIcon /> Back to Dashboard
                    </button>
                </div>

                {/* Filters */}
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '20px',
                    flexWrap: 'wrap'
                }}>
                    <button
                        onClick={() => setFilter('all')}
                        style={{
                            padding: '6px 16px',
                            background: filter === 'all' ? 'rgba(214,158,46,0.15)' : 'rgba(255,255,255,0.04)',
                            border: filter === 'all' ? '1px solid rgba(214,158,46,0.2)' : '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '20px',
                            color: filter === 'all' ? '#D69E2E' : 'rgba(255,255,255,0.3)',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontFamily: 'inherit',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        All ({alerts.length})
                    </button>
                    <button
                        onClick={() => setFilter('critical')}
                        style={{
                            padding: '6px 16px',
                            background: filter === 'critical' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)',
                            border: filter === 'critical' ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '20px',
                            color: filter === 'critical' ? '#EF4444' : 'rgba(255,255,255,0.3)',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontFamily: 'inherit',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        <CriticalIcon /> Critical
                    </button>
                    <button
                        onClick={() => setFilter('urgent')}
                        style={{
                            padding: '6px 16px',
                            background: filter === 'urgent' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)',
                            border: filter === 'urgent' ? '1px solid rgba(245,158,11,0.2)' : '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '20px',
                            color: filter === 'urgent' ? '#F59E0B' : 'rgba(255,255,255,0.3)',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontFamily: 'inherit',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        <UrgentIcon /> Urgent
                    </button>
                    <button
                        onClick={() => setFilter('warning')}
                        style={{
                            padding: '6px 16px',
                            background: filter === 'warning' ? 'rgba(214,158,46,0.15)' : 'rgba(255,255,255,0.04)',
                            border: filter === 'warning' ? '1px solid rgba(214,158,46,0.2)' : '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '20px',
                            color: filter === 'warning' ? '#D69E2E' : 'rgba(255,255,255,0.3)',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontFamily: 'inherit',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        <WarningIcon /> Warning
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.05)' }}>
                        Loading alerts...
                    </div>
                ) : filteredAlerts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
                        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.1)' }}>No alerts found</p>
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.05)' }}>Everything is looking good!</p>
                    </div>
                ) : (
                    <div style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.04)',
                        borderRadius: '12px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            maxHeight: '500px',
                            overflowY: 'auto',
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'rgba(255,255,255,0.05) transparent'
                        }}>
                            <style>
                                {`
                                    div::-webkit-scrollbar {
                                        width: 4px;
                                        height: 4px;
                                    }
                                    div::-webkit-scrollbar-track {
                                        background: transparent;
                                    }
                                    div::-webkit-scrollbar-thumb {
                                        background: rgba(255,255,255,0.05);
                                        border-radius: 4px;
                                    }
                                    div::-webkit-scrollbar-thumb:hover {
                                        background: rgba(255,255,255,0.1);
                                    }
                                `}
                            </style>
                            
                            {filteredAlerts.map((alert, index) => {
                                const severityColor = getSeverityColor(alert.severity);
                                const isSelected = index === selectedIndex;
                                return (
                                    <div
                                        key={alert.id}
                                        ref={el => rowRefs.current[index] = el}
                                        style={{
                                            padding: '14px 20px',
                                            borderBottom: '1px solid rgba(255,255,255,0.03)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '16px',
                                            transition: 'all 0.15s',
                                            background: isSelected ? 'rgba(214,158,46,0.08)' : 'transparent',
                                            borderLeft: isSelected ? '2px solid #D69E2E' : '2px solid transparent'
                                        }}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                        onMouseLeave={() => setSelectedIndex(-1)}
                                    >
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: severityColor + '20',
                                            flexShrink: 0
                                        }}>
                                            {getTypeIcon(alert.type)}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                flexWrap: 'wrap'
                                            }}>
                                                <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: '500' }}>
                                                    {alert.product}
                                                </span>
                                                <span style={{
                                                    padding: '2px 12px',
                                                    borderRadius: '12px',
                                                    fontSize: '10px',
                                                    background: severityColor + '20',
                                                    color: severityColor,
                                                    border: '1px solid ' + severityColor + '30',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                    {getSeverityIcon(alert.severity)}
                                                    {getSeverityBadge(alert.severity)}
                                                </span>
                                                <span style={{
                                                    padding: '2px 12px',
                                                    borderRadius: '12px',
                                                    fontSize: '10px',
                                                    background: 'rgba(255,255,255,0.04)',
                                                    color: 'rgba(255,255,255,0.3)',
                                                    border: '1px solid rgba(255,255,255,0.06)'
                                                }}>
                                                    {alert.type}
                                                </span>
                                            </div>
                                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginTop: '2px' }}>
                                                {alert.message}
                                            </div>
                                        </div>
                                        <div style={{
                                            fontSize: '11px',
                                            color: 'rgba(255,255,255,0.15)',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {new Date(alert.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Alerts;
