import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/styles.css';
import api from '../services/api';

// Modern SVG Icons - Consistent with other pages
const Icons = {
    Pharmacy: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D69E2E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
        </svg>
    ),
    Back: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
        </svg>
    ),
    Logout: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
    ),
    Search: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
    ),
    Filter: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 13 10 21 14 18 14 13 22 3"/>
        </svg>
    ),
    Clear: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
    ),
    View: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>
    ),
    Edit: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/>
            <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"/>
        </svg>
    ),
    LowStock: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v4"/>
            <path d="M12 17h.01"/>
            <circle cx="12" cy="12" r="10"/>
        </svg>
    ),
    Critical: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
        </svg>
    ),
    InStock: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
        </svg>
    ),
    Expiring: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
        </svg>
    )
};

const SearchProducts = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchProducts();
    }, []);

    useEffect(() => {
        if (searchRef.current) {
            searchRef.current.focus();
        }
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/products');
            if (response.data && response.data.success) {
                setProducts(response.data.data);
                setFilteredProducts(response.data.data);
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

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        applyFilters(value, selectedFilter);
    };

    const applyFilters = (search, filter) => {
        let result = [...products];

        if (search) {
            const term = search.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(term) ||
                (p.strength && p.strength.toLowerCase().includes(term)) ||
                (p.code && p.code.toLowerCase().includes(term)) ||
                (p.category && p.category.toLowerCase().includes(term)) ||
                (p.batchNumber && p.batchNumber.toLowerCase().includes(term)) ||
                (p.supplier && p.supplier.toLowerCase().includes(term))
            );
        }

        switch (filter) {
            case 'low':
                result = result.filter(p => p.quantityOnHand > 0 && p.quantityOnHand <= (p.minStock || 50));
                break;
            case 'critical':
                result = result.filter(p => p.quantityOnHand > 0 && p.quantityOnHand < 10);
                break;
            case 'instock':
                result = result.filter(p => p.quantityOnHand > 0);
                break;
            case 'outofstock':
                result = result.filter(p => p.quantityOnHand === 0);
                break;
            case 'expiring':
                const today = new Date();
                const thirtyDays = new Date();
                thirtyDays.setDate(today.getDate() + 30);
                result = result.filter(p => {
                    if (!p.expiryDate) return false;
                    const expiry = new Date(p.expiryDate);
                    return expiry > today && expiry <= thirtyDays && p.quantityOnHand > 0;
                });
                break;
            default:
                break;
        }

        setFilteredProducts(result);
    };

    const handleFilterClick = (filter) => {
        setSelectedFilter(filter);
        applyFilters(searchTerm, filter);
    };

    const clearSearch = () => {
        setSearchTerm('');
        setSelectedFilter('all');
        setFilteredProducts(products);
        if (searchRef.current) {
            searchRef.current.focus();
        }
    };

    const getStockStatus = (product) => {
        const stock = product.quantityOnHand || 0;
        if (stock === 0) return { label: 'Out of Stock', color: '#EF4444' };
        if (stock < 10) return { label: 'Critical', color: '#EF4444' };
        if (stock <= (product.minStock || 50)) return { label: 'Low', color: '#F59E0B' };
        return { label: 'In Stock', color: '#10B981' };
    };

    const filters = [
        { id: 'all', label: 'All' },
        { id: 'low', label: 'Low Stock', icon: <Icons.LowStock /> },
        { id: 'critical', label: 'Critical', icon: <Icons.Critical /> },
        { id: 'instock', label: 'In Stock', icon: <Icons.InStock /> },
        { id: 'outofstock', label: 'Out of Stock', icon: <Icons.Clear /> },
        { id: 'expiring', label: 'Expiring Soon', icon: <Icons.Expiring /> },
    ];

    return (
        <div className="search-modern-wrapper">
            <header className="search-modern-header">
                <div className="header-left">
                    <Icons.Pharmacy />
                    <span className="header-brand">MedOx <span className="gold">Pharmacy</span></span>
                    <span className="header-badge">Search</span>
                </div>
                <div className="header-right">
                    <button className="btn-back" onClick={() => navigate('/dashboard')}>
                        <Icons.Back /> Back
                    </button>
                    <button className="btn-logout" onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        navigate('/login');
                    }}>
                        <Icons.Logout /> Logout
                    </button>
                </div>
            </header>

            <div className="search-modern-content">
                <div className="search-modern-container">
                    <div className="search-page-header">
                        <h1><Icons.Search /> Search Products</h1>
                        <p>Find products by name, code, category, or batch number</p>
                    </div>

                    <div className="search-bar-wrapper">
                        <div className="search-input-wrapper">
                            <Icons.Search />
                            <input
                                ref={searchRef}
                                type="text"
                                className="search-input"
                                placeholder="Search by name, code, category, batch..."
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                            {searchTerm && (
                                <button className="search-clear-btn" onClick={clearSearch}>
                                    <Icons.Clear />
                                </button>
                            )}
                        </div>
                        <button 
                            className="search-filter-toggle"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Icons.Filter />
                            Filters
                            {selectedFilter !== 'all' && <span className="filter-badge">1</span>}
                        </button>
                    </div>

                    {showFilters && (
                        <div className="search-filters">
                            {filters.map(filter => (
                                <button
                                    key={filter.id}
                                    className={`filter-btn ${selectedFilter === filter.id ? 'active' : ''}`}
                                    onClick={() => handleFilterClick(filter.id)}
                                >
                                    {filter.icon && <span className="filter-icon">{filter.icon}</span>}
                                    {filter.label}
                                </button>
                            ))}
                            {selectedFilter !== 'all' && (
                                <button className="filter-clear" onClick={() => handleFilterClick('all')}>
                                    <Icons.Clear /> Clear Filter
                                </button>
                            )}
                        </div>
                    )}

                    <div className="search-results-count">
                        <span>{filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found</span>
                        {searchTerm && <span className="search-term">for "{searchTerm}"</span>}
                        {selectedFilter !== 'all' && (
                            <span className="search-filter-label">• {filters.find(f => f.id === selectedFilter)?.label}</span>
                        )}
                    </div>

                    <div className="search-results-wrapper">
                        {loading ? (
                            <div className="search-loading">Loading products...</div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="search-empty">
                                <Icons.Search />
                                <p>No products found</p>
                                <span>Try adjusting your search or filters</span>
                            </div>
                        ) : (
                            <div className="search-table-wrapper">
                                <table className="search-table">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Code</th>
                                            <th>Stock</th>
                                            <th>Status</th>
                                            <th>Price</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProducts.map((product) => {
                                            const status = getStockStatus(product);
                                            return (
                                                <tr key={product._id}>
                                                    <td className="product-cell">
                                                        <div className="product-name">{product.name}</div>
                                                        <div className="product-detail">
                                                            {product.strength || ''}
                                                            {product.category && <span className="product-category">• {product.category}</span>}
                                                        </div>
                                                    </td>
                                                    <td className="product-code">{product.code || '—'}</td>
                                                    <td className="product-stock">{product.quantityOnHand || 0}</td>
                                                    <td>
                                                        <span className="stock-status" style={{ backgroundColor: status.color + '15', color: status.color }}>
                                                            {status.label}
                                                        </span>
                                                    </td>
                                                    <td className="product-price">
                                                        {product.sellingPrice ? `MK ${product.sellingPrice.toFixed(2)}` : '—'}
                                                    </td>
                                                    <td className="product-actions">
                                                        <button className="action-btn view-btn" title="View Details">
                                                            <Icons.View />
                                                        </button>
                                                        <button className="action-btn edit-btn" title="Edit Product">
                                                            <Icons.Edit />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchProducts;
