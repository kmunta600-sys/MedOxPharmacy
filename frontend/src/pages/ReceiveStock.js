import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import IntelligentDropdown from '../components/IntelligentDropdown';
import './ReceiveStock.css';

const ReceiveStock = () => {
    const navigate = useNavigate();
    
    // Form state
    const [dnoteNumber, setDnoteNumber] = useState('');
    const [supplier, setSupplier] = useState('');
    const [supplierId, setSupplierId] = useState('');
    const [receiveDate, setReceiveDate] = useState(new Date().toISOString().split('T')[0]);
    const [remarks, setRemarks] = useState('');
    
    // Suppliers
    const [suppliers, setSuppliers] = useState([]);
    const [supplierNames, setSupplierNames] = useState([]);
    
    // Search
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [noResults, setNoResults] = useState(false);
    
    // Items
    const [items, setItems] = useState([]);
    
    // UI
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [warning, setWarning] = useState('');
    
    // Refs
    const searchRef = useRef(null);
    const dnoteRef = useRef(null);
    const dropdownRef = useRef(null);
    const searchTimeout = useRef(null);

    // Load suppliers
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        loadSuppliers();
        setTimeout(() => dnoteRef.current?.focus(), 100);
    }, []);

    const loadSuppliers = async () => {
        try {
            const res = await api.get('/stock/suppliers');
            if (res.data.success) {
                setSuppliers(res.data.data);
                setSupplierNames(res.data.data.map(s => s.name));
            }
        } catch (err) {
            console.error('Error loading suppliers:', err);
        }
    };

    // Check expiry
    const checkExpiry = (date) => {
        if (!date) return { isExpired: false, daysLeft: null };
        const expiry = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isExpired = expiry < today;
        const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        return { isExpired, daysLeft };
    };

    // Handle supplier
    const handleAddSupplier = async (name) => {
        try {
            const res = await api.post('/stock/suppliers', { name });
            if (res.data.success) {
                setSuppliers([...suppliers, res.data.data]);
                setSupplierNames([...supplierNames, name]);
                setSupplier(name);
                setSupplierId(res.data.data._id);
                setSuccess('Supplier added');
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            if (err.response?.data?.data) {
                setSupplier(name);
                setSupplierId(err.response.data.data._id);
                setError('Supplier already exists');
                setTimeout(() => setError(''), 3000);
            }
        }
    };

    const handleEditSupplier = async (oldName, newName) => {
        const supplierToEdit = suppliers.find(s => s.name === oldName);
        if (supplierToEdit) {
            try {
                const res = await api.put(`/stock/suppliers/${supplierToEdit._id}`, { name: newName });
                if (res.data.success) {
                    setSuppliers(suppliers.map(s => s._id === supplierToEdit._id ? res.data.data : s));
                    setSupplierNames(supplierNames.map(n => n === oldName ? newName : n));
                    if (supplier === oldName) {
                        setSupplier(newName);
                    }
                    setSuccess('Supplier updated');
                    setTimeout(() => setSuccess(''), 3000);
                }
            } catch (err) {
                setError('Failed to update supplier');
            }
        }
    };

    const handleDeleteSupplier = async (name) => {
        const s = suppliers.find(x => x.name === name);
        if (s) {
            try {
                await api.delete(`/stock/suppliers/${s._id}`);
                setSuppliers(suppliers.filter(x => x.name !== name));
                setSupplierNames(supplierNames.filter(n => n !== name));
                if (supplier === name) {
                    setSupplier('');
                    setSupplierId('');
                }
                setSuccess('Supplier deleted');
                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                setError('Failed to delete supplier');
            }
        }
    };

    // Product search - search products from backend
    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        
        if (searchTerm.length < 2) {
            setSearchResults([]);
            setShowDropdown(false);
            setActiveIndex(-1);
            setNoResults(false);
            return;
        }
        
        setIsSearching(true);
        setNoResults(false);
        
        searchTimeout.current = setTimeout(async () => {
            try {
                console.log(`🔍 Searching for: "${searchTerm}"`);
                const res = await api.get(`/products?search=${encodeURIComponent(searchTerm)}`);
                console.log('📦 Search response:', res.data);
                
                if (res.data.success) {
                    const products = res.data.data || [];
                    setSearchResults(products);
                    setShowDropdown(products.length > 0);
                    setNoResults(products.length === 0);
                    console.log(`🔍 Found ${products.length} products for "${searchTerm}"`);
                } else {
                    setSearchResults([]);
                    setShowDropdown(false);
                    setNoResults(true);
                }
            } catch (err) {
                console.error('❌ Search error:', err);
                setSearchResults([]);
                setShowDropdown(false);
                setNoResults(true);
            } finally {
                setIsSearching(false);
            }
        }, 300);
        
        return () => { 
            if (searchTimeout.current) clearTimeout(searchTimeout.current); 
        };
    }, [searchTerm]);

    // Scroll active item into view in search dropdown
    useEffect(() => {
        if (activeIndex >= 0 && dropdownRef.current) {
            const items = dropdownRef.current.querySelectorAll('.dropdown-item');
            if (items && items[activeIndex]) {
                items[activeIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }, [activeIndex]);

    // Keyboard navigation for dropdown
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!showDropdown) return;
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex(prev => Math.min(prev + 1, searchResults.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex(prev => Math.max(prev - 1, -1));
            } else if (e.key === 'Enter' && activeIndex >= 0) {
                e.preventDefault();
                handleSelectProduct(searchResults[activeIndex]);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setShowDropdown(false);
                setActiveIndex(-1);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [showDropdown, searchResults, activeIndex]);

    const handleSelectProduct = (product) => {
        // Check if the product's current batch is expired
        const { isExpired, daysLeft } = checkExpiry(product.expiryDate);
        
        if (isExpired) {
            setWarning(`Note: ${product.name} has an expired batch. You can still receive a NEW batch.`);
            setTimeout(() => setWarning(''), 8000);
        } else if (daysLeft !== null && daysLeft <= 30 && daysLeft > 0) {
            setWarning(`${product.name} current batch expires in ${daysLeft} days`);
            setTimeout(() => setWarning(''), 5000);
        } else {
            setWarning('');
        }

        setSelectedProduct({
            ...product,
            quantity: 1,
            batchNumber: '',
            expiryDate: '',
            costPrice: product.unitCost || 0,
            sellingPrice: product.sellingPrice || 0
        });
        setSearchTerm(product.name);
        setShowDropdown(false);
        setActiveIndex(-1);
        setError('');
        setNoResults(false);
        
        setTimeout(() => {
            const batchInput = document.getElementById('receive-batch');
            if (batchInput) batchInput.focus();
        }, 100);
    };

    const addItem = () => {
        if (!selectedProduct) {
            setError('Search and select a product first');
            return;
        }

        const qtyInput = document.getElementById('receive-qty');
        const qty = parseInt(qtyInput?.value) || 1;
        if (qty <= 0) {
            setError('Quantity must be greater than 0');
            return;
        }

        // Check if the NEW batch expiry date is valid
        if (selectedProduct.expiryDate) {
            const { isExpired } = checkExpiry(selectedProduct.expiryDate);
            if (isExpired) {
                setError('Cannot receive this batch - the expiry date is in the past.');
                return;
            }
        } else {
            setError('Expiry date is required for the new batch');
            return;
        }

        // Check if already in list
        const existing = items.find(i => i.productId === selectedProduct._id);
        if (existing) {
            const updated = items.map(i => 
                i.productId === selectedProduct._id 
                    ? { ...i, quantity: i.quantity + qty }
                    : i
            );
            setItems(updated);
            setSuccess(`Updated ${selectedProduct.name}`);
        } else {
            const newItem = {
                productId: selectedProduct._id,
                name: selectedProduct.name,
                code: selectedProduct.code || 'N/A',
                quantity: qty,
                batchNumber: selectedProduct.batchNumber || '',
                expiryDate: selectedProduct.expiryDate || '',
                costPrice: selectedProduct.costPrice || 0,
                sellingPrice: selectedProduct.sellingPrice || 0
            };
            setItems([...items, newItem]);
            setSuccess(`Added ${selectedProduct.name} - New Batch`);
        }

        setSelectedProduct(null);
        setSearchTerm('');
        setSearchResults([]);
        setShowDropdown(false);
        setActiveIndex(-1);
        setNoResults(false);
        if (qtyInput) qtyInput.value = 1;
        setTimeout(() => setSuccess(''), 3000);
        setTimeout(() => searchRef.current?.focus(), 100);
    };

    const receiveNow = () => {
        if (!selectedProduct) {
            setError('Search and select a product first');
            return;
        }

        const qtyInput = document.getElementById('receive-qty');
        const qty = parseInt(qtyInput?.value) || 1;
        if (qty <= 0) {
            setError('Quantity must be greater than 0');
            return;
        }

        if (selectedProduct.expiryDate) {
            const { isExpired } = checkExpiry(selectedProduct.expiryDate);
            if (isExpired) {
                setError('Cannot receive this batch - the expiry date is in the past.');
                return;
            }
        } else {
            setError('Expiry date is required for the new batch');
            return;
        }

        const newItem = {
            productId: selectedProduct._id,
            name: selectedProduct.name,
            code: selectedProduct.code || 'N/A',
            quantity: qty,
            batchNumber: selectedProduct.batchNumber || '',
            expiryDate: selectedProduct.expiryDate || '',
            costPrice: selectedProduct.costPrice || 0,
            sellingPrice: selectedProduct.sellingPrice || 0
        };

        setItems([...items, newItem]);
        setSelectedProduct(null);
        setSearchTerm('');
        setSearchResults([]);
        setShowDropdown(false);
        setActiveIndex(-1);
        setNoResults(false);
        
        setTimeout(() => submitReceive(), 200);
    };

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateQty = (index, val) => {
        const qty = parseInt(val) || 0;
        if (qty <= 0) { removeItem(index); return; }
        const updated = [...items];
        updated[index].quantity = qty;
        setItems(updated);
    };

    const updateField = (index, field, val) => {
        const updated = [...items];
        updated[index][field] = val;
        setItems(updated);
    };

    const clearAll = () => {
        if (items.length === 0) return;
        if (window.confirm('Clear all items?')) {
            setItems([]);
            setSelectedProduct(null);
            setSearchTerm('');
            setSearchResults([]);
            setShowDropdown(false);
            setActiveIndex(-1);
            setNoResults(false);
        }
    };

    const submitReceive = async () => {
        // Validate ALL fields
        if (!dnoteNumber.trim()) {
            setError('D-Note number is required');
            dnoteRef.current?.focus();
            return;
        }
        if (!supplier.trim()) {
            setError('Supplier is required');
            return;
        }
        if (items.length === 0) {
            setError('No items to receive');
            return;
        }

        // Validate each item
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item.batchNumber || item.batchNumber.trim() === '') {
                setError(`Item ${i+1}: Batch number is required for ${item.name}`);
                return;
            }
            if (!item.expiryDate) {
                setError(`Item ${i+1}: Expiry date is required for ${item.name}`);
                return;
            }
            if (new Date(item.expiryDate) < new Date()) {
                setError(`Item ${i+1}: ${item.name} - Batch expired - Cannot receive`);
                return;
            }
            if (item.costPrice === undefined || item.costPrice === null || item.costPrice < 0) {
                setError(`Item ${i+1}: Cost price is required for ${item.name}`);
                return;
            }
            if (item.sellingPrice === undefined || item.sellingPrice === null || item.sellingPrice < 0) {
                setError(`Item ${i+1}: Selling price is required for ${item.name}`);
                return;
            }
        }

        setSubmitting(true);
        setError('');
        setSuccess('');
        setWarning('');

        try {
            const data = {
                dnoteNumber: dnoteNumber.trim(),
                supplier: supplier.trim(),
                supplierId: supplierId || null,
                receiveDate,
                remarks,
                items: items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    batchNumber: item.batchNumber || '',
                    expiryDate: item.expiryDate || null,
                    costPrice: item.costPrice || 0,
                    sellingPrice: item.sellingPrice || 0
                }))
            };

            const res = await api.post('/stock/receive', data);
            
            if (res.data) {
                const received = res.data.data?.totalReceived || 0;
                const errors = res.data.data?.totalErrors || 0;
                
                if (res.data.success) {
                    setSuccess(`${received} item(s) received under D-Note: ${dnoteNumber}`);
                    setItems([]);
                    setSelectedProduct(null);
                    setSearchTerm('');
                    setRemarks('');
                    setDnoteNumber('');
                    setTimeout(() => dnoteRef.current?.focus(), 100);
                } else {
                    setError(res.data.message || 'Failed to receive');
                }
                
                if (errors > 0 && res.data.data?.errors) {
                    setError(prev => prev + '\n' + res.data.data.errors.join('\n'));
                }
            }
        } catch (err) {
            console.error('Receive error:', err);
            setError(err.response?.data?.message || 'Failed to receive items');
        } finally {
            setSubmitting(false);
        }
    };

    // SVG Icons - MODERN (No emojis)
    const BackIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
        </svg>
    );

    const AddIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D69E2E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
    );

    const ReceiveIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
            <polyline points="17 6 23 6 23 12"/>
        </svg>
    );

    const ClearIcon = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
    );

    const RemoveIcon = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
    );

    const SearchIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
    );

    const ErrorIcon = () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
    );

    const SuccessIcon = () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
    );

    const WarningIcon = () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v4"/>
            <path d="M12 17h.01"/>
            <circle cx="12" cy="12" r="10"/>
        </svg>
    );

    return (
        <div className="receive-page">
            {/* Header */}
            <div className="receive-header">
                <div className="receive-header-left">
                    <h1>Receive Stock</h1>
                    <p>Receive products with D-Note tracking</p>
                </div>
                <div className="receive-header-actions">
                    <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
                        <BackIcon /> Back
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="receive-body">
                {/* Alerts */}
                {error && (
                    <div className="alert-box alert-error">
                        <ErrorIcon />
                        <div>
                            <div className="title">Error</div>
                            <div className="msg" style={{ whiteSpace: 'pre-line' }}>{error}</div>
                        </div>
                    </div>
                )}
                {success && (
                    <div className="alert-box alert-success">
                        <SuccessIcon />
                        <div>
                            <div className="title">Success</div>
                            <div className="msg">{success}</div>
                        </div>
                    </div>
                )}
                {warning && (
                    <div className="alert-box alert-warning">
                        <WarningIcon />
                        <div>
                            <div className="title">Warning</div>
                            <div className="msg">{warning}</div>
                        </div>
                    </div>
                )}

                {/* D-Note & Supplier */}
                <div className="dnote-card">
                    <div className="dnote-grid">
                        <div>
                            <label>D-Note Number <span style={{ color: '#EF4444' }}>*</span></label>
                            <input
                                ref={dnoteRef}
                                type="text"
                                value={dnoteNumber}
                                onChange={(e) => setDnoteNumber(e.target.value)}
                                placeholder="Enter D-Note number"
                            />
                        </div>
                        <div>
                            <label>Receive Date</label>
                            <input
                                type="date"
                                value={receiveDate}
                                onChange={(e) => setReceiveDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="dnote-grid">
                        <div>
                            <IntelligentDropdown
                                label="Supplier *"
                                options={supplierNames}
                                value={supplier}
                                onChange={(val) => {
                                    setSupplier(val);
                                    const found = suppliers.find(s => s.name === val);
                                    if (found) setSupplierId(found._id);
                                    else setSupplierId('');
                                }}
                                onAddNew={handleAddSupplier}
                                onEdit={handleEditSupplier}
                                onDelete={handleDeleteSupplier}
                                placeholder="Type to search or add supplier..."
                                required={true}
                            />
                        </div>
                        <div>
                            <label>Remarks</label>
                            <input
                                type="text"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="Optional remarks"
                            />
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="receive-grid">
                    {/* Left - Add Items */}
                    <div className="receive-card">
                        <div className="card-title">
                            <span>Add Items</span>
                            <span className="badge">Hybrid</span>
                        </div>

                        {/* Search */}
                        <div className="search-wrap">
                            <span className="search-icon"><SearchIcon /></span>
                            <input
                                ref={searchRef}
                                type="text"
                                placeholder="Type product name or code..."
                                value={searchTerm}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setSearchTerm(value);
                                    if (value.length < 2) {
                                        setSearchResults([]);
                                        setShowDropdown(false);
                                        setActiveIndex(-1);
                                        setNoResults(false);
                                    } else {
                                        setShowDropdown(true);
                                    }
                                }}
                                onFocus={() => {
                                    if (searchTerm.length >= 2) setShowDropdown(true);
                                }}
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSearchResults([]);
                                        setShowDropdown(false);
                                        setActiveIndex(-1);
                                        setSelectedProduct(null);
                                        setNoResults(false);
                                        searchRef.current?.focus();
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
                                    type="button"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"/>
                                        <line x1="6" y1="6" x2="18" y2="18"/>
                                    </svg>
                                </button>
                            )}
                            {isSearching && (
                                <span style={{
                                    position: 'absolute',
                                    right: searchTerm ? '40px' : '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'rgba(255,255,255,0.06)',
                                    fontSize: '11px'
                                }}>Searching...</span>
                            )}
                            {showDropdown && searchResults.length > 0 && (
                                <div className="search-dropdown" ref={dropdownRef}>
                                    {searchResults.map((p, idx) => {
                                        const { isExpired, daysLeft } = checkExpiry(p.expiryDate);
                                        const isActive = idx === activeIndex;
                                        return (
                                            <div
                                                key={p._id}
                                                ref={el => {
                                                    if (el && idx === activeIndex) {
                                                        el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                                                    }
                                                }}
                                                className={`dropdown-item ${isActive ? 'active' : ''}`}
                                                onClick={() => handleSelectProduct(p)}
                                                onMouseEnter={() => setActiveIndex(idx)}
                                                style={isExpired ? { opacity: 0.4 } : {}}
                                            >
                                                <div>
                                                    <div className="name">{p.name}</div>
                                                    <div className="detail">
                                                        {p.code}
                                                        {p.strength && ` • ${p.strength}`}
                                                        <span className="tag tag-stock">Stock: {p.quantityOnHand || 0}</span>
                                                        {p.batchNumber && <span className="tag">Batch: {p.batchNumber}</span>}
                                                        {isExpired && <span className="tag tag-expired">BATCH EXPIRED</span>}
                                                        {!isExpired && daysLeft !== null && daysLeft <= 30 && (
                                                            <span className="tag tag-expiring">{daysLeft}d left</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            {noResults && searchTerm.length >= 2 && !isSearching && (
                                <div className="search-dropdown" ref={dropdownRef}>
                                    <div style={{ padding: '16px', textAlign: 'center', color: 'rgba(255,255,255,0.1)', fontSize: '13px' }}>
                                        No products found matching "{searchTerm}"
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Selected */}
                        {selectedProduct && (
                            <div className="selected-product">
                                <div className="info">
                                    <span className="label">Selected:</span>
                                    <span className="value">{selectedProduct.name}</span>
                                    <span className="stock">Stock: {selectedProduct.quantityOnHand || 0}</span>
                                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.15)' }}>
                                        Enter new batch details below
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Form */}
                        <div className="form-row">
                            <div>
                                <label>Quantity <span style={{ color: '#EF4444' }}>*</span></label>
                                <input
                                    id="receive-qty"
                                    type="number"
                                    min="1"
                                    defaultValue="1"
                                    disabled={!selectedProduct}
                                />
                            </div>
                            <div>
                                <label>Batch Number <span style={{ color: '#EF4444' }}>*</span></label>
                                <input
                                    id="receive-batch"
                                    type="text"
                                    value={selectedProduct?.batchNumber || ''}
                                    onChange={(e) => setSelectedProduct(prev => 
                                        prev ? { ...prev, batchNumber: e.target.value } : null
                                    )}
                                    placeholder="Enter new batch number"
                                    disabled={!selectedProduct}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div>
                                <label>Expiry Date <span style={{ color: '#EF4444' }}>*</span></label>
                                <input
                                    type="date"
                                    value={selectedProduct?.expiryDate || ''}
                                    onChange={(e) => {
                                        if (selectedProduct) {
                                            const val = e.target.value;
                                            const { isExpired } = checkExpiry(val);
                                            if (isExpired) {
                                                setError('Cannot receive expired batch. Please select a future date.');
                                                return;
                                            }
                                            setError('');
                                            setSelectedProduct({ ...selectedProduct, expiryDate: val });
                                        }
                                    }}
                                    disabled={!selectedProduct}
                                />
                                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.1)', marginTop: '2px' }}>
                                    Enter a future date for this new batch
                                </div>
                            </div>
                            <div>
                                <label>Cost Price (MK) <span style={{ color: '#EF4444' }}>*</span></label>
                                <input
                                    type="number"
                                    value={selectedProduct?.costPrice || ''}
                                    onChange={(e) => setSelectedProduct(prev => 
                                        prev ? { ...prev, costPrice: parseFloat(e.target.value) || 0 } : null
                                    )}
                                    placeholder="0.00"
                                    step="0.01"
                                    disabled={!selectedProduct}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div>
                                <label>Selling Price (MK) <span style={{ color: '#EF4444' }}>*</span></label>
                                <input
                                    type="number"
                                    value={selectedProduct?.sellingPrice || ''}
                                    onChange={(e) => setSelectedProduct(prev => 
                                        prev ? { ...prev, sellingPrice: parseFloat(e.target.value) || 0 } : null
                                    )}
                                    placeholder="0.00"
                                    step="0.01"
                                    disabled={!selectedProduct}
                                />
                            </div>
                            <div style={{ visibility: 'hidden' }}></div>
                        </div>

                        {/* Actions */}
                        <div className="receive-actions">
                            <button
                                className="btn-add"
                                onClick={addItem}
                                disabled={!selectedProduct || submitting}
                            >
                                <AddIcon /> Add to List
                            </button>
                            <button
                                className="btn-gold"
                                onClick={receiveNow}
                                disabled={!selectedProduct || submitting}
                            >
                                <ReceiveIcon /> Receive Now
                            </button>
                        </div>
                    </div>

                    {/* Right - Items List */}
                    <div className="receive-card">
                        <div className="items-header">
                            <h3>
                                Items
                                <span className="items-count">{items.length}</span>
                            </h3>
                            {items.length > 0 && (
                                <button className="btn-clear" onClick={clearAll}>
                                    <ClearIcon /> Clear
                                </button>
                            )}
                        </div>

                        {items.length === 0 ? (
                            <div className="empty-state">
                                <div className="icon">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                                    </svg>
                                </div>
                                <h4>No items</h4>
                                <p>Search and add products</p>
                            </div>
                        ) : (
                            <>
                                <div className="table-scroll">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Product</th>
                                                <th>Batch</th>
                                                <th>Expiry</th>
                                                <th>Qty</th>
                                                <th style={{ textAlign: 'center' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((item, index) => {
                                                const { isExpired, daysLeft } = checkExpiry(item.expiryDate);
                                                return (
                                                    <tr key={index} className={isExpired ? 'row-expired' : (daysLeft !== null && daysLeft <= 30 ? 'row-expiring' : '')}>
                                                        <td>{index + 1}</td>
                                                        <td>
                                                            <div className="pname">{item.name}</div>
                                                            <div className="pcode">{item.code}</div>
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                className="batch-inp"
                                                                value={item.batchNumber || ''}
                                                                onChange={(e) => updateField(index, 'batchNumber', e.target.value)}
                                                                placeholder="Batch"
                                                                required
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="date"
                                                                className="expiry-inp"
                                                                value={item.expiryDate || ''}
                                                                onChange={(e) => updateField(index, 'expiryDate', e.target.value)}
                                                                required
                                                            />
                                                            {isExpired && <span style={{ color: '#EF4444', fontSize: '9px' }}>EXPIRED</span>}
                                                            {!isExpired && daysLeft !== null && daysLeft <= 30 && (
                                                                <span style={{ color: '#F59E0B', fontSize: '9px' }}>{daysLeft}d left</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                className="qty-inp"
                                                                value={item.quantity}
                                                                onChange={(e) => updateQty(index, e.target.value)}
                                                                min="1"
                                                            />
                                                        </td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <button className="btn-remove" onClick={() => removeItem(index)}>
                                                                <RemoveIcon />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="receive-summary">
                                    <div className="left">
                                        <span>Items: <strong>{items.length}</strong></span>
                                        <span>Total: <strong>{items.reduce((s, i) => s + i.quantity, 0)}</strong></span>
                                        {supplier && <span>Supplier: <strong>{supplier}</strong></span>}
                                    </div>
                                    <button
                                        className="btn-gold"
                                        onClick={submitReceive}
                                        disabled={submitting || items.length === 0 || !supplier || !dnoteNumber}
                                    >
                                        {submitting ? (
                                            <><span className="spinner"></span> Processing...</>
                                        ) : (
                                            <><ReceiveIcon /> Receive All ({items.length})</>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceiveStock;
