import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Dashboard.css';

const Activity = () => {
    const navigate = useNavigate();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const tableRef = useRef(null);
    const rowRefs = useRef([]);

    useEffect(() => {
        loadActivities();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (activities.length === 0) return;
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => {
                    const newIndex = Math.min(prev + 1, activities.length - 1);
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
                setSelectedIndex(activities.length - 1);
                scrollToRow(activities.length - 1);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [activities]);

    const scrollToRow = (index) => {
        if (rowRefs.current[index]) {
            rowRefs.current[index].scrollIntoView({
                block: 'nearest',
                behavior: 'smooth'
            });
        }
    };

    const loadActivities = async () => {
        setLoading(true);
        try {
            const response = await api.get('/stock/transactions');
            if (response.data.success) {
                const transactions = response.data.data || [];
                const formatted = transactions.map(t => ({
                    id: t._id,
                    action: t.remarks || `${t.type} ${t.productName}`,
                    date: t.createdAt || t.date,
                    status: 'completed',
                    type: t.type,
                    quantity: t.quantity,
                    product: t.productName
                }));
                setActivities(formatted);
            } else {
                setActivities(getMockActivities());
            }
        } catch (err) {
            console.log('Using mock activity data');
            setActivities(getMockActivities());
        } finally {
            setLoading(false);
        }
    };

    const getMockActivities = () => {
        return [
            { id: 1, action: 'Adjusted paracetamal (5 units)', date: '2026-07-08T11:17:48', status: 'completed' },
            { id: 2, action: 'Adjusted FULL-STOCK-CARD-DEMO (7 units)', date: '2026-07-08T09:18:54', status: 'completed' },
            { id: 3, action: 'Adjusted FULL-STOCK-CARD-DEMO (8 units)', date: '2026-07-08T09:18:53', status: 'completed' },
            { id: 4, action: 'Adjusted FULL-STOCK-CARD-DEMO (15 units)', date: '2026-07-08T09:18:53', status: 'completed' },
            { id: 5, action: 'Adjusted DEMO-STOCK-CARD-PRODUCT (5 units)', date: '2026-07-08T09:07:16', status: 'completed' },
        ];
    };

    // SVG Icons
    const BackIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
        </svg>
    );

    const ActivityIcon = () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D69E2E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
    );

    const CheckIcon = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
        </svg>
    );

    const CalendarIcon = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
    );

    const getTypeColor = (type) => {
        const colors = {
            'positive': '#10B981',
            'negative': '#EF4444',
            'loss': '#F59E0B',
            'adjustment': '#D69E2E',
            'quarantine': '#8B5CF6',
            'release': '#3B82F6'
        };
        return colors[type?.toLowerCase()] || '#6B7280';
    };

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
                            <ActivityIcon />
                            Recent Activity
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px', margin: '0' }}>
                            All system activity and transactions
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

                {error && (
                    <div style={{
                        padding: '10px 16px',
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: '8px',
                        color: '#EF4444',
                        fontSize: '13px',
                        marginBottom: '16px'
                    }}>
                        {error}
                    </div>
                )}

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.05)' }}>
                        Loading activities...
                    </div>
                ) : activities.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                        <p>No activities found</p>
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div style={{
                            display: 'flex',
                            gap: '16px',
                            marginBottom: '20px',
                            flexWrap: 'wrap'
                        }}>
                            <div style={{
                                padding: '12px 20px',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.04)',
                                borderRadius: '8px',
                                flex: '1',
                                minWidth: '80px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '24px', fontWeight: '700', color: '#D69E2E' }}>
                                    {activities.length}
                                </div>
                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>Total</div>
                            </div>
                            <div style={{
                                padding: '12px 20px',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.04)',
                                borderRadius: '8px',
                                flex: '1',
                                minWidth: '80px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '24px', fontWeight: '700', color: '#10B981' }}>
                                    {activities.filter(a => a.type?.toLowerCase() === 'positive' || a.type?.toLowerCase() === 'adjustment').length}
                                </div>
                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>Additions</div>
                            </div>
                            <div style={{
                                padding: '12px 20px',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.04)',
                                borderRadius: '8px',
                                flex: '1',
                                minWidth: '80px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '24px', fontWeight: '700', color: '#EF4444' }}>
                                    {activities.filter(a => a.type?.toLowerCase() === 'negative' || a.type?.toLowerCase() === 'loss').length}
                                </div>
                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>Removals</div>
                            </div>
                            <div style={{
                                padding: '12px 20px',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.04)',
                                borderRadius: '8px',
                                flex: '1',
                                minWidth: '80px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '24px', fontWeight: '700', color: '#3B82F6' }}>
                                    {activities.filter(a => a.type?.toLowerCase() === 'quarantine' || a.type?.toLowerCase() === 'release').length}
                                </div>
                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>Quarantine</div>
                            </div>
                        </div>

                        {/* Scrollable Table Container */}
                        <div style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.04)',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            position: 'relative'
                        }}>
                            {/* Custom Scroll Container */}
                            <div ref={tableRef} style={{
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
                                
                                <table style={{
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    fontSize: '13px'
                                }}>
                                    <thead>
                                        <tr style={{
                                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                                            background: 'rgba(255,255,255,0.02)',
                                            position: 'sticky',
                                            top: 0,
                                            zIndex: 10
                                        }}>
                                            <th style={{ padding: '14px 16px', textAlign: 'left', color: 'rgba(255,255,255,0.2)', fontWeight: '500' }}>
                                                Activity
                                            </th>
                                            <th style={{ padding: '14px 16px', textAlign: 'left', color: 'rgba(255,255,255,0.2)', fontWeight: '500' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <CalendarIcon /> Date
                                                </span>
                                            </th>
                                            <th style={{ padding: '14px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontWeight: '500' }}>
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activities.map((activity, index) => {
                                            const typeColor = getTypeColor(activity.type);
                                            const isSelected = index === selectedIndex;
                                            return (
                                                <tr
                                                    key={activity.id}
                                                    ref={el => rowRefs.current[index] = el}
                                                    style={{
                                                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                                                        transition: 'all 0.15s',
                                                        background: isSelected ? 'rgba(214,158,46,0.08)' : 'transparent',
                                                        borderLeft: isSelected ? '2px solid #D69E2E' : '2px solid transparent'
                                                    }}
                                                    onMouseEnter={() => setSelectedIndex(index)}
                                                    onMouseLeave={() => setSelectedIndex(-1)}
                                                >
                                                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.7)' }}>
                                                        {activity.action}
                                                        {activity.type && (
                                                            <span style={{
                                                                marginLeft: '8px',
                                                                padding: '2px 10px',
                                                                borderRadius: '12px',
                                                                fontSize: '10px',
                                                                background: typeColor + '20',
                                                                color: typeColor,
                                                                border: '1px solid ' + typeColor + '30'
                                                            }}>
                                                                {activity.type}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.3)' }}>
                                                        {new Date(activity.date).toLocaleString()}
                                                    </td>
                                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                        <span style={{
                                                            padding: '2px 12px',
                                                            borderRadius: '12px',
                                                            fontSize: '11px',
                                                            background: 'rgba(16,185,129,0.1)',
                                                            color: '#10B981',
                                                            border: '1px solid rgba(16,185,129,0.2)',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px'
                                                        }}>
                                                            <CheckIcon /> {activity.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Activity;
