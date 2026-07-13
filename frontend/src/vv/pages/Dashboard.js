import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/styles.css';
import api from '../services/api';
import { checkMonthEndLock } from '../utils/monthEndLock';

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
    Box: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
    ),
    Alerts: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
    ),
    Logout: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
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
    Adjustment: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D69E2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4M12 22v-4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M22 12h-4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
    )
};

// Warning Icon Component
const WarningIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
);

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
    const [monthEndLock, setMonthEndLock] = useState(null);
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
        checkMonthEndStatus();
    }, []);

    const checkMonthEndStatus = () => {
        const lockStatus = checkMonthEndLock();
        setMonthEndLock(lockStatus);
    };

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/products/stats');
            if (response.data && response.data.success) {
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
        { icon: <Icons.Receive />, label: 'Receive', path: '/receive' },
        { icon: <Icons.Issue />, label: 'Dispense', path: '/dispense' },
        { icon: <Icons.Add />, label: 'Add Product', path: '/products' },
        { icon: <Icons.Search />, label: 'Search', path: '/search' },
        { icon: <Icons.Adjustment />, label: 'Adjust', path: '/adjust' }
    ];

    return (
        <div className="dashboard-modern">
            <header className="dash-header">
                <div className="dash-brand">
                    <span className="dash-brand-icon">⚕️</span>
                    <span className="dash-brand-name">MedOx <span className="gold">Pharmacy</span></span>
                </div>
                <div className="dash-user">
                    <span className="dash-user-name">{user?.firstName || 'Pharmacist'}</span>
                    <button className="dash-logout" onClick={handleLogout}>
                        <Icons.Logout /> Logout
                    </button>
                </div>
            </header>

            <main className="dash-main">
                {monthEndLock && monthEndLock.locked && (
                    <div className="month-end-warning">
                        <div className="warning-icon"><WarningIcon /></div>
                        <div className="warning-content">
                            <strong>Month-End Physical Inventory Required!</strong>
                            <p>{monthEndLock.message}</p>
                        </div>
                        <button className="warning-action" onClick={() => navigate('/physical')}>
                            Go to Count
                        </button>
                    </div>
                )}

                                    {monthEndLock && monthEndLock.isReminder && (
                        <div className="month-end-reminder">
                            <div className="reminder-icon">📋</div>
                            <div className="reminder-content">
                                <strong>Physical Inventory Reminder</strong>
                                <p>{monthEndLock.message}</p>
                            </div>
                            <button className="reminder-action" onClick={() => navigate('/physical')}>
                                Prepare Now
                            </button>
                            <button className="reminder-dismiss" onClick={() => {
                                localStorage.setItem('physical_inventory_reminder_shown', 'true');
                                window.location.reload();
                            }}>
                                Dismiss
                            </button>
                        </div>
                    )}
                    <div className="dash-top-row">
                    <div className="dash-welcome">
                        <h1 className="dash-welcome-title">{greeting}, {user?.firstName || 'Pharmacist'}</h1>
                        <p className="dash-welcome-subtitle">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                    </div>
                    <div className="dash-stats">
                        <div className="dash-stat">
                            <Icons.Products />
                            <div>
                                <span className="dash-stat-num">{loading ? '...' : stats.totalProducts}</span>
                                <span className="dash-stat-label">Products</span>
                            </div>
                        </div>
                        <div className="dash-stat">
                            <Icons.LowStock />
                            <div>
                                <span className="dash-stat-num" style={{ color: '#F59E0B' }}>{loading ? '...' : stats.lowStock}</span>
                                <span className="dash-stat-label">Low Stock</span>
                            </div>
                        </div>
                        <div className="dash-stat">
                            <Icons.Critical />
                            <div>
                                <span className="dash-stat-num" style={{ color: '#EF4444' }}>{loading ? '...' : stats.criticalStock}</span>
                                <span className="dash-stat-label">Critical</span>
                            </div>
                        </div>
                        <div className="dash-stat">
                            <Icons.Value />
                            <div>
                                <span className="dash-stat-num" style={{ color: '#10B981' }}>{loading ? '...' : `MK${stats.totalValue?.toLocaleString() || 0}`}</span>
                                <span className="dash-stat-label">Value</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dash-actions-wrapper">
                    <div className="dash-actions">
                        {quickActions.map((action, index) => (
                            <button key={index} className="dash-action-btn" onClick={() => navigate(action.path)}>
                                <span className="dash-action-icon">{action.icon}</span>
                                <span className="dash-action-label">{action.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="dash-bottom">
                    <div className="dash-recent">
                        <h3>Recent Activity</h3>
                        <div className="dash-empty-state">
                            <Icons.Empty />
                            <span>No recent activity</span>
                        </div>
                    </div>
                    <div className="dash-alerts">
                        <h3>Alerts</h3>
                        {loading ? (
                            <div className="dash-empty-state">Loading...</div>
                        ) : stats.criticalStock > 0 || stats.lowStock > 0 ? (
                            <div className="dash-alert-list">
                                {stats.criticalStock > 0 && <div className="dash-alert critical">🔴 {stats.criticalStock} critical</div>}
                                {stats.lowStock > 0 && <div className="dash-alert warning">🟡 {stats.lowStock} low stock</div>}
                            </div>
                        ) : (
                            <div className="dash-empty-state">✅ All stocked</div>
                        )}
                    </div>
                </div>
            </main>

            <nav className="dash-bottom-nav">
                <button className="dash-nav-item active" onClick={() => navigate('/dashboard')}>
                    <Icons.Home /><span>Home</span>
                </button>
                <button className="dash-nav-item" onClick={() => navigate('/stock')}>
                    <Icons.Stock /><span>Stock</span>
                </button>
                <button className="dash-nav-item" onClick={() => navigate('/alerts')}>
                    <Icons.Alerts /><span>Alerts</span>
                </button>
                <button className="dash-nav-item" onClick={() => navigate('/physical')}>
                    <Icons.Box /><span>Count</span>
                </button>
            </nav>
        </div>
    );
};

export default Dashboard;








