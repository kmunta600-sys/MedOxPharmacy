import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/styles.css';
import api from '../services/api';

// Professional SVG Icons - No Emojis
const Icons = {
    Products: () => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D69E2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
    ),
    LowStock: () => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v4"/>
            <path d="M12 17h.01"/>
            <circle cx="12" cy="12" r="10"/>
        </svg>
    ),
    Critical: () => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
        </svg>
    ),
    Value: () => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 12h8"/>
            <path d="M12 8v8"/>
        </svg>
    ),
    Receive: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
            <polyline points="17 6 23 6 23 12"/>
        </svg>
    ),
    Issue: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
            <polyline points="17 18 23 18 23 12"/>
        </svg>
    ),
    Add: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
    ),
    Search: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
    ),
    Home: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg>
    ),
    Stock: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
    ),
    Alerts: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
    ),
    Reports: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20v-6M6 20V10M18 20V4"/>
        </svg>
    ),
    Logout: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
    ),
    Empty: () => (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
    ),
    Wave: () => (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D69E2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2a8 8 0 0 0-8 8v4a8 8 0 0 0 16 0V8a4 4 0 0 0-8 0v8"/>
            <path d="M6 12v4a8 8 0 0 0 16 0V8a4 4 0 0 0-8 0v8"/>
        </svg>
    )
};

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        totalProducts: 0,
        lowStock: 0,
        criticalStock: 0,
        totalValue: 0
    });
    const [loading, setLoading] = useState(true);
    const [greeting, setGreeting] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            setUser(userData);
        } catch (e) {
            console.error('Error parsing user:', e);
        }

        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 17) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');

        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/products/stats');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    const quickActions = [
        { icon: <Icons.Receive />, label: 'Receive Stock', path: '/receive', color: '#D69E2E' },
        { icon: <Icons.Issue />, label: 'Dispense Stock', path: '/dispense', color: '#10B981' },
        { icon: <Icons.Add />, label: 'Add Product', path: '/products', color: '#3B82F6' },
        { icon: <Icons.Search />, label: 'Search', path: '/search', color: '#8B5CF6' },
    ];

    return (
        <div className="dashboard-page">
            <div className="dashboard-glow-1"></div>
            <div className="dashboard-glow-2"></div>
            <div className="dashboard-grid"></div>

            <header className="dashboard-header">
                <div className="dashboard-brand">
                    <span className="dashboard-brand-icon">⚕️</span>
                    <span className="dashboard-brand-name">MedOx <span className="gold">Pharmacy</span></span>
                </div>
                <div className="dashboard-user">
                    <span className="dashboard-user-name">
                        {user?.firstName || user?.email || 'Pharmacist'}
                    </span>
                    <button className="dashboard-logout" onClick={handleLogout}>
                        <Icons.Logout />
                        Logout
                    </button>
                </div>
            </header>

            <main className="dashboard-main">
                <div className="dashboard-container">
                    <div className="dashboard-welcome">
                        <div>
                            <h1 className="dashboard-welcome-title">
                                {greeting}, {user?.firstName || 'Pharmacist'}
                            </h1>
                            <p className="dashboard-welcome-subtitle">
                                Here's your pharmacy overview
                            </p>
                        </div>
                        <div className="dashboard-date">
                            {new Date().toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </div>
                    </div>

                    <div className="dashboard-stats">
                        <div className="dashboard-stat-card">
                            <div className="dashboard-stat-icon"><Icons.Products /></div>
                            <div className="dashboard-stat-content">
                                <span className="dashboard-stat-number">
                                    {loading ? '...' : stats.totalProducts}
                                </span>
                                <span className="dashboard-stat-label">Total Products</span>
                            </div>
                        </div>
                        <div className="dashboard-stat-card">
                            <div className="dashboard-stat-icon"><Icons.LowStock /></div>
                            <div className="dashboard-stat-content">
                                <span className="dashboard-stat-number" style={{ color: '#F59E0B' }}>
                                    {loading ? '...' : stats.lowStock}
                                </span>
                                <span className="dashboard-stat-label">Low Stock</span>
                            </div>
                        </div>
                        <div className="dashboard-stat-card">
                            <div className="dashboard-stat-icon"><Icons.Critical /></div>
                            <div className="dashboard-stat-content">
                                <span className="dashboard-stat-number" style={{ color: '#EF4444' }}>
                                    {loading ? '...' : stats.criticalStock}
                                </span>
                                <span className="dashboard-stat-label">Critical Stock</span>
                            </div>
                        </div>
                        <div className="dashboard-stat-card">
                            <div className="dashboard-stat-icon"><Icons.Value /></div>
                            <div className="dashboard-stat-content">
                                <span className="dashboard-stat-number" style={{ color: '#10B981' }}>
                                    {loading ? '...' : `MK ${stats.totalValue?.toLocaleString() || 0}`}
                                </span>
                                <span className="dashboard-stat-label">Total Value</span>
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-section">
                        <h2 className="dashboard-section-title">Quick Actions</h2>
                        <div className="dashboard-actions">
                            {quickActions.map((action, index) => (
                                <button
                                    key={index}
                                    className="dashboard-action-btn"
                                    onClick={() => navigate(action.path)}
                                    style={{ '--action-color': action.color }}
                                >
                                    <span className="dashboard-action-icon">{action.icon}</span>
                                    <span className="dashboard-action-label">{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="dashboard-bottom">
                        <div className="dashboard-recent">
                            <h2 className="dashboard-section-title">Recent Activity</h2>
                            <div className="dashboard-recent-list">
                                {loading ? (
                                    <div className="dashboard-loading">Loading...</div>
                                ) : (
                                    <div className="dashboard-empty">
                                        <Icons.Empty />
                                        <span>No recent activity</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="dashboard-alerts">
                            <h2 className="dashboard-section-title">Active Alerts</h2>
                            <div className="dashboard-alerts-list">
                                {loading ? (
                                    <div className="dashboard-loading">Loading...</div>
                                ) : stats.criticalStock > 0 || stats.lowStock > 0 ? (
                                    <>
                                        {stats.criticalStock > 0 && (
                                            <div className="dashboard-alert-item critical">
                                                <span className="dashboard-alert-dot"></span>
                                                <span>{stats.criticalStock} products critically low</span>
                                            </div>
                                        )}
                                        {stats.lowStock > 0 && (
                                            <div className="dashboard-alert-item warning">
                                                <span className="dashboard-alert-dot"></span>
                                                <span>{stats.lowStock} products running low</span>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="dashboard-empty">
                                        <span>All products are well stocked</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <nav className="dashboard-bottom-nav">
                <button className="dashboard-nav-item active" onClick={() => navigate('/dashboard')}>
                    <Icons.Home />
                    <span>Home</span>
                </button>
                <button className="dashboard-nav-item" onClick={() => navigate('/receive')}>
                    <Icons.Receive />
                    <span>Receive</span>
                </button>
                <button className="dashboard-nav-item" onClick={() => alert('Coming Soon!')}>
                    <Icons.Stock />
                    <span>Stock</span>
                </button>
                <button className="dashboard-nav-item" onClick={() => alert('Coming Soon!')}>
                    <Icons.Alerts />
                    <span>Alerts</span>
                </button>
                <button className="dashboard-nav-item" onClick={() => alert('Coming Soon!')}>
                    <Icons.Reports />
                    <span>Reports</span>
                </button>
            </nav>
        </div>
    );
};

export default Dashboard;



