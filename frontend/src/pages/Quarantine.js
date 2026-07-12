import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Dashboard.css';

const Quarantine = () => {
    const navigate = useNavigate();
    
    // State
    const [quarantinedItems, setQuarantinedItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showQuarantineModal, setShowQuarantineModal] = useState(false);
    const [showReleaseModal, setShowReleaseModal] = useState(false);
    const [showDisposeModal, setShowDisposeModal] = useState(false);
    const [selectedQuarantine, setSelectedQuarantine] = useState(null);
    const [stats, setStats] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    
    // Form state for quarantine
    const [quarantineForm, setQuarantineForm] = useState({
        productId: '',
        reason: 'damaged',
        reasonDescription: '',
        quantity: 1,
        location: 'Quarantine Area A',
        approvedBy: '',
        notes: ''
    });
    
    // Form state for release
    const [releaseForm, setReleaseForm] = useState({
        releaseReason: '',
        releaseNotes: ''
    });
    
    // Form state for dispose
    const [disposeForm, setDisposeForm] = useState({
        disposalMethod: '',
        disposalNotes: ''
    });
    
    // Search ref
    const searchRef = useRef(null);
    const searchTimeout = useRef(null);

    // Load data on mount
    useEffect(() => {
        loadQuarantinedItems();
        loadStats();
        setTimeout(() => searchRef.current?.focus(), 100);
    }, []);

    // Load quarantined items
    const loadQuarantinedItems = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/quarantine');
            if (response.data.success) {
                setQuarantinedItems(response.data.data);
            } else {
                setError('Failed to load quarantined items');
            }
        } catch (err) {
            console.error('Error loading quarantined items:', err);
            setError('Error loading quarantined items');
        } finally {
            setLoading(false);
        }
    };

    // Load statistics
    const loadStats = async () => {
        try {
            const response = await api.get('/quarantine/stats');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (err) {
            console.error('Error loading stats:', err);
        }
    };

    // Search products for quarantine
    const searchProducts = async (term) => {
        setSearchTerm(term);
        
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        
        if (term.length < 2) {
            setSearchResults([]);
            setShowSearchDropdown(false);
            return;
        }
        
        searchTimeout.current = setTimeout(async () => {
            try {
                const response = await api.get(`/products?search=${encodeURIComponent(term)}`);
                if (response.data.success) {
                    const available = response.data.data.filter(p => !p.isQuarantined);
                    setSearchResults(available);
                    setShowSearchDropdown(available.length > 0);
                }
            } catch (err) {
                console.error('Search error:', err);
            }
        }, 300);
    };

    // Select product for quarantine
    const selectProductForQuarantine = (product) => {
        setSelectedProduct(product);
        setQuarantineForm({
            ...quarantineForm,
            productId: product._id,
            quantity: product.quantityOnHand || 1,
            approvedBy: 'System User'
        });
        setSearchTerm(product.name);
        setShowSearchDropdown(false);
        setShowQuarantineModal(true);
    };

    // Quarantine a product
    const handleQuarantine = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const response = await api.post('/quarantine', quarantineForm);
            if (response.data.success) {
                setSuccess(`Product quarantined successfully! Reference: ${response.data.data.quarantineReference}`);
                setShowQuarantineModal(false);
                setQuarantineForm({
                    productId: '',
                    reason: 'damaged',
                    reasonDescription: '',
                    quantity: 1,
                    location: 'Quarantine Area A',
                    approvedBy: '',
                    notes: ''
                });
                setSelectedProduct(null);
                setSearchTerm('');
                setSearchResults([]);
                loadQuarantinedItems();
                loadStats();
                setTimeout(() => setSuccess(''), 5000);
            } else {
                setError(response.data.message || 'Failed to quarantine product');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error quarantining product');
        } finally {
            setLoading(false);
        }
    };

    // Release from quarantine
    const handleRelease = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const response = await api.put(`/quarantine/${selectedQuarantine}/release`, releaseForm);
            if (response.data.success) {
                setSuccess('Product released from quarantine successfully!');
                setShowReleaseModal(false);
                setSelectedQuarantine(null);
                setReleaseForm({ releaseReason: '', releaseNotes: '' });
                loadQuarantinedItems();
                loadStats();
                setTimeout(() => setSuccess(''), 5000);
            } else {
                setError(response.data.message || 'Failed to release product');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error releasing product');
        } finally {
            setLoading(false);
        }
    };

    // Dispose quarantined product
    const handleDispose = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const response = await api.put(`/quarantine/${selectedQuarantine}/dispose`, disposeForm);
            if (response.data.success) {
                setSuccess('Product disposed successfully!');
                setShowDisposeModal(false);
                setSelectedQuarantine(null);
                setDisposeForm({ disposalMethod: '', disposalNotes: '' });
                loadQuarantinedItems();
                loadStats();
                setTimeout(() => setSuccess(''), 5000);
            } else {
                setError(response.data.message || 'Failed to dispose product');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error disposing product');
        } finally {
            setLoading(false);
        }
    };

    // Get status badge color
    const getStatusBadge = (status) => {
        switch(status) {
            case 'quarantined':
                return { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', label: 'Quarantined' };
            case 'cleared':
                return { color: '#10B981', bg: 'rgba(16,185,129,0.1)', label: 'Cleared' };
            case 'destroyed':
                return { color: '#6B7280', bg: 'rgba(107,114,128,0.1)', label: 'Destroyed' };
            case 'returned':
                return { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', label: 'Returned' };
            default:
                return { color: '#6B7280', bg: 'rgba(107,114,128,0.1)', label: status };
        }
    };

    // Get reason label
    const getReasonLabel = (reason) => {
        const reasons = {
            'expired': 'Expired',
            'recalled': 'Recalled',
            'damaged': 'Damaged',
            'temperature-excursion': 'Temperature Excursion',
            'suspect-product': 'Suspect Product',
            'returned-product': 'Returned Product',
            'quality-issue': 'Quality Issue',
            'other': 'Other'
        };
        return reasons[reason] || reason;
    };

    // Filter items
    const filteredItems = quarantinedItems.filter(item => {
        if (filterStatus !== 'all' && item.status !== filterStatus) return false;
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            return item.productName?.toLowerCase().includes(search) ||
                   item.batchNumber?.toLowerCase().includes(search) ||
                   item.quarantineReference?.toLowerCase().includes(search);
        }
        return true;
    });

    // SVG Icons - ALL SVG, NO EMOJIS
    const BackIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
        </svg>
    );

    const SearchIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
    );

    const CloseIcon = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
    );

    const ReleaseIcon = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
    );

    const DisposeIcon = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
    );

    const QuarantineIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="3" y1="15" x2="21" y2="15"/>
            <line x1="9" y1="21" x2="9" y2="9"/>
        </svg>
    );

    const AddIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
    );

    const ClearIcon = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
    );

    const EmptyIcon = () => (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="3" y1="15" x2="21" y2="15"/>
            <line x1="9" y1="21" x2="9" y2="9"/>
        </svg>
    );

    const CheckIcon = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
        </svg>
    );

    const DropdownIcon = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
        </svg>
    );

    // Reason SVG Icons
    const ExpiredIcon = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
    );

    const RecalledIcon = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9.5"/>
            <polyline points="16 2 22 8 16 8"/>
            <line x1="10" y1="14" x2="14" y2="14"/>
            <line x1="12" y1="12" x2="12" y2="16"/>
        </svg>
    );

    const DamagedIcon = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
        </svg>
    );

    const TempIcon = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
        </svg>
    );

    const SuspectIcon = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
    );

    const ReturnedIcon = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
    );

    const QualityIcon = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v4"/>
            <path d="M12 17h.01"/>
            <circle cx="12" cy="12" r="10"/>
        </svg>
    );

    const OtherIcon = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="2"/>
        </svg>
    );

    const getReasonIcon = (reason) => {
        switch(reason) {
            case 'expired': return <ExpiredIcon />;
            case 'recalled': return <RecalledIcon />;
            case 'damaged': return <DamagedIcon />;
            case 'temperature-excursion': return <TempIcon />;
            case 'suspect-product': return <SuspectIcon />;
            case 'returned-product': return <ReturnedIcon />;
            case 'quality-issue': return <QualityIcon />;
            default: return <OtherIcon />;
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-main" style={{ marginLeft: '0', padding: '40px' }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px',
                    flexWrap: 'wrap',
                    gap: '16px'
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: '#FFFFFF',
                            margin: '0 0 4px 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <QuarantineIcon /> Quarantine
                        </h1>
                        <p style={{
                            color: 'rgba(255,255,255,0.2)',
                            fontSize: '13px',
                            margin: '0'
                        }}>
                            Manage quarantined products
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedProduct(null);
                                setSearchResults([]);
                                setShowSearchDropdown(false);
                                setShowQuarantineModal(true);
                            }}
                            style={{
                                padding: '10px 20px',
                                background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#FFFFFF',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '600',
                                fontFamily: 'inherit',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 16px rgba(239,68,68,0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <AddIcon />
                            Quarantine Product
                        </button>
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
                                transition: 'all 0.2s',
                                fontFamily: 'inherit',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
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
                            <BackIcon /> Back
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '12px',
                        marginBottom: '20px'
                    }}>
                        <div style={{
                            background: 'rgba(239,68,68,0.05)',
                            border: '1px solid rgba(239,68,68,0.1)',
                            borderRadius: '10px',
                            padding: '14px 16px'
                        }}>
                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>Quarantined</div>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: '#EF4444' }}>{stats.totalQuarantined}</div>
                        </div>
                        <div style={{
                            background: 'rgba(16,185,129,0.05)',
                            border: '1px solid rgba(16,185,129,0.1)',
                            borderRadius: '10px',
                            padding: '14px 16px'
                        }}>
                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>Cleared</div>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: '#10B981' }}>{stats.totalCleared}</div>
                        </div>
                        <div style={{
                            background: 'rgba(107,114,128,0.05)',
                            border: '1px solid rgba(107,114,128,0.1)',
                            borderRadius: '10px',
                            padding: '14px 16px'
                        }}>
                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>Destroyed</div>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: '#6B7280' }}>{stats.totalDestroyed}</div>
                        </div>
                        <div style={{
                            background: 'rgba(245,158,11,0.05)',
                            border: '1px solid rgba(245,158,11,0.1)',
                            borderRadius: '10px',
                            padding: '14px 16px'
                        }}>
                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>Returned</div>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: '#F59E0B' }}>{stats.totalReturned}</div>
                        </div>
                    </div>
                )}

                {/* Error/Success Messages */}
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
                {success && (
                    <div style={{
                        padding: '10px 16px',
                        background: 'rgba(16,185,129,0.1)',
                        border: '1px solid rgba(16,185,129,0.2)',
                        borderRadius: '8px',
                        color: '#10B981',
                        fontSize: '13px',
                        marginBottom: '16px'
                    }}>
                        {success}
                    </div>
                )}

                {/* Search and Filters */}
                <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '16px',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                        <span style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'rgba(255,255,255,0.1)'
                        }}>
                            <SearchIcon />
                        </span>
                        <input
                            ref={searchRef}
                            type="text"
                            placeholder="Search by name, batch, or reference..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px 8px 36px',
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '8px',
                                color: '#FFFFFF',
                                fontSize: '13px',
                                outline: 'none',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{
                            padding: '8px 32px 8px 12px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '8px',
                            color: '#FFFFFF',
                            fontSize: '13px',
                            outline: 'none',
                            fontFamily: 'inherit',
                            cursor: 'pointer',
                            appearance: 'none',
                            WebkitAppearance: 'none',
                            minWidth: '140px'
                        }}
                    >
                        <option value="all">All Status</option>
                        <option value="quarantined">Quarantined</option>
                        <option value="cleared">Cleared</option>
                        <option value="destroyed">Destroyed</option>
                        <option value="returned">Returned</option>
                    </select>
                </div>

                {/* Quarantine List */}
                {loading && !quarantinedItems.length ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.05)' }}>
                        Loading...
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: 'rgba(255,255,255,0.05)'
                    }}>
                        <EmptyIcon />
                        <p style={{ marginTop: '12px' }}>No quarantined products found</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                    }}>
                        {filteredItems.map((item) => {
                            const status = getStatusBadge(item.status);
                            return (
                                <div
                                    key={item._id}
                                    style={{
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.04)',
                                        borderRadius: '10px',
                                        padding: '14px 18px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: '10px'
                                    }}
                                >
                                    <div style={{ flex: 1, minWidth: '150px' }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            flexWrap: 'wrap'
                                        }}>
                                            <span style={{
                                                fontWeight: '500',
                                                color: '#FFFFFF',
                                                fontSize: '14px'
                                            }}>
                                                {item.productName}
                                            </span>
                                            <span style={{
                                                fontSize: '11px',
                                                color: 'rgba(255,255,255,0.15)',
                                                background: 'rgba(255,255,255,0.03)',
                                                padding: '2px 8px',
                                                borderRadius: '4px'
                                            }}>
                                                {item.batchNumber}
                                            </span>
                                            <span style={{
                                                fontSize: '11px',
                                                color: 'rgba(255,255,255,0.1)'
                                            }}>
                                                {item.quarantineReference}
                                            </span>
                                        </div>
                                        <div style={{
                                            fontSize: '12px',
                                            color: 'rgba(255,255,255,0.15)',
                                            marginTop: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            {getReasonIcon(item.reason)}
                                            {getReasonLabel(item.reason)} • {item.quantity} units
                                        </div>
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        flexWrap: 'wrap'
                                    }}>
                                        <span style={{
                                            fontSize: '11px',
                                            padding: '2px 10px',
                                            borderRadius: '12px',
                                            background: status.bg,
                                            color: status.color,
                                            border: '1px solid ' + status.color + '30'
                                        }}>
                                            {status.label}
                                        </span>
                                        
                                        {item.status === 'quarantined' && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setSelectedQuarantine(item._id);
                                                        setShowReleaseModal(true);
                                                    }}
                                                    style={{
                                                        padding: '4px 12px',
                                                        background: 'rgba(16,185,129,0.1)',
                                                        border: '1px solid rgba(16,185,129,0.2)',
                                                        borderRadius: '6px',
                                                        color: '#10B981',
                                                        cursor: 'pointer',
                                                        fontSize: '11px',
                                                        fontFamily: 'inherit',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}
                                                >
                                                    <ReleaseIcon /> Release
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedQuarantine(item._id);
                                                        setShowDisposeModal(true);
                                                    }}
                                                    style={{
                                                        padding: '4px 12px',
                                                        background: 'rgba(239,68,68,0.1)',
                                                        border: '1px solid rgba(239,68,68,0.2)',
                                                        borderRadius: '6px',
                                                        color: '#EF4444',
                                                        cursor: 'pointer',
                                                        fontSize: '11px',
                                                        fontFamily: 'inherit',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}
                                                >
                                                    <DisposeIcon /> Dispose
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Quarantine Modal */}
                {showQuarantineModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.85)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px'
                    }}>
                        <div style={{
                            background: '#1A1A1A',
                            borderRadius: '16px',
                            padding: '32px',
                            maxWidth: '500px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            border: '1px solid rgba(255,255,255,0.06)'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '20px'
                            }}>
                                <h2 style={{
                                    fontSize: '20px',
                                    fontWeight: '600',
                                    color: '#FFFFFF',
                                    margin: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <QuarantineIcon /> Quarantine Product
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowQuarantineModal(false);
                                        setSelectedProduct(null);
                                        setSearchTerm('');
                                        setSearchResults([]);
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'rgba(255,255,255,0.2)',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        fontSize: '18px'
                                    }}
                                >
                                    <CloseIcon />
                                </button>
                            </div>

                            {/* Product Search */}
                            <div style={{ position: 'relative', marginBottom: '16px' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: '10px',
                                    padding: '0 14px',
                                    transition: 'all 0.2s'
                                }}>
                                    <SearchIcon />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => searchProducts(e.target.value)}
                                        placeholder="Search for product to quarantine..."
                                        style={{
                                            flex: 1,
                                            padding: '12px 12px',
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#FFFFFF',
                                            fontSize: '14px',
                                            outline: 'none',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={() => {
                                                setSearchTerm('');
                                                setSearchResults([]);
                                                setShowSearchDropdown(false);
                                            }}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: 'rgba(255,255,255,0.1)',
                                                cursor: 'pointer',
                                                padding: '4px',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <ClearIcon />
                                        </button>
                                    )}
                                </div>
                                {showSearchDropdown && searchResults.length > 0 && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 'calc(100% + 6px)',
                                        left: 0,
                                        right: 0,
                                        background: '#1A1A1A',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        borderRadius: '10px',
                                        maxHeight: '220px',
                                        overflow: 'auto',
                                        zIndex: 100,
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                        padding: '4px 0'
                                    }}>
                                        {searchResults.map((p) => (
                                            <div
                                                key={p._id}
                                                onClick={() => selectProductForQuarantine(p)}
                                                style={{
                                                    padding: '10px 14px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    borderBottom: '1px solid rgba(255,255,255,0.03)'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'transparent';
                                                }}
                                            >
                                                <div>
                                                    <div style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: '500' }}>{p.name}</div>
                                                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>
                                                        Stock: {p.quantityOnHand} • Batch: {p.batchNumber || 'N/A'}
                                                    </div>
                                                </div>
                                                <div style={{
                                                    fontSize: '10px',
                                                    padding: '2px 10px',
                                                    borderRadius: '12px',
                                                    background: 'rgba(16,185,129,0.1)',
                                                    color: '#10B981',
                                                    border: '1px solid rgba(16,185,129,0.15)',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    Available
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {showSearchDropdown && searchResults.length === 0 && searchTerm.length >= 2 && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 'calc(100% + 6px)',
                                        left: 0,
                                        right: 0,
                                        background: '#1A1A1A',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        borderRadius: '10px',
                                        padding: '16px',
                                        textAlign: 'center',
                                        color: 'rgba(255,255,255,0.1)',
                                        fontSize: '13px'
                                    }}>
                                        No products found
                                    </div>
                                )}
                            </div>

                            {selectedProduct && (
                                <div style={{
                                    padding: '12px 16px',
                                    background: 'rgba(16,185,129,0.05)',
                                    border: '1px solid rgba(16,185,129,0.1)',
                                    borderRadius: '8px',
                                    marginBottom: '16px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ color: '#FFFFFF', fontWeight: '500' }}>{selectedProduct.name}</div>
                                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>
                                            Stock: {selectedProduct.quantityOnHand} • Batch: {selectedProduct.batchNumber || 'N/A'}
                                        </div>
                                    </div>
                                    <div style={{
                                        fontSize: '10px',
                                        padding: '2px 10px',
                                        borderRadius: '12px',
                                        background: 'rgba(16,185,129,0.1)',
                                        color: '#10B981',
                                        border: '1px solid rgba(16,185,129,0.15)'
                                    }}>
                                        Selected
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleQuarantine}>
                                {/* Reason Dropdown - With SVG Icons */}
                                <div style={{ marginBottom: '14px' }}>
                                    <label style={{
                                        fontSize: '12px',
                                        color: 'rgba(255,255,255,0.2)',
                                        display: 'block',
                                        marginBottom: '6px',
                                        fontWeight: '500'
                                    }}>
                                        Reason *
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <select
                                            value={quarantineForm.reason}
                                            onChange={(e) => setQuarantineForm({ ...quarantineForm, reason: e.target.value })}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '10px 14px',
                                                background: 'rgba(255,255,255,0.04)',
                                                border: '1px solid rgba(255,255,255,0.06)',
                                                borderRadius: '8px',
                                                color: '#FFFFFF',
                                                fontSize: '14px',
                                                outline: 'none',
                                                fontFamily: 'inherit',
                                                cursor: 'pointer',
                                                appearance: 'none',
                                                WebkitAppearance: 'none',
                                                transition: 'all 0.2s'
                                            }}
                                            onFocus={(e) => {
                                                e.currentTarget.style.borderColor = 'rgba(214,158,46,0.3)';
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                            }}
                                        >
                                            <option value="expired" style={{ background: '#1A1A1A', color: '#FFFFFF' }}>✕ Expired</option>
                                            <option value="recalled" style={{ background: '#1A1A1A', color: '#FFFFFF' }}>↩ Recalled</option>
                                            <option value="damaged" style={{ background: '#1A1A1A', color: '#FFFFFF' }}>✕ Damaged</option>
                                            <option value="temperature-excursion" style={{ background: '#1A1A1A', color: '#FFFFFF' }}>⊙ Temperature Excursion</option>
                                            <option value="suspect-product" style={{ background: '#1A1A1A', color: '#FFFFFF' }}>? Suspect Product</option>
                                            <option value="returned-product" style={{ background: '#1A1A1A', color: '#FFFFFF' }}>↩ Returned Product</option>
                                            <option value="quality-issue" style={{ background: '#1A1A1A', color: '#FFFFFF' }}>⚠ Quality Issue</option>
                                            <option value="other" style={{ background: '#1A1A1A', color: '#FFFFFF' }}>⋯ Other</option>
                                        </select>
                                        <DropdownIcon />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '14px' }}>
                                    <label style={{
                                        fontSize: '12px',
                                        color: 'rgba(255,255,255,0.2)',
                                        display: 'block',
                                        marginBottom: '6px',
                                        fontWeight: '500'
                                    }}>
                                        Reason Description
                                    </label>
                                    <input
                                        type="text"
                                        value={quarantineForm.reasonDescription}
                                        onChange={(e) => setQuarantineForm({ ...quarantineForm, reasonDescription: e.target.value })}
                                        placeholder="Describe the reason..."
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            borderRadius: '8px',
                                            color: '#FFFFFF',
                                            fontSize: '14px',
                                            outline: 'none',
                                            fontFamily: 'inherit',
                                            transition: 'all 0.2s'
                                        }}
                                        onFocus={(e) => {
                                            e.currentTarget.style.borderColor = 'rgba(214,158,46,0.3)';
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '14px' }}>
                                    <label style={{
                                        fontSize: '12px',
                                        color: 'rgba(255,255,255,0.2)',
                                        display: 'block',
                                        marginBottom: '6px',
                                        fontWeight: '500'
                                    }}>
                                        Quantity *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={selectedProduct?.quantityOnHand || 1}
                                        value={quarantineForm.quantity}
                                        onChange={(e) => setQuarantineForm({ ...quarantineForm, quantity: parseInt(e.target.value) || 1 })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            borderRadius: '8px',
                                            color: '#FFFFFF',
                                            fontSize: '14px',
                                            outline: 'none',
                                            fontFamily: 'inherit',
                                            transition: 'all 0.2s'
                                        }}
                                        onFocus={(e) => {
                                            e.currentTarget.style.borderColor = 'rgba(214,158,46,0.3)';
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                        }}
                                    />
                                    {selectedProduct && (
                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.1)', marginTop: '4px' }}>
                                            Max: {selectedProduct.quantityOnHand} units available
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{
                                        fontSize: '12px',
                                        color: 'rgba(255,255,255,0.2)',
                                        display: 'block',
                                        marginBottom: '6px',
                                        fontWeight: '500'
                                    }}>
                                        Notes
                                    </label>
                                    <textarea
                                        value={quarantineForm.notes}
                                        onChange={(e) => setQuarantineForm({ ...quarantineForm, notes: e.target.value })}
                                        placeholder="Additional notes..."
                                        rows="2"
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            borderRadius: '8px',
                                            color: '#FFFFFF',
                                            fontSize: '13px',
                                            outline: 'none',
                                            fontFamily: 'inherit',
                                            resize: 'vertical',
                                            transition: 'all 0.2s'
                                        }}
                                        onFocus={(e) => {
                                            e.currentTarget.style.borderColor = 'rgba(214,158,46,0.3)';
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                        }}
                                    />
                                </div>

                                <div style={{
                                    display: 'flex',
                                    gap: '10px',
                                    justifyContent: 'flex-end',
                                    marginTop: '8px'
                                }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowQuarantineModal(false);
                                            setSelectedProduct(null);
                                            setSearchTerm('');
                                            setSearchResults([]);
                                        }}
                                        style={{
                                            padding: '10px 20px',
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            borderRadius: '8px',
                                            color: 'rgba(255,255,255,0.4)',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            fontFamily: 'inherit',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                            e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                            e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading || !selectedProduct}
                                        style={{
                                            padding: '10px 24px',
                                            background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: '#FFFFFF',
                                            cursor: loading || !selectedProduct ? 'not-allowed' : 'pointer',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            fontFamily: 'inherit',
                                            opacity: loading || !selectedProduct ? 0.5 : 1,
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!loading && selectedProduct) {
                                                e.currentTarget.style.transform = 'translateY(-1px)';
                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,68,68,0.3)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        {loading ? 'Processing...' : 'Quarantine Product'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Release Modal */}
                {showReleaseModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.85)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px'
                    }}>
                        <div style={{
                            background: '#1A1A1A',
                            borderRadius: '16px',
                            padding: '28px',
                            maxWidth: '450px',
                            width: '100%',
                            border: '1px solid rgba(255,255,255,0.06)'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '16px'
                            }}>
                                <h2 style={{
                                    fontSize: '20px',
                                    fontWeight: '600',
                                    color: '#FFFFFF',
                                    margin: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <ReleaseIcon /> Release from Quarantine
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowReleaseModal(false);
                                        setSelectedQuarantine(null);
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'rgba(255,255,255,0.2)',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        fontSize: '18px'
                                    }}
                                >
                                    <CloseIcon />
                                </button>
                            </div>

                            <form onSubmit={handleRelease}>
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{
                                        fontSize: '12px',
                                        color: 'rgba(255,255,255,0.2)',
                                        display: 'block',
                                        marginBottom: '4px'
                                    }}>
                                        Release Reason *
                                    </label>
                                    <input
                                        type="text"
                                        value={releaseForm.releaseReason}
                                        onChange={(e) => setReleaseForm({ ...releaseForm, releaseReason: e.target.value })}
                                        placeholder="Why is this being released?"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '8px 10px',
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            borderRadius: '6px',
                                            color: '#FFFFFF',
                                            fontSize: '13px',
                                            outline: 'none',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{
                                        fontSize: '12px',
                                        color: 'rgba(255,255,255,0.2)',
                                        display: 'block',
                                        marginBottom: '4px'
                                    }}>
                                        Release Notes
                                    </label>
                                    <textarea
                                        value={releaseForm.releaseNotes}
                                        onChange={(e) => setReleaseForm({ ...releaseForm, releaseNotes: e.target.value })}
                                        placeholder="Additional notes..."
                                        rows="2"
                                        style={{
                                            width: '100%',
                                            padding: '8px 10px',
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            borderRadius: '6px',
                                            color: '#FFFFFF',
                                            fontSize: '13px',
                                            outline: 'none',
                                            fontFamily: 'inherit',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>

                                <div style={{
                                    display: 'flex',
                                    gap: '8px',
                                    justifyContent: 'flex-end'
                                }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowReleaseModal(false);
                                            setSelectedQuarantine(null);
                                        }}
                                        style={{
                                            padding: '8px 16px',
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            borderRadius: '6px',
                                            color: 'rgba(255,255,255,0.4)',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            fontFamily: 'inherit'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        style={{
                                            padding: '8px 20px',
                                            background: 'linear-gradient(135deg, #10B981, #059669)',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: '#FFFFFF',
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            fontFamily: 'inherit',
                                            opacity: loading ? 0.5 : 1
                                        }}
                                    >
                                        {loading ? 'Processing...' : 'Release Product'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Dispose Modal */}
                {showDisposeModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.85)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px'
                    }}>
                        <div style={{
                            background: '#1A1A1A',
                            borderRadius: '16px',
                            padding: '28px',
                            maxWidth: '450px',
                            width: '100%',
                            border: '1px solid rgba(255,255,255,0.06)'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '16px'
                            }}>
                                <h2 style={{
                                    fontSize: '20px',
                                    fontWeight: '600',
                                    color: '#FFFFFF',
                                    margin: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <DisposeIcon /> Dispose Product
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowDisposeModal(false);
                                        setSelectedQuarantine(null);
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'rgba(255,255,255,0.2)',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        fontSize: '18px'
                                    }}
                                >
                                    <CloseIcon />
                                </button>
                            </div>

                            <div style={{
                                padding: '12px',
                                background: 'rgba(239,68,68,0.05)',
                                borderRadius: '8px',
                                border: '1px solid rgba(239,68,68,0.1)',
                                marginBottom: '16px'
                            }}>
                                <div style={{ fontSize: '13px', color: '#EF4444' }}>
                                    This action is permanent. The product will be marked as destroyed.
                                </div>
                            </div>

                            <form onSubmit={handleDispose}>
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{
                                        fontSize: '12px',
                                        color: 'rgba(255,255,255,0.2)',
                                        display: 'block',
                                        marginBottom: '4px'
                                    }}>
                                        Disposal Method *
                                    </label>
                                    <input
                                        type="text"
                                        value={disposeForm.disposalMethod}
                                        onChange={(e) => setDisposeForm({ ...disposeForm, disposalMethod: e.target.value })}
                                        placeholder="e.g., Destroyed, Returned to Supplier"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '8px 10px',
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            borderRadius: '6px',
                                            color: '#FFFFFF',
                                            fontSize: '13px',
                                            outline: 'none',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{
                                        fontSize: '12px',
                                        color: 'rgba(255,255,255,0.2)',
                                        display: 'block',
                                        marginBottom: '4px'
                                    }}>
                                        Disposal Notes
                                    </label>
                                    <textarea
                                        value={disposeForm.disposalNotes}
                                        onChange={(e) => setDisposeForm({ ...disposeForm, disposalNotes: e.target.value })}
                                        placeholder="Additional notes..."
                                        rows="2"
                                        style={{
                                            width: '100%',
                                            padding: '8px 10px',
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            borderRadius: '6px',
                                            color: '#FFFFFF',
                                            fontSize: '13px',
                                            outline: 'none',
                                            fontFamily: 'inherit',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>

                                <div style={{
                                    display: 'flex',
                                    gap: '8px',
                                    justifyContent: 'flex-end'
                                }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowDisposeModal(false);
                                            setSelectedQuarantine(null);
                                        }}
                                        style={{
                                            padding: '8px 16px',
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            borderRadius: '6px',
                                            color: 'rgba(255,255,255,0.4)',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            fontFamily: 'inherit'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        style={{
                                            padding: '8px 20px',
                                            background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: '#FFFFFF',
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            fontFamily: 'inherit',
                                            opacity: loading ? 0.5 : 1
                                        }}
                                    >
                                        {loading ? 'Processing...' : 'Dispose Product'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Quarantine;