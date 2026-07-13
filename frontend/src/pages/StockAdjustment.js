import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './StockAdjustment.css';

const StockAdjustment = () => {
    const navigate = useNavigate();
    
    // Adjustment type
    const [adjustmentType, setAdjustmentType] = useState('positive');
    
    // Form state
    const [referenceNumber, setReferenceNumber] = useState('');
    const [approvedBy, setApprovedBy] = useState('');
    const [adjustmentDate, setAdjustmentDate] = useState(new Date().toISOString().split('T')[0]);
    const [remarks, setRemarks] = useState('');
    const [facilityName, setFacilityName] = useState('');
    const [facilityContact, setFacilityContact] = useState('');
    
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
    const [pdfUrl, setPdfUrl] = useState(null);
    
    // Refs
    const searchRef = useRef(null);
    const refRef = useRef(null);
    const dropdownRef = useRef(null);
    const searchTimeout = useRef(null);
    const batchInputRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        const now = new Date();
        const ref = `ADJ-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
        setReferenceNumber(ref);
        setTimeout(() => searchRef.current?.focus(), 100);
    }, []);

    // Check if a date is expired
    const checkDateExpired = (dateStr) => {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    // Check product expiry
    const checkProductExpired = (date) => {
        if (!date) return { isExpired: false };
        const expiry = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return { isExpired: expiry < today };
    };

    // Check if product is expiring soon (within 30 days)
    const getExpiryWarning = (expiryDate) => {
        if (!expiryDate) return null;
        
        const expiry = new Date(expiryDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (expiry < today) {
            return { level: 'expired', message: 'EXPIRED', color: '#EF4444' };
        }
        
        const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry <= 7) {
            return { level: 'urgent', message: `EXPIRES IN ${daysUntilExpiry} DAYS (URGENT!)`, color: '#EF4444' };
        } else if (daysUntilExpiry <= 14) {
            return { level: 'soon', message: `EXPIRES IN ${daysUntilExpiry} DAYS (SOON!)`, color: '#F59E0B' };
        } else if (daysUntilExpiry <= 30) {
            return { level: 'warning', message: `EXPIRES IN ${daysUntilExpiry} DAYS`, color: '#D69E2E' };
        } else {
            return { level: 'safe', message: `Expires in ${daysUntilExpiry} days`, color: '#10B981' };
        }
    };

    // Download PDF
    const handleDownloadPDF = () => {
        if (pdfUrl) {
            window.open(pdfUrl, '_blank');
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
        
        searchTimeout.current = setTimeout(async () => {
            try {
                const res = await api.get(`/products?search=${encodeURIComponent(searchTerm)}`);
                if (res.data.success) {
                    setSearchResults(res.data.data);
                    setShowDropdown(res.data.data.length > 0);
                    setNoResults(res.data.data.length === 0);
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
        // For negative/loss, use the product's current batch and expiry (locked)
        // For positive, allow new batch and expiry (editable)
        const isNegativeOrLoss = adjustmentType === 'negative' || adjustmentType === 'loss';
        
        setSelectedProduct({
            ...product,
            quantity: 1,
            batchNumber: isNegativeOrLoss ? product.batchNumber || '' : '',
            expiryDate: isNegativeOrLoss ? product.expiryDate || '' : '',
            costPrice: product.unitCost || 0,
            sellingPrice: product.sellingPrice || 0,
            currentStock: product.quantityOnHand || 0
        });
        setSearchTerm(product.name);
        setShowDropdown(false);
        setActiveIndex(-1);
        setError('');
        setNoResults(false);
        
        const { isExpired } = checkProductExpired(product.expiryDate);
        const warning = getExpiryWarning(product.expiryDate);
        
        if (isExpired) {
            setWarning('⛔ This product has EXPIRED. Cannot be dispensed. Use Loss adjustment to remove from stock.');
            setTimeout(() => setWarning(''), 10000);
        } else if (warning && warning.level === 'urgent') {
            setWarning(`⚠️ ${warning.message} - Please inform the patient and consider alternative medication.`);
            setTimeout(() => setWarning(''), 10000);
        } else if (warning && warning.level === 'soon') {
            setWarning(`⏰ ${warning.message} - Please advise the patient to use before expiry.`);
            setTimeout(() => setWarning(''), 8000);
        } else if (warning && warning.level === 'warning') {
            setWarning(`⚠️ ${warning.message} - Please be aware of expiry date.`);
            setTimeout(() => setWarning(''), 6000);
        }
        
        setTimeout(() => {
            const qtyInput = document.getElementById('adjust-qty');
            if (qtyInput) qtyInput.focus();
            if (adjustmentType === 'positive' && batchInputRef.current) {
                setTimeout(() => batchInputRef.current.focus(), 200);
            }
        }, 100);
    };

    const addItem = () => {
        if (!selectedProduct) {
            setError('Search and select a product first');
            return;
        }

        const qtyInput = document.getElementById('adjust-qty');
        const qty = parseInt(qtyInput?.value) || 1;
        if (qty <= 0) {
            setError('Quantity must be greater than 0');
            return;
        }

        // For Positive adjustment, batch number is required
        if (adjustmentType === 'positive') {
            if (!selectedProduct.batchNumber || selectedProduct.batchNumber.trim() === '') {
                setError('Batch number is required for Positive adjustment');
                if (batchInputRef.current) {
                    batchInputRef.current.focus();
                    batchInputRef.current.style.borderColor = '#EF4444';
                    setTimeout(() => {
                        if (batchInputRef.current) {
                            batchInputRef.current.style.borderColor = '';
                        }
                    }, 3000);
                }
                return;
            }
            
            if (!selectedProduct.expiryDate || selectedProduct.expiryDate.trim() === '') {
                setError('Expiry date is required for Positive adjustment');
                return;
            }
            
            const expiryDate = new Date(selectedProduct.expiryDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (expiryDate < today) {
                setError('Expiry date must be in the future for Positive adjustment');
                return;
            }
        }

        if (adjustmentType === 'negative') {
            if (checkProductExpired(selectedProduct.expiryDate).isExpired) {
                setError('Cannot remove expired batch. Use Loss adjustment for expired products.');
                return;
            }
        }

        if ((adjustmentType === 'negative' || adjustmentType === 'loss') && qty > selectedProduct.currentStock) {
            setError(`Insufficient stock! Only ${selectedProduct.currentStock} available`);
            return;
        }

        const existing = items.find(i => i.productId === selectedProduct._id);
        if (existing) {
            const newQty = existing.quantity + qty;
            if ((adjustmentType === 'negative' || adjustmentType === 'loss') && newQty > selectedProduct.currentStock) {
                setError(`Insufficient stock! Only ${selectedProduct.currentStock} available total`);
                return;
            }
            const updated = items.map(i => 
                i.productId === selectedProduct._id 
                    ? { ...i, quantity: newQty }
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
                currentStock: selectedProduct.currentStock || 0
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
        setTimeout(() => searchRef.current?.focus(), 100);
    };

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateQty = (index, val) => {
        const qty = parseInt(val) || 0;
        if (qty <= 0) { removeItem(index); return; }
        const item = items[index];
        if ((adjustmentType === 'negative' || adjustmentType === 'loss') && qty > item.currentStock) {
            setError(`Insufficient stock! Only ${item.currentStock} available`);
            return;
        }
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

    const submitAdjustment = async () => {
        if (!referenceNumber.trim()) {
            setError('Reference number is required');
            refRef.current?.focus();
            return;
        }
        if (!approvedBy.trim()) {
            setError('Approved by is required');
            return;
        }
        if (items.length === 0) {
            setError('No items to adjust');
            return;
        }

        if (adjustmentType === 'negative') {
            if (!facilityName.trim()) {
                setError('Facility name is required for negative adjustment');
                return;
            }
            if (!facilityContact.trim()) {
                setError('Facility contact is required for negative adjustment');
                return;
            }
        }

        const expired = items.filter(i => {
            if (i.expiryDate && adjustmentType !== 'loss') return new Date(i.expiryDate) < new Date();
            return false;
        });
        if (expired.length > 0 && adjustmentType !== 'loss') {
            setError(`Cannot adjust expired products: ${expired.map(i => i.name).join(', ')}`);
            return;
        }

        setSubmitting(true);
        setError('');
        setSuccess('');
        setWarning('');
        setPdfUrl(null);

        try {
            const data = {
                adjustmentType: adjustmentType,
                referenceNumber: referenceNumber.trim(),
                approvedBy: approvedBy.trim(),
                adjustmentDate: adjustmentDate,
                remarks: remarks || '',
                facilityName: facilityName || '',
                facilityContact: facilityContact || '',
                items: items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    batchNumber: item.batchNumber || '',
                    expiryDate: item.expiryDate || null
                }))
            };

            const res = await api.post('/stock/adjust', data);
            
            if (res.data) {
                const adjusted = res.data.data?.totalAdjusted || 0;
                const errors = res.data.data?.totalErrors || 0;
                
                if (res.data.success) {
                    const typeLabel = adjustmentType === 'positive' ? 'added' : adjustmentType === 'negative' ? 'removed' : 'recorded as loss';
                    let successMsg = `${adjusted} item(s) ${typeLabel}`;
                    setSuccess(successMsg);
                    setItems([]);
                    setSelectedProduct(null);
                    setSearchTerm('');
                    setRemarks('');
                    setApprovedBy('');
                    setFacilityName('');
                    setFacilityContact('');
                    
                    if (res.data.data?.pdfFileName) {
                        const pdfDownloadUrl = `http://localhost:5000/api/stock/download-pdf/${res.data.data.pdfFileName}`;
                        setPdfUrl(pdfDownloadUrl);
                        setSuccess(successMsg + ' 📄 Picking List generated!');
                    }
                    
                    const now = new Date();
                    const ref = `ADJ-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
                    setReferenceNumber(ref);
                    setTimeout(() => searchRef.current?.focus(), 100);
                } else {
                    setError(res.data.message || 'Failed to adjust');
                }
                
                if (errors > 0 && res.data.data?.errors) {
                    setError(prev => prev + '\n' + res.data.data.errors.join('\n'));
                }
            }
        } catch (err) {
            console.error('Adjustment error:', err);
            setError(err.response?.data?.message || 'Failed to adjust items');
        } finally {
            setSubmitting(false);
        }
    };

    // SVG Icons
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

    const AdjustIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4M12 22v-4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M22 12h-4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
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
        <div className="adjustment-page">
            {/* Header */}
            <div className="adjustment-header">
                <div className="adjustment-header-left">
                    <h1>Stock Adjustment</h1>
                    <p>Adjust stock levels</p>
                </div>
                <div className="adjustment-header-actions">
                    <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
                        <BackIcon /> Back
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="adjustment-body">
                {/* Alerts */}
                {warning && (
                    <div className="alert-box alert-warning" style={{ position: 'relative' }}>
                        <WarningIcon />
                        <div>
                            <div className="title">Warning</div>
                            <div className="msg">{warning}</div>
                        </div>
                        <button 
                            onClick={() => setWarning('')}
                            style={{
                                position: 'absolute',
                                right: '12px',
                                top: '12px',
                                background: 'none',
                                border: 'none',
                                color: 'rgba(245,158,11,0.3)',
                                cursor: 'pointer',
                                fontSize: '14px',
                                padding: '4px'
                            }}
                        >
                            ✕
                        </button>
                    </div>
                )}
                {error && (
                    <div className="alert-box alert-error" style={{ position: 'relative' }}>
                        <ErrorIcon />
                        <div>
                            <div className="title">Error</div>
                            <div className="msg" style={{ whiteSpace: 'pre-line' }}>{error}</div>
                        </div>
                        <button 
                            onClick={() => setError('')}
                            style={{
                                position: 'absolute',
                                right: '12px',
                                top: '12px',
                                background: 'none',
                                border: 'none',
                                color: 'rgba(239,68,68,0.3)',
                                cursor: 'pointer',
                                fontSize: '14px',
                                padding: '4px'
                            }}
                        >
                            ✕
                        </button>
                    </div>
                )}
                {success && (
                    <div className="alert-box alert-success" style={{ position: 'relative' }}>
                        <SuccessIcon />
                        <div>
                            <div className="title">Success</div>
                            <div className="msg">{success}</div>
                        </div>
                        <button 
                            onClick={() => setSuccess('')}
                            style={{
                                position: 'absolute',
                                right: '12px',
                                top: '12px',
                                background: 'none',
                                border: 'none',
                                color: 'rgba(16,185,129,0.3)',
                                cursor: 'pointer',
                                fontSize: '14px',
                                padding: '4px'
                            }}
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* PDF Download Button */}
                {pdfUrl && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '16px',
                        padding: '12px',
                        background: 'rgba(214,158,46,0.05)',
                        border: '1px solid rgba(214,158,46,0.1)',
                        borderRadius: '8px',
                        gap: '12px',
                        alignItems: 'center',
                        flexWrap: 'wrap'
                    }}>
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                            📄 Picking List Generated!
                        </span>
                        <button
                            onClick={handleDownloadPDF}
                            style={{
                                padding: '8px 20px',
                                background: 'linear-gradient(135deg, #D69E2E, #B8860B)',
                                border: 'none',
                                borderRadius: '6px',
                                color: '#FFFFFF',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 16px rgba(214,158,46,0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            Download Picking List (PDF)
                        </button>
                        <button
                            onClick={() => setPdfUrl(null)}
                            style={{
                                padding: '6px 12px',
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '6px',
                                color: 'rgba(255,255,255,0.2)',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                fontSize: '12px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                e.currentTarget.style.color = 'rgba(255,255,255,0.2)';
                            }}
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Type Selector */}
                <div className="type-selector">
                    <button
                        className={`type-btn ${adjustmentType === 'positive' ? 'active-positive' : ''}`}
                        onClick={() => setAdjustmentType('positive')}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                            <polyline points="17 6 23 6 23 12"/>
                        </svg>
                        Positive (Add Stock)
                    </button>
                    <button
                        className={`type-btn ${adjustmentType === 'negative' ? 'active-negative' : ''}`}
                        onClick={() => setAdjustmentType('negative')}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
                            <polyline points="17 18 23 18 23 12"/>
                        </svg>
                        Negative (Remove Stock)
                    </button>
                    <button
                        className={`type-btn ${adjustmentType === 'loss' ? 'active-loss' : ''}`}
                        onClick={() => setAdjustmentType('loss')}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                            <path d="M2 17l10 5 10-5"/>
                            <path d="M2 12l10 5 10-5"/>
                        </svg>
                        Loss (Damage/Expiry)
                    </button>
                </div>

                {/* Reference Info */}
                <div className="reference-card">
                    <div className="reference-grid">
                        <div>
                            <label>Reference Number <span style={{ color: '#EF4444' }}>*</span></label>
                            <input
                                ref={refRef}
                                type="text"
                                value={referenceNumber}
                                onChange={(e) => setReferenceNumber(e.target.value)}
                                placeholder="Auto-generated"
                            />
                        </div>
                        <div>
                            <label>Approved By <span style={{ color: '#EF4444' }}>*</span></label>
                            <input
                                type="text"
                                value={approvedBy}
                                onChange={(e) => setApprovedBy(e.target.value)}
                                placeholder="Enter approver name"
                            />
                        </div>
                        <div>
                            <label>Adjustment Date</label>
                            <input
                                type="date"
                                value={adjustmentDate}
                                onChange={(e) => setAdjustmentDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="reference-grid" style={{ marginTop: '10px' }}>
                        <div>
                            <label>Remarks</label>
                            <input
                                type="text"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="Optional remarks"
                            />
                        </div>
                        {adjustmentType === 'negative' && (
                            <>
                                <div>
                                    <label>Facility Name <span style={{ color: '#EF4444' }}>*</span></label>
                                    <input
                                        type="text"
                                        value={facilityName}
                                        onChange={(e) => setFacilityName(e.target.value)}
                                        placeholder="Enter facility name"
                                    />
                                </div>
                                <div>
                                    <label>Facility Contact <span style={{ color: '#EF4444' }}>*</span></label>
                                    <input
                                        type="text"
                                        value={facilityContact}
                                        onChange={(e) => setFacilityContact(e.target.value)}
                                        placeholder="Enter contact person"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Main Grid */}
                <div className="adjustment-grid">
                    {/* Left - Add Items */}
                    <div className="adjustment-card">
                        <div className="card-title">
                            <span>Add Items</span>
                            <span className="badge">Adjust</span>
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
                                        const { isExpired } = checkProductExpired(p.expiryDate);
                                        const warning = getExpiryWarning(p.expiryDate);
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
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleSelectProduct(p);
                                                }}
                                                onMouseEnter={() => setActiveIndex(idx)}
                                                style={isExpired ? { opacity: 0.6 } : {}}
                                            >
                                                <div>
                                                    <div className="name">{p.name}</div>
                                                    <div className="detail">
                                                        {p.code}
                                                        {p.strength ? ` • ${p.strength}` : ''}
                                                        <span className="tag tag-stock">Stock: {p.quantityOnHand || 0}</span>
                                                        {isExpired && (
                                                            <span style={{ color: '#EF4444', fontSize: '9px', marginLeft: '4px', fontWeight: 'bold' }}>
                                                                ⛔ EXPIRED
                                                            </span>
                                                        )}
                                                        {!isExpired && warning && warning.level === 'urgent' && (
                                                            <span style={{ color: '#EF4444', fontSize: '9px', marginLeft: '4px', fontWeight: 'bold' }}>
                                                                ⚠️ {warning.message}
                                                            </span>
                                                        )}
                                                        {!isExpired && warning && warning.level === 'soon' && (
                                                            <span style={{ color: '#F59E0B', fontSize: '9px', marginLeft: '4px' }}>
                                                                ⏰ {warning.message}
                                                            </span>
                                                        )}
                                                        {!isExpired && warning && warning.level === 'warning' && (
                                                            <span style={{ color: '#D69E2E', fontSize: '9px', marginLeft: '4px' }}>
                                                                ⚠️ {warning.message}
                                                            </span>
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
                                        No products found
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

                        {/* Expiry Warning for Selected Product */}
                        {selectedProduct && (
                            <div style={{
                                marginTop: '8px',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                {(() => {
                                    const warning = getExpiryWarning(selectedProduct.expiryDate);
                                    const { isExpired } = checkProductExpired(selectedProduct.expiryDate);
                                    
                                    if (isExpired) {
                                        return (
                                            <div style={{ 
                                                background: 'rgba(239,68,68,0.1)', 
                                                border: '1px solid rgba(239,68,68,0.2)',
                                                padding: '6px 12px',
                                                borderRadius: '4px',
                                                width: '100%',
                                                color: '#EF4444'
                                            }}>
                                                ⛔ EXPIRED - This product cannot be dispensed
                                            </div>
                                        );
                                    } else if (warning && warning.level === 'urgent') {
                                        return (
                                            <div style={{ 
                                                background: 'rgba(239,68,68,0.1)', 
                                                border: '1px solid rgba(239,68,68,0.2)',
                                                padding: '6px 12px',
                                                borderRadius: '4px',
                                                width: '100%',
                                                color: '#EF4444'
                                            }}>
                                                ⚠️ {warning.message} - Please advise patient
                                            </div>
                                        );
                                    } else if (warning && warning.level === 'soon') {
                                        return (
                                            <div style={{ 
                                                background: 'rgba(245,158,11,0.1)', 
                                                border: '1px solid rgba(245,158,11,0.2)',
                                                padding: '6px 12px',
                                                borderRadius: '4px',
                                                width: '100%',
                                                color: '#F59E0B'
                                            }}>
                                                ⏰ {warning.message} - Advise patient to use before expiry
                                            </div>
                                        );
                                    } else if (warning && warning.level === 'warning') {
                                        return (
                                            <div style={{ 
                                                background: 'rgba(214,158,46,0.1)', 
                                                border: '1px solid rgba(214,158,46,0.2)',
                                                padding: '6px 12px',
                                                borderRadius: '4px',
                                                width: '100%',
                                                color: '#D69E2E'
                                            }}>
                                                ⚠️ {warning.message}
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <div style={{ 
                                                background: 'rgba(16,185,129,0.1)', 
                                                border: '1px solid rgba(16,185,129,0.2)',
                                                padding: '6px 12px',
                                                borderRadius: '4px',
                                                width: '100%',
                                                color: '#10B981'
                                            }}>
                                                ✅ {warning ? warning.message : 'Valid product'}
                                            </div>
                                        );
                                    }
                                })()}
                            </div>
                        )}

                        {/* Locked Indicator */}
                        {adjustmentType !== 'positive' && selectedProduct && (
                            <div style={{
                                background: 'rgba(214,158,46,0.05)',
                                border: '1px solid rgba(214,158,46,0.08)',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                marginTop: '6px',
                                fontSize: '11px',
                                color: 'rgba(255,255,255,0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D69E2E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                </svg>
                                Batch and Expiry are locked for {adjustmentType} adjustment
                            </div>
                        )}

                        {/* Expiry Warning Legend - With SVG Icons */}
                        <div style={{
                            marginTop: '12px',
                            padding: '8px 12px',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.04)',
                            borderRadius: '6px',
                            fontSize: '10px',
                            color: 'rgba(255,255,255,0.3)',
                            display: 'flex',
                            gap: '16px',
                            flexWrap: 'wrap',
                            alignItems: 'center'
                        }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="15" y1="9" x2="9" y2="15"/>
                                    <line x1="9" y1="9" x2="15" y2="15"/>
                                </svg>
                                Expired / Urgent
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polyline points="12 6 12 12 16 14"/>
                                </svg>
                                Soon (7-14 days)
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D69E2E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 9v4"/>
                                    <path d="M12 17h.01"/>
                                    <circle cx="12" cy="12" r="10"/>
                                </svg>
                                Warning (15-30 days)
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                    <polyline points="22 4 12 14.01 9 11.01"/>
                                </svg>
                                Safe (>30 days)
                            </span>
                        </div>

                        {/* Form - with locked fields for negative/loss */}
                        <div className="form-row">
                            <div>
                                <label>Quantity <span style={{ color: '#EF4444' }}>*</span></label>
                                <input
                                    id="adjust-qty"
                                    type="number"
                                    min="1"
                                    defaultValue="1"
                                    disabled={!selectedProduct}
                                />
                            </div>
                            <div>
                                <label>Batch {adjustmentType !== 'positive' && <span style={{ color: '#D69E2E', fontSize: '9px' }}>(Locked)</span>}</label>
                                <input
                                    ref={batchInputRef}
                                    type="text"
                                    value={selectedProduct?.batchNumber || ''}
                                    onChange={(e) => {
                                        if (adjustmentType === 'positive') {
                                            setSelectedProduct(prev => 
                                                prev ? { ...prev, batchNumber: e.target.value } : null
                                            );
                                        }
                                    }}
                                    placeholder={adjustmentType === 'positive' ? 'Enter new batch number *' : 'Batch locked'}
                                    disabled={adjustmentType !== 'positive' || !selectedProduct}
                                    style={{
                                        width: '100%',
                                        padding: '7px 10px',
                                        background: adjustmentType !== 'positive' ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
                                        border: '1px solid ' + (adjustmentType !== 'positive' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)'),
                                        borderRadius: '6px',
                                        color: adjustmentType !== 'positive' ? 'rgba(255,255,255,0.3)' : '#FFFFFF',
                                        fontSize: '13px',
                                        outline: 'none',
                                        fontFamily: 'inherit',
                                        cursor: adjustmentType !== 'positive' ? 'not-allowed' : 'text'
                                    }}
                                />
                                {adjustmentType === 'positive' && (
                                    <div style={{ fontSize: '9px', color: '#EF4444', marginTop: '2px' }}>
                                        * Required for Positive adjustment
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-row">
                            <div>
                                <label>Expiry Date {adjustmentType !== 'positive' && <span style={{ color: '#D69E2E', fontSize: '9px' }}>(Locked)</span>}</label>
                                <input
                                    type="date"
                                    value={selectedProduct?.expiryDate || ''}
                                    onChange={(e) => {
                                        if (selectedProduct && adjustmentType === 'positive') {
                                            const val = e.target.value;
                                            setSelectedProduct({ ...selectedProduct, expiryDate: val });
                                            if (val && val.length === 10) {
                                                const date = new Date(val);
                                                if (!isNaN(date.getTime()) && date >= new Date()) {
                                                    setError('');
                                                }
                                            }
                                        }
                                    }}
                                    disabled={adjustmentType !== 'positive' || !selectedProduct}
                                    style={{
                                        width: '100%',
                                        padding: '7px 10px',
                                        background: adjustmentType !== 'positive' ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
                                        border: '1px solid ' + (adjustmentType !== 'positive' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)'),
                                        borderRadius: '6px',
                                        color: adjustmentType !== 'positive' ? 'rgba(255,255,255,0.3)' : '#FFFFFF',
                                        fontSize: '13px',
                                        outline: 'none',
                                        fontFamily: 'inherit',
                                        cursor: adjustmentType !== 'positive' ? 'not-allowed' : 'text'
                                    }}
                                />
                                {adjustmentType === 'positive' && (
                                    <div style={{ fontSize: '9px', color: '#EF4444', marginTop: '2px' }}>
                                        * Required for Positive adjustment (future date)
                                    </div>
                                )}
                                {adjustmentType !== 'positive' && (
                                    <div style={{ fontSize: '9px', color: '#D69E2E', marginTop: '2px' }}>
                                        Using existing batch expiry date
                                    </div>
                                )}
                            </div>
                            <div style={{ visibility: 'hidden' }}></div>
                        </div>

                        {/* Actions */}
                        <div className="adjustment-actions">
                            <button
                                className="btn-add"
                                onClick={addItem}
                                disabled={!selectedProduct || submitting}
                            >
                                <AddIcon /> Add to List
                            </button>
                            <button
                                className="btn-gold"
                                onClick={submitAdjustment}
                                disabled={items.length === 0 || submitting}
                            >
                                <AdjustIcon /> Apply Adjustment
                            </button>
                        </div>
                    </div>

                    {/* Right - Items List */}
                    <div className="adjustment-card">
                        <div className="items-header">
                            <h3>
                                Items to Adjust
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
                                <p>Search and add products to adjust</p>
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
                                                const { isExpired } = checkProductExpired(item.expiryDate);
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

                                <div className="adjustment-summary">
                                    <div className="left">
                                        <span>Items: <strong>{items.length}</strong></span>
                                        <span>Total: <strong>{items.reduce((s, i) => s + i.quantity, 0)}</strong></span>
                                        <span>Type: <strong style={{ 
                                            color: adjustmentType === 'positive' ? '#10B981' : 
                                                   adjustmentType === 'negative' ? '#EF4444' : '#F59E0B' 
                                        }}>{adjustmentType.toUpperCase()}</strong></span>
                                    </div>
                                    <button
                                        className="btn-gold"
                                        onClick={submitAdjustment}
                                        disabled={submitting || items.length === 0 || !referenceNumber || !approvedBy}
                                    >
                                        {submitting ? (
                                            <><span className="spinner"></span> Processing...</>
                                        ) : (
                                            <><AdjustIcon /> Apply Adjustment ({items.length})</>
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

export default StockAdjustment;