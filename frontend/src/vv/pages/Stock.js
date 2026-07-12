import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/styles.css';
import api from '../services/api';

// SVG Icons
const Icons = {
    Back: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
        </svg>
    ),
    Search: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
    ),
    Filter: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 13 10 21 14 18 14 13 22 3"/>
        </svg>
    ),
    Calendar: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
    ),
    LowStock: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
    ),
    Critical: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
    ),
    InStock: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
        </svg>
    ),
    Pharmacy: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D69E2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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

const Stock = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [filterDate, setFilterDate] = useState('');
    const [filterMonth, setFilterMonth] = useState('');
    const [filterYear, setFilterYear] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        low: 0,
        critical: 0,
        inStock: 0
    });

    // Month options
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
    const years = ['2023', '2024', '2025', '2026', '2027'];

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/products');
            if (response.data && response.data.success) {
                setProducts(response.data.data);
                setFilteredProducts(response.data.data);
                updateStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const updateStats = (products) => {
        const total = products.length;
        const low = products.filter(p => p.quantityOnHand > 0 && p.quantityOnHand <= 10).length;
        const critical = products.filter(p => p.quantityOnHand === 0).length;
        const inStock = products.filter(p => p.quantityOnHand > 10).length;
        setStats({ total, low, critical, inStock });
    };

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        applyFilters(term, filter, filterDate, filterMonth, filterYear);
    };

    const handleFilter = (newFilter) => {
        setFilter(newFilter);
        applyFilters(searchTerm, newFilter, filterDate, filterMonth, filterYear);
    };

    const handleDateFilter = (e) => {
        const value = e.target.value;
        setFilterDate(value);
        applyFilters(searchTerm, filter, value, filterMonth, filterYear);
    };

    const handleMonthFilter = (e) => {
        const value = e.target.value;
        setFilterMonth(value);
        applyFilters(searchTerm, filter, filterDate, value, filterYear);
    };

    const handleYearFilter = (e) => {
        const value = e.target.value;
        setFilterYear(value);
        applyFilters(searchTerm, filter, filterDate, filterMonth, value);
    };

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    const applyFilters = (term, filterType, date, month, year) => {
        let filtered = products;

        // Search filter
        if (term) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(term) ||
                (p.code && p.code.toLowerCase().includes(term)) ||
                (p.strength && p.strength.toLowerCase().includes(term))
            );
        }

        // Date/Month/Year filters - filter by product creation or transaction date
        // For now, we'll filter by product creation date since we have that data
        if (date || month || year) {
            filtered = filtered.filter(p => {
                const created = new Date(p.createdAt);
                const day = String(created.getDate()).padStart(2, '0');
                const monthName = months[created.getMonth()];
                const yearNum = String(created.getFullYear());
                
                let match = true;
                if (date && day !== date) match = false;
                if (month && monthName !== month) match = false;
                if (year && yearNum !== year) match = false;
                return match;
            });
        }

        // Stock status filter
        if (filterType === 'low') {
            filtered = filtered.filter(p => p.quantityOnHand > 0 && p.quantityOnHand <= 10);
        } else if (filterType === 'critical') {
            filtered = filtered.filter(p => p.quantityOnHand === 0);
        } else if (filterType === 'in-stock') {
            filtered = filtered.filter(p => p.quantityOnHand > 10);
        }

        setFilteredProducts(filtered);
        updateStats(filtered);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilter('all');
        setFilterDate('');
        setFilterMonth('');
        setFilterYear('');
        setShowFilters(false);
        setFilteredProducts(products);
        updateStats(products);
    };

    const getStockStatus = (quantity) => {
        if (quantity === 0) return { label: 'Critical', class: 'critical', icon: <Icons.Critical /> };
        if (quantity <= 10) return { label: 'Low Stock', class: 'low', icon: <Icons.LowStock /> };
        return { label: 'In Stock', class: 'in-stock', icon: <Icons.InStock /> };
    };

    const isFilterActive = filter !== 'all' || filterDate || filterMonth || filterYear || searchTerm;

    return (
        <div className="stock-modern-wrapper">
            {/* Header */}
            <header className="stock-modern-header">
                <div className="stock-header-left">
                    <Icons.Pharmacy />
                    <span className="stock-header-brand">MedOx <span className="gold">Pharmacy</span></span>
                    <span className="stock-header-badge">Stock</span>
                </div>
                <div className="stock-header-right">
                    <button className="stock-btn-back" onClick={() => navigate('/dashboard')}>
                        <Icons.Back /> Back
                    </button>
                </div>
            </header>

            {/* Content */}
            <div className="stock-modern-content">
                <div className="stock-modern-container">
                    {/* Page Header */}
                    <div className="stock-page-header">
                        <h1>Stock Inventory</h1>
                        <p>Manage and monitor your pharmacy stock</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="stock-stats">
                        <div className="stock-stat-card total">
                            <span className="stock-stat-number">{stats.total}</span>
                            <span className="stock-stat-label">Total Products</span>
                        </div>
                        <div className="stock-stat-card low">
                            <span className="stock-stat-number" style={{ color: '#F59E0B' }}>{stats.low}</span>
                            <span className="stock-stat-label">Low Stock</span>
                        </div>
                        <div className="stock-stat-card critical">
                            <span className="stock-stat-number" style={{ color: '#EF4444' }}>{stats.critical}</span>
                            <span className="stock-stat-label">Critical</span>
                        </div>
                        <div className="stock-stat-card in-stock">
                            <span className="stock-stat-number" style={{ color: '#10B981' }}>{stats.inStock}</span>
                            <span className="stock-stat-label">In Stock</span>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="stock-toolbar">
                        <div className="stock-search">
                            <Icons.Search />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>
                        <button 
                            className={`stock-filter-toggle ${showFilters ? 'active' : ''}`}
                            onClick={toggleFilters}
                        >
                            <Icons.Filter />
                            <span>Filter</span>
                            <span className="filter-toggle-badge">
                                {isFilterActive ? '1' : '0'}
                            </span>
                        </button>
                    </div>

                    {/* Filters Dropdown */}
                    {showFilters && (
                        <div className="stock-filters-dropdown">
                            <div className="filter-section">
                                <label className="filter-label">Status</label>
                                <div className="filter-options">
                                    <button 
                                        className={`stock-filter-btn ${filter === 'all' ? 'active' : ''}`}
                                        onClick={() => handleFilter('all')}
                                    >
                                        All
                                        <span className="filter-badge">{stats.total}</span>
                                    </button>
                                    <button 
                                        className={`stock-filter-btn ${filter === 'critical' ? 'active' : ''}`}
                                        onClick={() => handleFilter('critical')}
                                    >
                                        Critical
                                        <span className="filter-badge critical">{stats.critical}</span>
                                    </button>
                                    <button 
                                        className={`stock-filter-btn ${filter === 'low' ? 'active' : ''}`}
                                        onClick={() => handleFilter('low')}
                                    >
                                        Low Stock
                                        <span className="filter-badge low">{stats.low}</span>
                                    </button>
                                    <button 
                                        className={`stock-filter-btn ${filter === 'in-stock' ? 'active' : ''}`}
                                        onClick={() => handleFilter('in-stock')}
                                    >
                                        In Stock
                                        <span className="filter-badge instock">{stats.inStock}</span>
                                    </button>
                                </div>
                            </div>

                            <div className="filter-divider"></div>

                            <div className="filter-section">
                                <label className="filter-label">Date Filter</label>
                                <div className="filter-date-group">
                                    <div className="filter-date-item">
                                        <label>Day</label>
                                        <select value={filterDate} onChange={handleDateFilter}>
                                            <option value="">All Days</option>
                                            {days.map(day => (
                                                <option key={day} value={day}>{day}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="filter-date-item">
                                        <label>Month</label>
                                        <select value={filterMonth} onChange={handleMonthFilter}>
                                            <option value="">All Months</option>
                                            {months.map(month => (
                                                <option key={month} value={month}>{month}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="filter-date-item">
                                        <label>Year</label>
                                        <select value={filterYear} onChange={handleYearFilter}>
                                            <option value="">All Years</option>
                                            {years.map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="filter-actions">
                                <button className="stock-filter-apply" onClick={() => setShowFilters(false)}>
                                    Apply Filters
                                </button>
                                {isFilterActive && (
                                    <button className="stock-filter-clear" onClick={clearFilters}>
                                        Clear All
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Products Table */}
                    <div className="stock-table-wrapper">
                        {loading ? (
                            <div className="stock-loading">Loading products...</div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="stock-empty">
                                <Icons.Empty />
                                <p>No products found</p>
                                <span>Try adjusting your search or filters</span>
                            </div>
                        ) : (
                            <table className="stock-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Product</th>
                                        <th>Code</th>
                                        <th>Strength</th>
                                        <th>Stock</th>
                                        <th>Status</th>
                                        <th>Price</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map((product, index) => {
                                        const status = getStockStatus(product.quantityOnHand);
                                        return (
                                            <tr key={product._id} className={`stock-row ${status.class}`}>
                                                <td>{index + 1}</td>
                                                <td className="stock-product-name">{product.name}</td>
                                                <td>{product.code || '—'}</td>
                                                <td>{product.strength || '—'}</td>
                                                <td className="stock-quantity">{product.quantityOnHand}</td>
                                                <td>
                                                    <span className={`stock-status-badge ${status.class}`}>
                                                        {status.icon}
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td>MK {product.sellingPrice?.toFixed(2) || '0.00'}</td>
                                                <td>
                                                    <button
                                                        className="stock-view-card-btn"
                                                        onClick={() => navigate(`/stock-card/${product._id}`)}
                                                    >
                                                        View Card
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Stock;
