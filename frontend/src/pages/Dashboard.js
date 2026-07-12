import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        totalProducts: 0,
        lowStock: 0,
        criticalStock: 0,
        totalValue: 0
    });
    const [recentActivities, setRecentActivities] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [greeting, setGreeting] = useState('');

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
        loadRecentActivity();
        loadAlerts();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/products/stats');
            console.log('📊 Dashboard stats:', response.data);

            if (response.data && response.data.success) {
                setStats({
                    totalProducts: response.data.data.totalProducts || 0,
                    lowStock: response.data.data.lowStock || 0,
                    criticalStock: response.data.data.criticalStock || 0,
                    totalValue: response.data.data.totalValue || 0
                });
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

    const loadRecentActivity = async () => {
        try {
            const response = await api.get('/stock/transactions?limit=5');
            if (response.data && response.data.success) {
                const activities = response.data.data.map(t => ({
                    id: t._id,
                    title: `${t.type === 'receive' ? 'Received' : t.type === 'dispense' ? 'Dispensed' : 'Adjusted'} ${t.productName}`,
                    time: new Date(t.createdAt).toLocaleDateString() + ' ' + new Date(t.createdAt).toLocaleTimeString(),
                    type: t.type,
                    status: 'completed',
                    quantity: t.quantity
                }));
                setRecentActivities(activities);
            } else {
                setRecentActivities(getMockActivities());
            }
        } catch (error) {
            console.log('Using mock activity data');
            setRecentActivities(getMockActivities());
        }
    };

    const loadAlerts = async () => {
        try {
            const response = await api.get('/products');
            if (response.data && response.data.success) {
                const products = response.data.data;
                const alertsList = [];
                
                const criticalProducts = products.filter(p => p.quantityOnHand === 0);
                criticalProducts.forEach(p => {
                    alertsList.push({
                        id: `critical-${p._id}`,
                        type: 'critical',
                        text: `${p.name} is out of stock`
                    });
                });
                
                const lowProducts = products.filter(p => p.quantityOnHand > 0 && p.quantityOnHand < 10);
                lowProducts.forEach(p => {
                    alertsList.push({
                        id: `low-${p._id}`,
                        type: 'warning',
                        text: `${p.name} is low (${p.quantityOnHand} units left)`
                    });
                });
                
                const today = new Date();
                const thirtyDays = new Date();
                thirtyDays.setDate(today.getDate() + 30);
                const expiringProducts = products.filter(p => {
                    if (!p.expiryDate) return false;
                    const expiry = new Date(p.expiryDate);
                    return expiry <= thirtyDays && expiry >= today && p.quantityOnHand > 0;
                });
                expiringProducts.forEach(p => {
                    const expiryDate = new Date(p.expiryDate);
                    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                    alertsList.push({
                        id: `expiry-${p._id}`,
                        type: 'warning',
                        text: `${p.name} expires in ${daysUntilExpiry} days`
                    });
                });
                
                setAlerts(alertsList.slice(0, 5));
            } else {
                setAlerts(getMockAlerts());
            }
        } catch (error) {
            console.log('Using mock alert data');
            setAlerts(getMockAlerts());
        }
    };

    const getMockActivities = () => {
        return [
            { id: 1, title: 'Received Paracetamol 500mg', time: '2 hours ago', type: 'receive', status: 'completed', quantity: 100 },
            { id: 2, title: 'Dispensed Amoxicillin 250mg', time: '4 hours ago', type: 'dispense', status: 'completed', quantity: 30 },
            { id: 3, title: 'Adjusted Ibuprofen 400mg stock', time: '1 day ago', type: 'adjustment', status: 'pending', quantity: 15 },
            { id: 4, title: 'Received Metformin 500mg', time: '2 days ago', type: 'receive', status: 'completed', quantity: 50 },
        ];
    };

    const getMockAlerts = () => {
        return [
            { id: 1, type: 'critical', text: 'Amoxicillin 250mg is out of stock' },
            { id: 2, type: 'warning', text: 'Paracetamol 500mg is low (15 units left)' },
            { id: 3, type: 'warning', text: 'Ibuprofen 400mg expires in 30 days' },
        ];
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    const toggleSidebar = () => {
        setCollapsed(!collapsed);
    };

    // ============================================================
    // SVG ICONS - NO EMOJIS
    // ============================================================

    const MenuIcon = () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
    );

    const CloseIcon = () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
    );

    const DashboardIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
    );

    const ProductIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
    );

    const ReceiveIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
            <polyline points="17 6 23 6 23 12"/>
        </svg>
    );

    const DispenseIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
            <polyline points="17 18 23 18 23 12"/>
        </svg>
    );

    const AdjustIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4M12 22v-4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M22 12h-4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
    );

    const SearchIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
    );

    const QuarantineIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
        </svg>
    );

    const StockCardIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="18" rx="2" ry="2"/>
            <line x1="2" y1="9" x2="22" y2="9"/>
            <line x1="2" y1="15" x2="22" y2="15"/>
            <line x1="8" y1="3" x2="8" y2="21"/>
            <line x1="16" y1="3" x2="16" y2="21"/>
        </svg>
    );

    const SettingsIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>
    );

    const ProductsStatIcon = () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D69E2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
    );

    const LowStockStatIcon = () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
    );

    const CriticalStatIcon = () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
        </svg>
    );

    const ValueStatIcon = () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 12h8"/>
            <path d="M12 8v8"/>
        </svg>
    );

    const ActivityReceiveIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
            <polyline points="17 6 23 6 23 12"/>
        </svg>
    );

    const ActivityDispenseIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
            <polyline points="17 18 23 18 23 12"/>
        </svg>
    );

    const ActivityAdjustIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4M12 22v-4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M22 12h-4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
    );

    // Navigation items
    const navItems = [
        { id: 'dashboard', icon: <DashboardIcon />, label: 'Dashboard', path: '/dashboard' },
        { id: 'products', icon: <ProductIcon />, label: 'Add Product', path: '/add-product' },
        { id: 'receive', icon: <ReceiveIcon />, label: 'Receive', path: '/receive' },
        { id: 'dispense', icon: <DispenseIcon />, label: 'Dispense', path: '/dispense' },
        { id: 'adjustment', icon: <AdjustIcon />, label: 'Adjustment', path: '/adjustment' },
        { id: 'search', icon: <SearchIcon />, label: 'Search', path: '/search' },
        { id: 'quarantine', icon: <QuarantineIcon />, label: 'Quarantine', path: '/quarantine' },
        { id: 'stockcard', icon: <StockCardIcon />, label: 'Stock Card', path: '/stock-card' },
        { id: 'settings', icon: <SettingsIcon />, label: 'Settings', path: '/settings' },
    ];

    const getActivityIcon = (type) => {
        switch(type) {
            case 'receive': return <ActivityReceiveIcon />;
            case 'dispense': return <ActivityDispenseIcon />;
            case 'adjustment': return <ActivityAdjustIcon />;
            default: return <ActivityReceiveIcon />;
        }
    };

    const getActivityClass = (type) => {
        switch(type) {
            case 'receive': return 'receive';
            case 'dispense': return 'dispense';
            case 'adjustment': return 'adjustment';
            default: return 'receive';
        }
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className={`dashboard-sidebar ${collapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-brand">
                    <Link to="/dashboard" className="brand">
                        <span className="brand-icon">✦</span>
                        <span className={`brand-name ${collapsed ? 'hidden' : ''}`}>
                            MedOx <span className="gold">Pharmacy</span>
                        </span>
                    </Link>
                    <button 
                        className={`sidebar-toggle ${collapsed ? 'collapsed' : ''}`}
                        onClick={toggleSidebar}
                        aria-label="Toggle sidebar"
                    >
                        {collapsed ? <MenuIcon /> : <CloseIcon />}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <div className="sidebar-section">
                        <div className={`sidebar-section-title ${collapsed ? 'hidden' : ''}`}>
                            Main Menu
                        </div>
                        {navItems.map((item) => (
                            <Link
                                key={item.id}
                                to={item.path}
                                className="sidebar-item"
                            >
                                <span className="icon">{item.icon}</span>
                                <span className={`label ${collapsed ? 'hidden' : ''}`}>{item.label}</span>
                            </Link>
                        ))}
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="avatar">
                            {user?.firstName?.charAt(0) || 'U'}
                        </div>
                        <div className={`user-info ${collapsed ? 'hidden' : ''}`}>
                            <div className="name">{user?.firstName || 'User'}</div>
                            <div className="role">{user?.role || 'Pharmacist'}</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`dashboard-main ${collapsed ? 'expanded' : ''}`}>
                <div className="dashboard-topbar">
                    <div className="page-title">
                        <h1>{greeting}, {user?.firstName || 'User'}</h1>
                        <p>Welcome back to MedOx Pharmacy</p>
                    </div>
                    <div className="topbar-actions">
                        <span className="topbar-date">
                            {new Date().toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                            })}
                        </span>
                        <button className="topbar-logout" onClick={handleLogout}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                <polyline points="16 17 21 12 16 7"/>
                                <line x1="21" y1="12" x2="9" y2="12"/>
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="dashboard-stats">
                    <div className="stat-card">
                        <div className="stat-icon"><ProductsStatIcon /></div>
                        <div className="stat-info">
                            <span className="stat-number">{loading ? '...' : stats.totalProducts}</span>
                            <span className="stat-label">Total Products</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"><LowStockStatIcon /></div>
                        <div className="stat-info">
                            <span className="stat-number" style={{ color: '#F59E0B' }}>{loading ? '...' : stats.lowStock}</span>
                            <span className="stat-label">Low Stock</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"><CriticalStatIcon /></div>
                        <div className="stat-info">
                            <span className="stat-number" style={{ color: '#EF4444' }}>{loading ? '...' : stats.criticalStock}</span>
                            <span className="stat-label">Critical</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"><ValueStatIcon /></div>
                        <div className="stat-info">
                            <span className="stat-number" style={{ color: '#10B981' }}>
                                {loading ? '...' : `MK${stats.totalValue?.toLocaleString() || 0}`}
                            </span>
                            <span className="stat-label">Total Value</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="dashboard-content">
                    <div className="dashboard-card">
                        <div className="card-header">
                            <h3>Recent Activity</h3>
                            <Link to="/activity" className="view-all">View All</Link>
                        </div>
                        <div className="activity-list">
                            {recentActivities.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.1)' }}>
                                    No recent activity
                                </div>
                            ) : (
                                recentActivities.map((activity) => (
                                    <div key={activity.id} className="activity-item">
                                        <div className={`activity-icon ${getActivityClass(activity.type)}`}>
                                            {getActivityIcon(activity.type)}
                                        </div>
                                        <div className="activity-details">
                                            <div className="activity-title">
                                                {activity.title}
                                                {activity.quantity && (
                                                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', marginLeft: '8px' }}>
                                                        ({activity.quantity} units)
                                                    </span>
                                                )}
                                            </div>
                                            <div className="activity-time">{activity.time}</div>
                                        </div>
                                        <span className={`activity-status ${activity.status}`}>
                                            {activity.status}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="dashboard-card">
                        <div className="card-header">
                            <h3>Alerts</h3>
                            <Link to="/alerts" className="view-all">View All</Link>
                        </div>
                        <div className="alerts-list">
                            {alerts.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.1)' }}>
                                    No alerts
                                </div>
                            ) : (
                                alerts.map((alert) => (
                                    <div key={alert.id} className={`alert-item ${alert.type}`}>
                                        <span className="alert-dot"></span>
                                        <span className="alert-text">
                                            {alert.text}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;