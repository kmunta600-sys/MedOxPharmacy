import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/styles.css';
import api from '../services/api';

// SVG Icons
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
    Add: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
    ),
    Remove: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
    ),
    Clear: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
    ),
    Settings: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D69E2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>
    ),
    Box: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D69E2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
    ),
    EmptyBox: () => (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(214,158,46,0.08)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
    ),
    Adjustment: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D69E2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4M12 22v-4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M22 12h-4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
    ),
    Positive: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
            <polyline points="17 6 23 6 23 12"/>
        </svg>
    ),
    Negative: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
            <polyline points="17 18 23 18 23 12"/>
        </svg>
    )
};

const StockAdjustment = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [adjustmentItems, setAdjustmentItems] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const searchRef = useRef(null);
    const qtyRef = useRef(null);
    const [adjustmentType, setAdjustmentType] = useState('positive');

    const [currentItem, setCurrentItem] = useState({
        productId: '',
        productName: '',
        quantity: '',
        reason: '',
        remarks: '',
        currentStock: 0
    });

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

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value === '') {
            setSelectedProduct(null);
            setShowDropdown(false);
            setFilteredProducts(products);
            return;
        }

        setShowDropdown(true);
        const filtered = products.filter(product =>
            product.name.toLowerCase().includes(value.toLowerCase()) ||
            (product.code && product.code.toLowerCase().includes(value.toLowerCase())) ||
            (product.strength && product.strength.toLowerCase().includes(value.toLowerCase()))
        );
        setFilteredProducts(filtered);
    };

    const selectProduct = (product) => {
        setSelectedProduct(product);
        setSearchTerm(`${product.name} ${product.strength || ''}`);
        setShowDropdown(false);
        setError('');
        setMessage('');

        setCurrentItem({
            productId: product._id,
            productName: `${product.name} ${product.strength || ''}`,
            quantity: '',
            reason: '',
            remarks: '',
            currentStock: product.quantityOnHand || 0
        });

        setTimeout(() => {
            if (qtyRef.current) qtyRef.current.focus();
        }, 150);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentItem(prev => ({ ...prev, [name]: value }));
    };

    const addItemToList = () => {
        if (!currentItem.productId) {
            setError('Please select a product');
            return;
        }

        const qty = parseInt(currentItem.quantity);
        if (!qty || qty <= 0) {
            setError('Please enter a valid quantity');
            if (qtyRef.current) qtyRef.current.focus();
            return;
        }

        if ((adjustmentType === 'negative' || adjustmentType === 'losses') && qty > currentItem.currentStock) {
            setError(`Insufficient stock! Only ${currentItem.currentStock} units available.`);
            return;
        }

        if (!currentItem.reason) {
            setError('Please enter a reason for adjustment');
            return;
        }

        const existingIndex = adjustmentItems.findIndex(item => item.productId === currentItem.productId);
        if (existingIndex !== -1) {
            const updatedItems = [...adjustmentItems];
            const newQty = (updatedItems[existingIndex].quantity || 0) + qty;
            if ((adjustmentType === 'negative' || adjustmentType === 'losses') && newQty > updatedItems[existingIndex].currentStock) {
                setError(`Insufficient stock! Only ${updatedItems[existingIndex].currentStock} units available.`);
                return;
            }
            updatedItems[existingIndex] = {
                ...updatedItems[existingIndex],
                quantity: newQty,
                reason: currentItem.reason || updatedItems[existingIndex].reason,
                remarks: currentItem.remarks || updatedItems[existingIndex].remarks
            };
            setAdjustmentItems(updatedItems);
        } else {
            setAdjustmentItems([...adjustmentItems, { ...currentItem, quantity: qty }]);
        }

        setTotalItems(prev => prev + qty);

        setCurrentItem({
            productId: '',
            productName: '',
            quantity: '',
            reason: '',
            remarks: '',
            currentStock: 0
        });
        setSelectedProduct(null);
        setSearchTerm('');
        setError('');
        setMessage('✅ Item added!');
        setTimeout(() => setMessage(''), 2000);

        setTimeout(() => {
            if (searchRef.current) searchRef.current.focus();
        }, 100);
    };

    const removeItem = (index) => {
        const item = adjustmentItems[index];
        setTotalItems(prev => prev - (item.quantity || 0));
        const updatedItems = adjustmentItems.filter((_, i) => i !== index);
        setAdjustmentItems(updatedItems);
    };

    const updateItemQuantity = (index, newQuantity) => {
        const qty = parseInt(newQuantity) || 0;
        const item = adjustmentItems[index];
        if ((adjustmentType === 'negative' || adjustmentType === 'losses') && qty > item.currentStock) {
            setError(`Insufficient stock! Only ${item.currentStock} units available.`);
            return;
        }
        const oldQty = adjustmentItems[index].quantity || 0;
        setTotalItems(prev => prev - oldQty + qty);
        const updatedItems = [...adjustmentItems];
        updatedItems[index].quantity = qty;
        setAdjustmentItems(updatedItems);
    };

    const handleApplyAdjustment = async () => {
        if (adjustmentItems.length === 0) {
            setError('No items to adjust.');
            return;
        }

        setSubmitting(true);
        setError('');
        setMessage('');

        try {
            let successCount = 0;
            let failedItems = [];

            for (const item of adjustmentItems) {
                try {
                    const product = products.find(p => p._id === item.productId);
                    if (!product) {
                        failedItems.push(item.productName || item.productId);
                        continue;
                    }

                    let newStock;
                    let remarks;
                    let adjType = '';

                    // Determine the adjustment type
                    const selectedType = adjustmentType;
                    console.log('🔍 Selected adjustment type:', selectedType);
                    console.log('📦 Product:', product.name);
                    console.log('📦 Quantity:', item.quantity);

                    if (selectedType === 'positive') {
                        newStock = (product.quantityOnHand || 0) + item.quantity;
                        remarks = `Positive Adjustment: +${item.quantity} units - ${item.reason}${item.remarks ? ' - ' + item.remarks : ''}`;
                        adjType = 'positive';
                        console.log('✅ Positive Adjustment - will show in Pos Adj column');
                    } else if (selectedType === 'losses') {
                        newStock = (product.quantityOnHand || 0) - item.quantity;
                        remarks = `Losses: ${item.quantity} units - ${item.reason}${item.remarks ? ' - ' + item.remarks : ''}`;
                        adjType = 'loss';
                        console.log('✅ Loss - will show in Losses column');
                    } else {
                        // Negative adjustment
                        newStock = (product.quantityOnHand || 0) - item.quantity;
                        remarks = `Negative Adjustment: -${item.quantity} units - ${item.reason}${item.remarks ? ' - ' + item.remarks : ''}`;
                        adjType = 'negative';
                        console.log('✅ Negative Adjustment - will show in Neg Adj column');
                    }

                    if (newStock < 0) {
                        failedItems.push(`${item.productName} - Insufficient stock`);
                        continue;
                    }

                    console.log('📤 Sending to backend:', {
                        adjustmentType: adjType,
                        remarks: remarks,
                        newStock: newStock,
                        productId: product._id
                    });

                    const updateData = {
                        quantityOnHand: newStock,
                        remarks: remarks,
                        adjustmentType: adjType
                    };

                    const response = await api.put(`/api/products/${item.productId}`, updateData);

                    if (response.data.success) {
                        successCount++;
                        console.log('✅ Successfully updated:', product.name);
                    } else {
                        failedItems.push(item.productName || item.productId);
                    }
                } catch (err) {
                    console.error('Error processing item:', err);
                    failedItems.push(item.productName || item.productId);
                }
            }

            if (failedItems.length === 0) {
                setMessage(`✅ ${successCount} items adjusted! Total ${totalItems} units ${adjustmentType === 'positive' ? 'added' : adjustmentType === 'losses' ? 'lost' : 'removed'}.`);
            } else {
                setMessage(`⚠️ ${successCount} items adjusted. Failed: ${failedItems.join(', ')}`);
            }

            setAdjustmentItems([]);
            setTotalItems(0);
            setCurrentItem({
                productId: '',
                productName: '',
                quantity: '',
                reason: '',
                remarks: '',
                currentStock: 0
            });
            setSelectedProduct(null);
            setSearchTerm('');
            fetchProducts();

            setTimeout(() => setMessage(''), 8000);
        } catch (error) {
            console.error('Adjustment error:', error);
            setError(error.response?.data?.message || 'Failed to adjust stock');
        } finally {
            setSubmitting(false);
        }
    };

    const clearAll = () => {
        setAdjustmentItems([]);
        setTotalItems(0);
        setCurrentItem({
            productId: '',
            productName: '',
            quantity: '',
            reason: '',
            remarks: '',
            currentStock: 0
        });
        setSelectedProduct(null);
        setSearchTerm('');
        setError('');
        setMessage('');
        setShowDropdown(false);
        setFilteredProducts(products);
    };

    return (
        <div className="adjustment-modern-wrapper">
            <header className="adjustment-modern-header">
                <div className="header-left">
                    <Icons.Pharmacy />
                    <span className="header-brand">MedOx <span className="gold">Pharmacy</span></span>
                    <span className="header-badge">Adjustment</span>
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

            <div className="adjustment-modern-content">
                <div className="adjustment-modern-container">
                    <div className="adjustment-page-header">
                        <h1><Icons.Adjustment /> Stock Adjustment</h1>
                        <p>Add or remove stock for inventory corrections</p>
                    </div>

                    {message && <div className="alert-success">{message}</div>}
                    {error && <div className="alert-error">{error}</div>}

                    <div className="adjustment-modern-grid">
                        <div className="adjustment-left">
                            {/* Adjustment Type */}
                            <div className="adjustment-card">
                                <div className="card-header">
                                    <Icons.Settings />
                                    <h3>Adjustment Type</h3>
                                </div>
                                <div className="adjustment-type-row">
                                    <button
                                        className={`adjustment-type-btn ${adjustmentType === 'positive' ? 'active positive' : ''}`}
                                        onClick={() => setAdjustmentType('positive')}
                                    >
                                        <Icons.Positive />
                                        <span>Positive</span>
                                        <span className="type-label">Add Stock</span>
                                    </button>
                                    <button
                                        className={`adjustment-type-btn ${adjustmentType === 'negative' ? 'active negative' : ''}`}
                                        onClick={() => setAdjustmentType('negative')}
                                    >
                                        <Icons.Negative />
                                        <span>Negative</span>
                                        <span className="type-label">Remove Stock</span>
                                    </button>
                                    <button
                                        className={`adjustment-type-btn ${adjustmentType === 'losses' ? 'active losses' : ''}`}
                                        onClick={() => setAdjustmentType('losses')}
                                    >
                                        <span className="loss-icon">📉</span>
                                        <span>Losses</span>
                                        <span className="type-label">Damage / Expiry</span>
                                    </button>
                                </div>
                            </div>

                            {/* Add Item Form */}
                            <div className="adjustment-card">
                                <h3 className="card-title"><Icons.Add /> Add Item to Adjust</h3>

                                <div className="search-wrapper">
                                    <input
                                        ref={searchRef}
                                        type="text"
                                        className="search-input"
                                        placeholder="Search product by name or code..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        onFocus={() => {
                                            if (products.length > 0) {
                                                setFilteredProducts(products);
                                                setShowDropdown(true);
                                            }
                                        }}
                                    />
                                    {showDropdown && filteredProducts.length > 0 && (
                                        <div className="search-dropdown">
                                            {filteredProducts.map(product => (
                                                <div
                                                    key={product._id}
                                                    className="search-dropdown-item"
                                                    onClick={() => selectProduct(product)}
                                                >
                                                    <span className="dropdown-name">{product.name} {product.strength || ''}</span>
                                                    <span className="dropdown-detail">Stock: {product.quantityOnHand || 0} | Code: {product.code || 'N/A'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {selectedProduct && (
                                    <div className="selected-product">
                                        <div className="selected-info">
                                            <span className="selected-label">Product:</span>
                                            <span className="selected-value">{selectedProduct.name} {selectedProduct.strength || ''}</span>
                                        </div>
                                        <div className="selected-info">
                                            <span className="selected-label">Stock:</span>
                                            <span className="selected-stock">{selectedProduct.quantityOnHand || 0} units</span>
                                        </div>
                                        <div className="selected-info">
                                            <span className="selected-label">Code:</span>
                                            <span className="selected-code">{selectedProduct.code || 'N/A'}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="form-row-3">
                                    <div className="form-group">
                                        <label className="form-label">Quantity <span className="required-dot">*</span></label>
                                        <input
                                            ref={qtyRef}
                                            type="number"
                                            name="quantity"
                                            className="form-input"
                                            placeholder="0"
                                            value={currentItem.quantity}
                                            onChange={handleInputChange}
                                            min="1"
                                            disabled={!selectedProduct}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Reason <span className="required-dot">*</span></label>
                                        <input
                                            type="text"
                                            name="reason"
                                            className="form-input"
                                            placeholder="e.g. Stock Take, Damaged, Expired"
                                            value={currentItem.reason}
                                            onChange={handleInputChange}
                                            disabled={!selectedProduct}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Remarks</label>
                                        <input
                                            type="text"
                                            name="remarks"
                                            className="form-input"
                                            placeholder="Optional notes"
                                            value={currentItem.remarks}
                                            onChange={handleInputChange}
                                            disabled={!selectedProduct}
                                        />
                                    </div>
                                </div>

                                <button
                                    className="btn-add-adjustment"
                                    onClick={addItemToList}
                                    disabled={!selectedProduct || submitting}
                                >
                                    <Icons.Add /> Add to List
                                </button>
                            </div>
                        </div>

                        <div className="adjustment-right">
                            <div className="adjustment-card items-card">
                                <div className="items-header">
                                    <h3>
                                        <Icons.Box /> Items to Adjust
                                        <span className="items-count">{adjustmentItems.length}</span>
                                    </h3>
                                    {adjustmentItems.length > 0 && (
                                        <button className="btn-clear-all" onClick={clearAll}>
                                            <Icons.Clear /> Clear All
                                        </button>
                                    )}
                                </div>

                                {adjustmentItems.length > 0 ? (
                                    <>
                                        <div className="items-table-wrapper">
                                            <table className="items-table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Product</th>
                                                        <th>Qty</th>
                                                        <th>Current</th>
                                                        <th>After</th>
                                                        <th>Reason</th>
                                                        <th></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {adjustmentItems.map((item, index) => {
                                                        const afterStock = adjustmentType === 'positive' 
                                                            ? (item.currentStock || 0) + item.quantity
                                                            : (item.currentStock || 0) - item.quantity;
                                                        return (
                                                            <tr key={index}>
                                                                <td>{index + 1}</td>
                                                                <td className="item-name">{item.productName}</td>
                                                                <td>
                                                                    <input
                                                                        type="number"
                                                                        className="qty-input"
                                                                        value={item.quantity}
                                                                        onChange={(e) => updateItemQuantity(index, e.target.value)}
                                                                        min="1"
                                                                    />
                                                                </td>
                                                                <td className="current-stock">{item.currentStock || 0}</td>
                                                                <td className={adjustmentType === 'positive' ? 'after-positive' : adjustmentType === 'losses' ? 'after-losses' : 'after-negative'}>
                                                                    {afterStock}
                                                                </td>
                                                                <td>{item.reason || '—'}</td>
                                                                <td>
                                                                    <button className="btn-remove-item" onClick={() => removeItem(index)}>
                                                                        <Icons.Remove />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="items-summary">
                                            <div className="summary-left">
                                                <span>Items: <strong>{adjustmentItems.length}</strong></span>
                                                <span>Units: <strong>{totalItems}</strong></span>
                                                <span className={`summary-type ${adjustmentType}`}>
                                                    {adjustmentType === 'positive' ? 'Positive' : adjustmentType === 'losses' ? 'Losses' : 'Negative'}
                                                </span>
                                            </div>
                                            <button
                                                className={`btn-apply-adjustment ${adjustmentType}`}
                                                onClick={handleApplyAdjustment}
                                                disabled={submitting}
                                            >
                                                {submitting ? (
                                                    'Processing...'
                                                ) : (
                                                    <>
                                                        <Icons.Adjustment /> Apply Adjustment
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="empty-state">
                                        <Icons.EmptyBox />
                                        <p>No items added yet</p>
                                        <span>Search and add products to adjust</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockAdjustment;


