import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import IntelligentDropdown from '../components/IntelligentDropdown';
import './DispenseStock.css';

const DispenseStock = () => {
    const navigate = useNavigate();
    
    // Form state
    const [prescriptionNumber, setPrescriptionNumber] = useState('');
    const [patientName, setPatientName] = useState('');
    const [prescriber, setPrescriber] = useState('');
    const [dispenseDate, setDispenseDate] = useState(new Date().toISOString().split('T')[0]);
    const [remarks, setRemarks] = useState('');
    
    // Patients list
    const [patients, setPatients] = useState([]);
    const [patientNames, setPatientNames] = useState([]);
    
    // Prescribers list
    const [prescribers, setPrescribers] = useState([]);
    const [prescriberNames, setPrescriberNames] = useState([]);
    
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
    const rxRef = useRef(null);
    const dropdownRef = useRef(null);
    const searchTimeout = useRef(null);

    // Load data
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        loadPatients();
        loadPrescribers();
        setTimeout(() => rxRef.current?.focus(), 100);
    }, []);

    // Load patients
    const loadPatients = async () => {
        try {
            const res = await api.get('/stock/transactions?limit=100');
            if (res.data.success) {
                const uniquePatients = [...new Set(res.data.data
                    .filter(t => t.patientName)
                    .map(t => t.patientName)
                )];
                setPatients(uniquePatients.map(name => ({ name })));
                setPatientNames(uniquePatients);
            }
        } catch (err) {
            console.error('Error loading patients:', err);
            const defaultPatients = ['John Doe', 'Jane Smith', 'Robert Johnson'];
            setPatients(defaultPatients.map(name => ({ name })));
            setPatientNames(defaultPatients);
        }
    };

    // Load prescribers
    const loadPrescribers = async () => {
        try {
            const res = await api.get('/stock/transactions?limit=100');
            if (res.data.success) {
                const uniquePrescribers = [...new Set(res.data.data
                    .filter(t => t.prescriber)
                    .map(t => t.prescriber)
                )];
                setPrescribers(uniquePrescribers.map(name => ({ name })));
                setPrescriberNames(uniquePrescribers);
            }
        } catch (err) {
            console.error('Error loading prescribers:', err);
            const defaultPrescribers = ['Dr. John Smith', 'Dr. Jane Doe', 'Dr. Robert Johnson'];
            setPrescribers(defaultPrescribers.map(name => ({ name })));
            setPrescriberNames(defaultPrescribers);
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

    // Handle patient
    const handleAddPatient = (name) => {
        if (name && !patientNames.includes(name)) {
            setPatientNames([...patientNames, name]);
            setPatients([...patients, { name }]);
            setPatientName(name);
            setSuccess(`Patient "${name}" added`);
            setTimeout(() => setSuccess(''), 3000);
        }
    };

    const handleDeletePatient = (name) => {
        if (window.confirm(`Delete patient "${name}"?`)) {
            setPatientNames(patientNames.filter(n => n !== name));
            setPatients(patients.filter(p => p.name !== name));
            if (patientName === name) {
                setPatientName('');
            }
            setSuccess(`Patient "${name}" deleted`);
            setTimeout(() => setSuccess(''), 3000);
        }
    };

    // Handle prescriber
    const handleAddPrescriber = (name) => {
        if (name && !prescriberNames.includes(name)) {
            setPrescriberNames([...prescriberNames, name]);
            setPrescribers([...prescribers, { name }]);
            setPrescriber(name);
            setSuccess(`Prescriber "${name}" added`);
            setTimeout(() => setSuccess(''), 3000);
        }
    };

    const handleDeletePrescriber = (name) => {
        if (window.confirm(`Delete prescriber "${name}"?`)) {
            setPrescriberNames(prescriberNames.filter(n => n !== name));
            setPrescribers(prescribers.filter(p => p.name !== name));
            if (prescriber === name) {
                setPrescriber('');
            }
            setSuccess(`Prescriber "${name}" deleted`);
            setTimeout(() => setSuccess(''), 3000);
        }
    };

    // Product search
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
                const res = await api.get(`/products?search=${encodeURIComponent(searchTerm)}`);
                if (res.data.success) {
                    const products = res.data.data || [];
                    // Filter out expired products
                    const validProducts = products.filter(p => {
                        if (p.expiryDate) {
                            return new Date(p.expiryDate) >= new Date();
                        }
                        return true;
                    });
                    setSearchResults(validProducts);
                    setShowDropdown(validProducts.length > 0);
                    setNoResults(validProducts.length === 0);
                } else {
                    setSearchResults([]);
                    setShowDropdown(false);
                    setNoResults(true);
                }
            } catch (err) {
                console.error('Search error:', err);
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

    // Scroll active item into view
    useEffect(() => {
        if (activeIndex >= 0 && dropdownRef.current) {
            const items = dropdownRef.current.querySelectorAll('.dropdown-item');
            if (items && items[activeIndex]) {
                items[activeIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }, [activeIndex]);

    // Keyboard navigation
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
        const { isExpired, daysLeft } = checkExpiry(product.expiryDate);
        
        if (isExpired) {
            setError(`Cannot dispense expired product: ${product.name}`);
            setShowDropdown(false);
            return;
        }
        
        if (daysLeft !== null && daysLeft <= 30 && daysLeft > 0) {
            setWarning(`${product.name} expires in ${daysLeft} days`);
            setTimeout(() => setWarning(''), 5000);
        } else {
            setWarning('');
        }

        setSelectedProduct({
            ...product,
            quantity: 1,
            sellingPrice: product.sellingPrice || 0
        });
        setSearchTerm(product.name);
        setShowDropdown(false);
        setActiveIndex(-1);
        setError('');
        setNoResults(false);
        
        setTimeout(() => {
            const qtyInput = document.getElementById('dispense-qty');
            if (qtyInput) qtyInput.focus();
        }, 100);
    };

    const addItem = () => {
        if (!selectedProduct) {
            setError('Search and select a product first');
            return;
        }

        const qtyInput = document.getElementById('dispense-qty');
        const qty = parseInt(qtyInput?.value) || 1;
        if (qty <= 0) {
            setError('Quantity must be greater than 0');
            return;
        }

        if (qty > selectedProduct.quantityOnHand) {
            setError(`Insufficient stock! Only ${selectedProduct.quantityOnHand} available`);
            return;
        }

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
                sellingPrice: selectedProduct.sellingPrice || 0,
                currentStock: selectedProduct.quantityOnHand || 0,
                expiryDate: selectedProduct.expiryDate || ''
            };
            setItems([...items, newItem]);
            setSuccess(`Added ${selectedProduct.name}`);
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

    const submitDispense = async () => {
        if (!prescriptionNumber.trim()) {
            setError('Prescription number is required');
            rxRef.current?.focus();
            return;
        }
        if (!patientName.trim()) {
            setError('Patient name is required');
            return;
        }
        if (!prescriber.trim()) {
            setError('Prescriber name is required');
            return;
        }
        if (items.length === 0) {
            setError('No items to dispense');
            return;
        }

        const expired = items.filter(i => {
            if (i.expiryDate) return new Date(i.expiryDate) < new Date();
            return false;
        });
        if (expired.length > 0) {
            setError(`Cannot dispense expired products: ${expired.map(i => i.name).join(', ')}`);
            return;
        }

        setSubmitting(true);
        setError('');
        setSuccess('');
        setWarning('');

        try {
            const data = {
                prescriptionNumber: prescriptionNumber.trim(),
                patientName: patientName.trim(),
                prescriber: prescriber.trim(),
                dispenseDate,
                remarks,
                items: items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    sellingPrice: item.sellingPrice || 0
                }))
            };

            const res = await api.post('/stock/dispense', data);
            
            if (res.data) {
                const dispensed = res.data.data?.totalDispensed || 0;
                const errors = res.data.data?.totalErrors || 0;
                
                if (res.data.success) {
                    setSuccess(`${dispensed} item(s) dispensed under prescription: ${prescriptionNumber}`);
                    setItems([]);
                    setSelectedProduct(null);
                    setSearchTerm('');
                    setPrescriptionNumber('');
                    setPatientName('');
                    setPrescriber('');
                    setRemarks('');
                    setTimeout(() => rxRef.current?.focus(), 100);
                } else {
                    setError(res.data.message || 'Failed to dispense');
                }
                
                if (errors > 0 && res.data.data?.errors) {
                    setError(prev => prev + '\n' + res.data.data.errors.join('\n'));
                }
            }
        } catch (err) {
            console.error('Dispense error:', err);
            setError(err.response?.data?.message || 'Failed to dispense items');
        } finally {
            setSubmitting(false);
        }
    };

    // SVG Icons - MODERN
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

    const DispenseIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
            <polyline points="17 18 23 18 23 12"/>
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
        <div className="dispense-page">
            {/* Header */}
            <div className="dispense-header">
                <div className="dispense-header-left">
                    <h1>Dispense Stock</h1>
                    <p>Dispense medication to patients</p>
                </div>
                <div className="dispense-header-actions">
                    <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
                        <BackIcon /> Back
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="dispense-body">
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

                {/* Prescription Info */}
                <div className="prescription-card">
                    <div className="prescription-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                        <div>
                            <label>Prescription Number <span style={{ color: '#EF4444' }}>*</span></label>
                            <input
                                ref={rxRef}
                                type="text"
                                value={prescriptionNumber}
                                onChange={(e) => setPrescriptionNumber(e.target.value)}
                                placeholder="Enter prescription number"
                            />
                        </div>
                        <div>
                            <IntelligentDropdown
                                label="Patient Name *"
                                options={patientNames}
                                value={patientName}
                                onChange={(val) => setPatientName(val)}
                                onAddNew={handleAddPatient}
                                onDelete={handleDeletePatient}
                                placeholder="Type or select patient..."
                                required={true}
                            />
                        </div>
                        <div>
                            <IntelligentDropdown
                                label="Prescriber *"
                                options={prescriberNames}
                                value={prescriber}
                                onChange={(val) => setPrescriber(val)}
                                onAddNew={handleAddPrescriber}
                                onDelete={handleDeletePrescriber}
                                placeholder="Type or select prescriber..."
                                required={true}
                            />
                        </div>
                    </div>
                    <div className="prescription-grid" style={{ marginTop: '10px', gridTemplateColumns: '1fr 1fr 1fr' }}>
                        <div>
                            <label>Dispense Date</label>
                            <input
                                type="date"
                                value={dispenseDate}
                                onChange={(e) => setDispenseDate(e.target.value)}
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
                        <div style={{ visibility: 'hidden' }}></div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="dispense-grid">
                    {/* Left - Add Items */}
                    <div className="dispense-card">
                        <div className="card-title">
                            <span>Add Items</span>
                            <span className="badge">Multiple Drugs</span>
                        </div>

                        {/* Search */}
                        <div className="search-wrap">
                            <span className="search-icon"><SearchIcon /></span>
                            <input
                                ref={searchRef}
                                type="text"
                                placeholder="Search product..."
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
                                            >
                                                <div>
                                                    <div className="name">{p.name}</div>
                                                    <div className="detail">
                                                        {p.code}
                                                        {p.strength && ` • ${p.strength}`}
                                                        <span className="tag tag-stock">Stock: {p.quantityOnHand || 0}</span>
                                                        {isExpired && <span className="tag tag-expired">EXPIRED</span>}
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
                                        No products available
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
                                </div>
                            </div>
                        )}

                        {/* Form */}
                        <div className="form-row">
                            <div>
                                <label>Quantity <span style={{ color: '#EF4444' }}>*</span></label>
                                <input
                                    id="dispense-qty"
                                    type="number"
                                    min="1"
                                    defaultValue="1"
                                    disabled={!selectedProduct}
                                />
                            </div>
                            <div>
                                <label>Selling Price</label>
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
                        </div>

                        {/* Actions */}
                        <div className="dispense-actions">
                            <button
                                className="btn-add"
                                onClick={addItem}
                                disabled={!selectedProduct || submitting}
                            >
                                <AddIcon /> Add to List
                            </button>
                            <button
                                className="btn-gold"
                                onClick={() => {
                                    if (selectedProduct) {
                                        addItem();
                                        setTimeout(() => submitDispense(), 200);
                                    }
                                }}
                                disabled={!selectedProduct || submitting}
                            >
                                <DispenseIcon /> Dispense Now
                            </button>
                        </div>
                    </div>

                    {/* Right - Items List */}
                    <div className="dispense-card">
                        <div className="items-header">
                            <h3>
                                Items to Dispense
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
                                                <th>Qty</th>
                                                <th>Stock</th>
                                                <th style={{ textAlign: 'center' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((item, index) => {
                                                const { isExpired } = checkExpiry(item.expiryDate);
                                                return (
                                                    <tr key={index} className={isExpired ? 'row-expired' : ''}>
                                                        <td>{index + 1}</td>
                                                        <td>
                                                            <div className="pname">{item.name}</div>
                                                            <div className="pcode">{item.code}</div>
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
                                                        <td>{item.currentStock || 0}</td>
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

                                <div className="dispense-summary">
                                    <div className="left">
                                        <span>Items: <strong>{items.length}</strong></span>
                                        <span>Total: <strong>{items.reduce((s, i) => s + i.quantity, 0)}</strong></span>
                                        {patientName && <span>Patient: <strong>{patientName}</strong></span>}
                                    </div>
                                    <button
                                        className="btn-gold"
                                        onClick={submitDispense}
                                        disabled={submitting || items.length === 0 || !patientName || !prescriptionNumber || !prescriber}
                                    >
                                        {submitting ? (
                                            <><span className="spinner"></span> Processing...</>
                                        ) : (
                                            <><DispenseIcon /> Dispense All ({items.length})</>
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

export default DispenseStock;
