import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Dashboard.css';

const SearchProducts = () => {
    const navigate = useNavigate();
    
    // State
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [error, setError] = useState('');
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const [filter, setFilter] = useState('all');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [allProducts, setAllProducts] = useState([]);

    // Refs
    const searchRef = useRef(null);
    const modalRef = useRef(null);
    const filterRef = useRef(null);

    // Load products on mount
    useEffect(() => {
        loadProducts();
        setTimeout(() => searchRef.current?.focus(), 100);
    }, []);

    // Load all products
    const loadProducts = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/products');
            if (response.data.success) {
                setAllProducts(response.data.data);
                setProducts(response.data.data);
                setFilteredProducts([]);
                setShowResults(false);
            } else {
                setError('Failed to load products');
            }
        } catch (err) {
            console.error('Error loading products:', err);
            setError('Error loading products');
        } finally {
            setLoading(false);
        }
    };

    // Search products
    const handleSearch = (term) => {
        setSearchTerm(term);
        
        if (searchTimeout) clearTimeout(searchTimeout);
        
        const timeout = setTimeout(async () => {
            if (term.length >= 2) {
                try {
                    const response = await api.get(`/products?search=${encodeURIComponent(term)}`);
                    if (response.data.success) {
                        let results = response.data.data;
                        if (filter !== 'all') {
                            results = applyFilter(results, filter);
                        }
                        setFilteredProducts(results);
                        setShowResults(true);
                    }
                } catch (err) {
                    console.error('Search error:', err);
                    setError('Error searching products');
                }
            } else {
                setFilteredProducts([]);
                setShowResults(false);
            }
        }, 300);
        
        setSearchTimeout(timeout);
    };

    // Apply filter to results
    const applyFilter = (items, filterType) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        switch(filterType) {
            case 'expired':
                return items.filter(p => {
                    if (!p.expiryDate) return false;
                    return new Date(p.expiryDate) < today;
                });
            case 'expiring-soon':
                return items.filter(p => {
                    if (!p.expiryDate) return false;
                    const expiry = new Date(p.expiryDate);
                    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
                    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
                });
            case 'low-stock':
                return items.filter(p => (p.quantityOnHand || 0) < 10);
            case 'out-of-stock':
                return items.filter(p => (p.quantityOnHand || 0) === 0);
            default:
                return items;
        }
    };

    // Handle filter change
    const handleFilterChange = (filterType) => {
        setFilter(filterType);
        setShowFilterDropdown(false);
        
        if (searchTerm.length >= 2) {
            const filtered = applyFilter(products, filterType);
            setFilteredProducts(filtered);
        }
    };

    // Check expiry status
    const getExpiryStatus = (expiryDate) => {
        if (!expiryDate) return { status: 'unknown', label: 'No expiry', color: '#6B7280' };
        
        const expiry = new Date(expiryDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (expiry < today) {
            return { status: 'expired', label: 'EXPIRED', color: '#EF4444' };
        }
        
        const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry <= 7) {
            return { status: 'urgent', label: `URGENT (${daysUntilExpiry}d)`, color: '#EF4444' };
        } else if (daysUntilExpiry <= 14) {
            return { status: 'soon', label: `Soon (${daysUntilExpiry}d)`, color: '#F59E0B' };
        } else if (daysUntilExpiry <= 30) {
            return { status: 'warning', label: `${daysUntilExpiry}d`, color: '#D69E2E' };
        } else {
            return { status: 'safe', label: `${daysUntilExpiry}d`, color: '#10B981' };
        }
    };

    // View product details
    const viewProduct = (product) => {
        setSelectedProduct(product);
        document.body.style.overflow = 'hidden';
    };

    // Close modal
    const closeModal = () => {
        setSelectedProduct(null);
        document.body.style.overflow = 'auto';
    };

    // Click outside modal/filter to close
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                closeModal();
            }
            if (filterRef.current && !filterRef.current.contains(e.target)) {
                setShowFilterDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // SVG Icons
    const SearchIcon = () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

    const BackIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
        </svg>
    );

    const FilterIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14"/>
            <line x1="4" y1="10" x2="4" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12" y2="3"/>
            <line x1="20" y1="21" x2="20" y2="16"/>
            <line x1="20" y1="12" x2="20" y2="3"/>
            <line x1="1" y1="14" x2="7" y2="14"/>
            <line x1="9" y1="8" x2="15" y2="8"/>
            <line x1="17" y1="16" x2="23" y2="16"/>
        </svg>
    );

    const EyeIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>
    );

    const ChevronDownIcon = () => (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
        </svg>
    );

    const EmptyIcon = () => (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
    );

    const AdjustIcon = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4M12 22v-4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M22 12h-4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
    );

    const QuarantineIcon = () => (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="3" y1="15" x2="21" y2="15"/>
            <line x1="9" y1="21" x2="9" y2="9"/>
        </svg>
    );

    // Filter option icons
    const AllIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
    );

    const ExpiredIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
    );

    const ExpiringIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
        </svg>
    );

    const LowStockIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <line x1="16" y1="21" x2="16" y2="17"/>
            <line x1="8" y1="21" x2="8" y2="17"/>
            <line x1="2" y1="11" x2="22" y2="11"/>
        </svg>
    );

    const OutOfStockIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <line x1="16" y1="21" x2="16" y2="17"/>
            <line x1="8" y1="21" x2="8" y2="17"/>
            <line x1="2" y1="11" x2="22" y2="11"/>
            <line x1="12" y1="9" x2="12" y2="15"/>
            <line x1="9" y1="12" x2="15" y2="12"/>
        </svg>
    );

    const getFilterLabel = () => {
        switch(filter) {
            case 'expired': return 'Expired';
            case 'expiring-soon': return 'Expiring Soon';
            case 'low-stock': return 'Low Stock';
            case 'out-of-stock': return 'Out of Stock';
            default: return 'All Products';
        }
    };

    const getFilterIcon = () => {
        switch(filter) {
            case 'expired': return <ExpiredIcon />;
            case 'expiring-soon': return <ExpiringIcon />;
            case 'low-stock': return <LowStockIcon />;
            case 'out-of-stock': return <OutOfStockIcon />;
            default: return <AllIcon />;
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
                            <SearchIcon />
                            Search Products
                        </h1>
                        <p style={{
                            color: 'rgba(255,255,255,0.2)',
                            fontSize: '13px',
                            margin: '0'
                        }}>
                            Type to search, filter to narrow down
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

                {/* Error Message */}
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

                {/* Search Bar with Filter */}
                <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '20px',
                    flexWrap: 'wrap'
                }}>
                    {/* Search Input */}
                    <div style={{
                        position: 'relative',
                        flex: 1,
                        minWidth: '200px'
                    }}>
                        <span style={{
                            position: 'absolute',
                            left: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)'
                        }}>
                            <SearchIcon />
                        </span>
                        <input
                            ref={searchRef}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search by name, code, or batch..."
                            style={{
                                width: '100%',
                                padding: '10px 16px 10px 44px',
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '10px',
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
                        {searchTerm && (
                            <button
                                onClick={() => {
                                    handleSearch('');
                                    setFilter('all');
                                }}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'rgba(255,255,255,0.1)',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <CloseIcon />
                            </button>
                        )}
                    </div>

                    {/* Filter Dropdown */}
                    <div style={{ position: 'relative' }} ref={filterRef}>
                        <button
                            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                            style={{
                                padding: '10px 16px',
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '10px',
                                color: 'rgba(255,255,255,0.6)',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontFamily: 'inherit',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                            }}
                        >
                            <FilterIcon />
                            {getFilterLabel()}
                            <ChevronDownIcon />
                        </button>

                        {/* Filter Dropdown Menu */}
                        {showFilterDropdown && (
                            <div style={{
                                position: 'absolute',
                                top: 'calc(100% + 4px)',
                                right: 0,
                                background: '#1A1A1A',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '10px',
                                padding: '6px 0',
                                minWidth: '200px',
                                zIndex: 100,
                                boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                            }}>
                                {[
                                    { value: 'all', label: 'All Products', icon: <AllIcon /> },
                                    { value: 'expired', label: 'Expired', icon: <ExpiredIcon /> },
                                    { value: 'expiring-soon', label: 'Expiring Soon', icon: <ExpiringIcon /> },
                                    { value: 'low-stock', label: 'Low Stock (<10)', icon: <LowStockIcon /> },
                                    { value: 'out-of-stock', label: 'Out of Stock', icon: <OutOfStockIcon /> }
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleFilterChange(option.value)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            width: '100%',
                                            padding: '8px 16px',
                                            background: filter === option.value ? 'rgba(214,158,46,0.1)' : 'transparent',
                                            border: 'none',
                                            color: filter === option.value ? '#D69E2E' : 'rgba(255,255,255,0.4)',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            textAlign: 'left',
                                            fontFamily: 'inherit',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = filter === option.value ? 'rgba(214,158,46,0.1)' : 'transparent';
                                        }}
                                    >
                                        {option.icon}
                                        {option.label}
                                        {filter === option.value && (
                                            <span style={{ marginLeft: 'auto', color: '#D69E2E' }}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12"/>
                                                </svg>
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Results */}
                {!showResults && searchTerm.length < 2 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: 'rgba(255,255,255,0.05)'
                    }}>
                        <EmptyIcon />
                        <p style={{ marginTop: '12px', fontSize: '14px' }}>
                            Start typing to search for products
                        </p>
                    </div>
                )}

                {showResults && filteredProducts.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: 'rgba(255,255,255,0.05)'
                    }}>
                        <EmptyIcon />
                        <p style={{ marginTop: '12px', fontSize: '14px' }}>No products found</p>
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.03)' }}>
                            Try a different search term or filter
                        </p>
                    </div>
                )}

                {/* Product List */}
                {showResults && filteredProducts.length > 0 && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                    }}>
                        <div style={{
                            color: 'rgba(255,255,255,0.15)',
                            fontSize: '12px',
                            padding: '4px 0 8px 0'
                        }}>
                            {filteredProducts.length} result(s)
                        </div>
                        {filteredProducts.map((product) => {
                            const expiryStatus = getExpiryStatus(product.expiryDate);
                            const isExpired = expiryStatus.status === 'expired';
                            
                            return (
                                <div
                                    key={product._id}
                                    style={{
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.04)',
                                        borderRadius: '10px',
                                        padding: '12px 16px',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: '8px',
                                        opacity: isExpired ? 0.4 : 1
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                        e.currentTarget.style.borderColor = 'rgba(214,158,46,0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)';
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        flexWrap: 'wrap',
                                        flex: 1
                                    }}>
                                        <span style={{
                                            fontWeight: '500',
                                            color: '#FFFFFF',
                                            fontSize: '14px'
                                        }}>
                                            {product.name}
                                        </span>
                                        <span style={{
                                            fontSize: '11px',
                                            color: 'rgba(255,255,255,0.15)',
                                            background: 'rgba(255,255,255,0.03)',
                                            padding: '2px 8px',
                                            borderRadius: '4px'
                                        }}>
                                            {product.code || 'N/A'}
                                        </span>
                                        <span style={{
                                            fontSize: '11px',
                                            color: 'rgba(255,255,255,0.1)'
                                        }}>
                                            Batch: {product.batchNumber || 'N/A'}
                                        </span>
                                        <span style={{
                                            fontSize: '11px',
                                            color: 'rgba(255,255,255,0.15)'
                                        }}>
                                            Stock: <strong style={{ color: 'rgba(255,255,255,0.6)' }}>
                                                {product.quantityOnHand || 0}
                                            </strong>
                                        </span>
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        {product.expiryDate && (
                                            <span style={{
                                                fontSize: '10px',
                                                padding: '2px 10px',
                                                borderRadius: '12px',
                                                background: expiryStatus.color + '20',
                                                color: expiryStatus.color,
                                                border: '1px solid ' + expiryStatus.color + '30'
                                            }}>
                                                {expiryStatus.label}
                                            </span>
                                        )}
                                        
                                        {/* QUARANTINE BUTTON - SIMPLE */}
                                        <button
                                            onClick={() => {
                                                navigate('/quarantine');
                                            }}
                                            style={{
                                                padding: '4px 10px',
                                                background: 'rgba(239,68,68,0.1)',
                                                border: '1px solid rgba(239,68,68,0.2)',
                                                borderRadius: '6px',
                                                color: '#EF4444',
                                                cursor: 'pointer',
                                                fontSize: '11px',
                                                fontFamily: 'inherit',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                                            }}
                                        >
                                            <QuarantineIcon />
                                            Quarantine
                                        </button>
                                        
                                        <button
                                            onClick={() => viewProduct(product)}
                                            style={{
                                                padding: '4px 10px',
                                                background: 'rgba(255,255,255,0.04)',
                                                border: '1px solid rgba(255,255,255,0.06)',
                                                borderRadius: '6px',
                                                color: 'rgba(255,255,255,0.3)',
                                                cursor: 'pointer',
                                                fontSize: '11px',
                                                fontFamily: 'inherit',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                                e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                                e.currentTarget.style.color = 'rgba(255,255,255,0.3)';
                                            }}
                                        >
                                            <EyeIcon /> View
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Product Details Modal */}
                {selectedProduct && (
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
                        <div
                            ref={modalRef}
                            style={{
                                background: '#1A1A1A',
                                borderRadius: '16px',
                                padding: '28px',
                                maxWidth: '480px',
                                width: '100%',
                                maxHeight: '85vh',
                                overflow: 'auto',
                                border: '1px solid rgba(255,255,255,0.06)'
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '16px'
                            }}>
                                <h2 style={{
                                    fontSize: '20px',
                                    fontWeight: '600',
                                    color: '#FFFFFF',
                                    margin: 0
                                }}>
                                    {selectedProduct.name}
                                </h2>
                                <button
                                    onClick={closeModal}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'rgba(255,255,255,0.2)',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        fontSize: '18px'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}
                                >
                                    <CloseIcon />
                                </button>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '8px 16px',
                                fontSize: '13px'
                            }}>
                                <div>
                                    <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px' }}>Code</div>
                                    <div style={{ color: 'rgba(255,255,255,0.8)' }}>{selectedProduct.code || 'N/A'}</div>
                                </div>
                                <div>
                                    <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px' }}>Batch</div>
                                    <div style={{ color: 'rgba(255,255,255,0.8)' }}>{selectedProduct.batchNumber || 'N/A'}</div>
                                </div>
                                <div>
                                    <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px' }}>Stock</div>
                                    <div style={{ color: '#10B981', fontWeight: '600' }}>{selectedProduct.quantityOnHand || 0}</div>
                                </div>
                                <div>
                                    <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px' }}>Expiry</div>
                                    <div style={{ 
                                        color: getExpiryStatus(selectedProduct.expiryDate).color,
                                        fontWeight: '500'
                                    }}>
                                        {selectedProduct.expiryDate ? new Date(selectedProduct.expiryDate).toLocaleDateString() : 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px' }}>Category</div>
                                    <div style={{ color: 'rgba(255,255,255,0.8)' }}>{selectedProduct.category || 'N/A'}</div>
                                </div>
                                <div>
                                    <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px' }}>Supplier</div>
                                    <div style={{ color: 'rgba(255,255,255,0.8)' }}>{selectedProduct.supplier || 'N/A'}</div>
                                </div>
                            </div>

                            <div style={{
                                marginTop: '16px',
                                paddingTop: '12px',
                                borderTop: '1px solid rgba(255,255,255,0.04)',
                                display: 'flex',
                                gap: '8px',
                                justifyContent: 'flex-end'
                            }}>
                                <button
                                    onClick={() => {
                                        closeModal();
                                        navigate('/quarantine');
                                    }}
                                    style={{
                                        padding: '6px 16px',
                                        background: 'rgba(239,68,68,0.1)',
                                        border: '1px solid rgba(239,68,68,0.2)',
                                        borderRadius: '6px',
                                        color: '#EF4444',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontFamily: 'inherit',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                                    }}
                                >
                                    <QuarantineIcon /> Quarantine
                                </button>
                                <button
                                    onClick={closeModal}
                                    style={{
                                        padding: '6px 16px',
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        borderRadius: '6px',
                                        color: 'rgba(255,255,255,0.4)',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontFamily: 'inherit'
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
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        closeModal();
                                        navigate('/stock-adjustment');
                                    }}
                                    style={{
                                        padding: '6px 16px',
                                        background: 'linear-gradient(135deg, #D69E2E, #B8860B)',
                                        border: 'none',
                                        borderRadius: '6px',
                                        color: '#FFFFFF',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        fontFamily: 'inherit',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <AdjustIcon /> Adjust Stock
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchProducts;