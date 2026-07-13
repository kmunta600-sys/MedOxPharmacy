import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/styles.css';
import api from '../services/api';

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
    Check: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    ),
    ViewCard: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D69E2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
            <path d="M17 9l-5 5-5-5"/>
            <line x1="12" y1="14" x2="12" y2="3"/>
        </svg>
    )
};

const PhysicalInventory = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [physicalCount, setPhysicalCount] = useState('');
    const [officerName, setOfficerName] = useState('');
    const [notes, setNotes] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [countedProducts, setCountedProducts] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        
        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            if (userData && userData.firstName) {
                const fullName = userData.firstName + ' ' + (userData.lastName || '');
                setOfficerName(fullName.trim());
            } else if (userData && userData.email) {
                setOfficerName(userData.email);
            }
        } catch (e) {
            console.error('Error loading user:', e);
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
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        
        if (term === '') {
            setFilteredProducts(products);
            return;
        }
        
        const filtered = products.filter(p =>
            p.name.toLowerCase().includes(term) ||
            (p.code && p.code.toLowerCase().includes(term))
        );
        setFilteredProducts(filtered);
    };

    const selectProduct = (product) => {
        setSelectedProduct(product);
        setPhysicalCount('');
        setError('');
        setMessage('');
    };

    const viewStockCard = (productId) => {
        navigate(`/stockcard/${productId}?returnTo=/physical`);
    };

    const submitPhysicalCount = async () => {
        if (!selectedProduct) {
            setError('Please select a product');
            return;
        }
        
            const count = parseInt(physicalCount);
    if (isNaN(count) || count < 0) {
        setError('Please enter a valid physical count (cannot be negative)');
        return;
    }
        if (isNaN(count) || count < 0) {
            setError('Please enter a valid physical count');
            return;
        }
        
        if (!officerName.trim()) {
            setError('Please enter your name as the counting officer');
            return;
        }

        setSubmitting(true);
        setError('');
        setMessage('');

        try {
            const updateData = {
                quantityOnHand: count,
                remarks: `Physical Inventory - ${new Date().toLocaleDateString()} - Counted by: ${officerName}${notes ? ' - ' + notes : ''}`
            };

            const response = await api.put(`/api/products/${selectedProduct._id}`, updateData);

            if (response.data && response.data.success) {
                setMessage(` ${selectedProduct.name} updated successfully!`);
                
                setCountedProducts(prev => [...prev, {
                    name: selectedProduct.name,
                    code: selectedProduct.code,
                    oldQty: selectedProduct.quantityOnHand,
                    newQty: count,
                    officer: officerName,
                    date: new Date().toLocaleDateString()
                }]);
                
                const today = new Date();
                const month = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
                localStorage.setItem('physical_inventory_done', 'true');
                localStorage.setItem('physical_inventory_month', month);
                localStorage.setItem('physical_inventory_reminder_shown', 'true');
                localStorage.setItem('physical_inventory_reminder_month', month);
                
                setSelectedProduct(null);
                setPhysicalCount('');
                setNotes('');
                
                await fetchProducts();
            }
        } catch (error) {
            console.error('Error updating product:', error);
            setError('Failed to update physical count. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="physical-inventory-wrapper">
            <header className="physical-header">
                <div className="physical-header-left">
                    <Icons.Pharmacy />
                    <span className="physical-brand">MedOx <span className="gold">Pharmacy</span></span>
                    <span className="physical-badge">Physical Inventory</span>
                </div>
                <div className="physical-header-right">
                    <button className="physical-btn-back" onClick={() => navigate('/dashboard')}>
                        <Icons.Back /> Back
                    </button>
                </div>
            </header>

            <div className="physical-content">
                <div className="physical-container">
                    <div className="physical-page-header">
                        <h1>Physical Inventory Count</h1>
                        <p>Search for a product and enter the physical count from the shelf</p>
                    </div>

                    {message && <div className="physical-message success">{message}</div>}
                    {error && <div className="physical-message error">{error}</div>}

                    <div className="physical-search-section">
                        <div className="physical-search">
                            <Icons.Search />
                            <input
                                type="text"
                                placeholder="Search product by name or code..."
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>
                    </div>

                    <div className="physical-grid">
                        {/* Product List */}
                        <div className="physical-product-list">
                            <h3>Products</h3>
                            {loading ? (
                                <div className="physical-loading">Loading...</div>
                            ) : filteredProducts.length === 0 ? (
                                <div className="physical-empty">
                                    <Icons.Empty />
                                    <p>No products found</p>
                                </div>
                            ) : (
                                filteredProducts.map(product => (
                                    <div 
                                        key={product._id} 
                                        className={`physical-product-item ${selectedProduct?._id === product._id ? 'selected' : ''}`}
                                        onClick={() => selectProduct(product)}
                                    >
                                        <div className="physical-product-name">{product.name}</div>
                                        <div className="physical-product-code">{product.code || 'N/A'}</div>
                                        <div className="physical-product-stock">System: {product.quantityOnHand || 0}</div>
                                        {countedProducts.some(p => p.name === product.name) && (
                                            <span className="physical-product-checked"></span>
                                        )}
                                        <button 
                                            className="physical-list-view-card"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                viewStockCard(product._id);
                                            }}
                                            title="View Stock Card"
                                        >
                                            <Icons.ViewCard />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Count Form */}
                        <div className="physical-count-form">
                            <h3>Enter Physical Count</h3>
                            {selectedProduct ? (
                                <div className="physical-count-card">
                                    <div className="physical-count-product">
                                        <h4>{selectedProduct.name}</h4>
                                        <div className="physical-count-details">
                                            <span>Code: {selectedProduct.code || 'N/A'}</span>
                                            <span>Strength: {selectedProduct.strength || 'N/A'}</span>
                                            <span>System Quantity: <strong>{selectedProduct.quantityOnHand || 0}</strong></span>
                                        </div>
                                        <button 
                                            className="physical-view-card-btn"
                                            onClick={() => viewStockCard(selectedProduct._id)}
                                        >
                                            <Icons.ViewCard /> View Stock Card
                                        </button>
                                    </div>

                                    <div className="physical-count-inputs">
                                        <div className="physical-count-field">
                                            <label>Physical Count:</label>
                                            <input
                                                type="number"
                                                className="physical-count-input"
                                                value={physicalCount}
                                                onChange={(e) => setPhysicalCount(e.target.value)}
                                                placeholder="Enter actual quantity"
                                                min="0"
                                                autoFocus
                                            />
                                        </div>

                                        <div className="physical-count-field">
                                            <label>Counting Officer:</label>
                                            <input
                                                type="text"
                                                className="physical-count-input"
                                                value={officerName}
                                                onChange={(e) => setOfficerName(e.target.value)}
                                                placeholder="Enter your full name"
                                                readOnly={!!officerName}
                                                style={officerName ? { color: '#D69E2E', fontWeight: '500' } : {}}
                                            />
                                            {officerName && <span className="officer-auto">Auto-filled from account</span>}
                                        </div>

                                        <div className="physical-count-field">
                                            <label>Notes (optional):</label>
                                            <input
                                                type="text"
                                                className="physical-count-input"
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                placeholder="Any observations"
                                            />
                                        </div>
                                    </div>

                                    <div className="physical-count-actions">
                                        <button 
                                            className="physical-btn-submit" 
                                            onClick={submitPhysicalCount}
                                            disabled={submitting}
                                        >
                                            {submitting ? 'Updating...' : 'Update Stock Card'}
                                        </button>
                                        <button 
                                            className="physical-btn-cancel"
                                            onClick={() => {
                                                setSelectedProduct(null);
                                                setPhysicalCount('');
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="physical-count-placeholder">
                                    <Icons.Empty />
                                    <p>Select a product from the list</p>
                                    <span>Search and click on a product to start counting</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Counted Products Summary */}
                    {countedProducts.length > 0 && (
                        <div className="physical-counted-summary">
                            <h3>Counted Products Today</h3>
                            <div className="counted-list">
                                {countedProducts.map((item, index) => (
                                    <div key={index} className="counted-item">
                                        <span className="counted-name">{item.name}</span>
                                        <span className="counted-change">
                                            {item.oldQty} → {item.newQty}
                                        </span>
                                        <span className="counted-officer">By: {item.officer}</span>
                                        <span className="counted-date">{item.date}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PhysicalInventory;











