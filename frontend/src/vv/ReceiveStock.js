import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/styles.css';
import api from '../services/api';

// Modern SVG Icons - No Emojis
const Icons = {
    // Header
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
    // Actions
    Add: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
    ),
    Receive: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
            <polyline points="17 6 23 6 23 12"/>
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
    Apply: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D69E2E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
        </svg>
    ),
    AddNew: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
    ),
    Dropdown: () => (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
        </svg>
    ),
    Search: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
    ),
    // Section Icons
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
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
    ),
    ReceiveIcon: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D69E2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
            <polyline points="17 6 23 6 23 12"/>
        </svg>
    )
};

// Intelligent Dropdown Component - for Supplier and Remarks
const IntelligentDropdown = ({ 
    label, 
    name, 
    options, 
    value, 
    onChange, 
    placeholder,
    onAddNew,
    onDelete,
    disabled
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOptions, setFilteredOptions] = useState(options);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newValue, setNewValue] = useState('');
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (value) {
            setSearchTerm(value);
        }
    }, [value]);

    useEffect(() => {
        if (searchTerm) {
            const filtered = options.filter(opt => 
                opt.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredOptions(filtered);
        } else {
            setFilteredOptions(options);
        }
    }, [searchTerm, options]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
                setIsAddingNew(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        onChange({ target: { name, value: option } });
        setSearchTerm(option);
        setIsOpen(false);
        setIsAddingNew(false);
    };

    const handleAddNew = () => {
        if (newValue.trim()) {
            if (onAddNew) {
                onAddNew(newValue.trim());
            }
            onChange({ target: { name, value: newValue.trim() } });
            setSearchTerm(newValue.trim());
            setIsAddingNew(false);
            setNewValue('');
            setIsOpen(false);
        }
    };

    const handleDelete = (option, e) => {
        e.stopPropagation();
        if (onDelete && window.confirm(`Delete "${option}"?`)) {
            onDelete(option);
            if (value === option) {
                onChange({ target: { name, value: '' } });
                setSearchTerm('');
            }
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            if (isAddingNew) {
                handleAddNew();
            } else if (filteredOptions.length === 1) {
                handleSelect(filteredOptions[0]);
            } else if (searchTerm && !options.includes(searchTerm)) {
                setIsAddingNew(true);
                setNewValue(searchTerm);
            } else {
                setIsOpen(false);
            }
            e.preventDefault();
        }
        if (e.key === 'Escape') {
            setIsOpen(false);
            setIsAddingNew(false);
        }
        if (e.key === 'ArrowDown') {
            setIsOpen(true);
            e.preventDefault();
        }
    };

    const handleFocus = () => {
        if (!isAddingNew && !disabled) {
            setIsOpen(true);
        }
    };

    return (
        <div className="form-group" ref={dropdownRef}>
            <label className="form-label">{label}</label>
            <div className="intelligent-dropdown">
                <div className="dropdown-input-wrapper" onClick={() => !isAddingNew && !disabled && setIsOpen(true)}>
                    <input
                        ref={inputRef}
                        type="text"
                        className="form-input dropdown-input"
                        placeholder={isAddingNew ? 'Type new value...' : placeholder || 'Type to search...'}
                        value={isAddingNew ? newValue : searchTerm}
                        onChange={(e) => {
                            if (isAddingNew) {
                                setNewValue(e.target.value);
                            } else {
                                setSearchTerm(e.target.value);
                                setIsOpen(true);
                            }
                        }}
                        onKeyDown={handleKeyPress}
                        onFocus={handleFocus}
                        disabled={disabled}
                    />
                    <span className="dropdown-arrow">
                        <Icons.Dropdown />
                    </span>
                </div>

                {isOpen && !isAddingNew && !disabled && (
                    <div className="dropdown-menu">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt, index) => (
                                <div
                                    key={index}
                                    className="dropdown-item"
                                    onClick={() => handleSelect(opt)}
                                >
                                    <span className="dropdown-item-text">{opt}</span>
                                    <button 
                                        className="dropdown-delete-btn"
                                        onClick={(e) => handleDelete(opt, e)}
                                        title={`Delete "${opt}"`}
                                    >
                                        <Icons.Remove />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <>
                                {searchTerm && !options.includes(searchTerm) ? (
                                    <div 
                                        className="dropdown-item add-new-item"
                                        onClick={() => {
                                            setIsAddingNew(true);
                                            setNewValue(searchTerm);
                                            setIsOpen(false);
                                        }}
                                    >
                                        <Icons.AddNew /> Add "{searchTerm}"
                                    </div>
                                ) : (
                                    <div className="dropdown-empty">No options found</div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {isAddingNew && !disabled && (
                    <div className="add-new-dropdown">
                        <div className="add-new-input-wrapper">
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter new value..."
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                onKeyDown={handleKeyPress}
                                autoFocus
                            />
                            <button className="add-new-confirm" onClick={handleAddNew}>
                                <Icons.AddNew /> Add
                            </button>
                            <button className="add-new-cancel" onClick={() => {
                                setIsAddingNew(false);
                                setNewValue('');
                                if (searchTerm) {
                                    setIsOpen(true);
                                }
                            }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ReceiveStock = () => {
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
    const [receiveItems, setReceiveItems] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const searchRef = useRef(null);
    const qtyRef = useRef(null);

    // Saved options for intelligent dropdowns
    const [savedSuppliers, setSavedSuppliers] = useState(() => {
        const saved = localStorage.getItem('medox_suppliers');
        return saved ? JSON.parse(saved) : [];
    });
    const [savedRemarks, setSavedRemarks] = useState(() => {
        const saved = localStorage.getItem('medox_receive_remarks');
        return saved ? JSON.parse(saved) : [];
    });

    const [batchDefaults, setBatchDefaults] = useState({
        dNote: '',
        supplier: '',
        remarks: ''
    });

    const [currentItem, setCurrentItem] = useState({
        productId: '',
        productName: '',
        quantityReceived: '',
        batchNumber: '',
        expiryDate: '',
        dNote: '',
        supplier: '',
        remarks: ''
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchProducts();
    }, []);

    // Save dropdown options
    useEffect(() => {
        localStorage.setItem('medox_suppliers', JSON.stringify(savedSuppliers));
    }, [savedSuppliers]);

    useEffect(() => {
        localStorage.setItem('medox_receive_remarks', JSON.stringify(savedRemarks));
    }, [savedRemarks]);

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

        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        setCurrentItem({
            productId: product._id,
            productName: `${product.name} ${product.strength || ''}`,
            quantityReceived: '',
            batchNumber: `B-${year}${month}${day}`,
            expiryDate: '',
            dNote: batchDefaults.dNote || '',
            supplier: batchDefaults.supplier || '',
            remarks: batchDefaults.remarks || ''
        });

        setTimeout(() => {
            if (qtyRef.current) qtyRef.current.focus();
        }, 150);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentItem(prev => ({ ...prev, [name]: value }));
    };

    const handleBatchDefaultChange = (e) => {
        const { name, value } = e.target;
        setBatchDefaults(prev => ({ ...prev, [name]: value }));
        if (selectedProduct) {
            setCurrentItem(prev => ({ ...prev, [name]: value }));
        }
    };

    const applyBatchDefaults = () => {
        if (receiveItems.length === 0) {
            setError('Add items to the list first, then apply defaults.');
            return;
        }
        const updatedItems = receiveItems.map(item => ({
            ...item,
            dNote: batchDefaults.dNote || item.dNote,
            supplier: batchDefaults.supplier || item.supplier,
            remarks: batchDefaults.remarks || item.remarks
        }));
        setReceiveItems(updatedItems);
        setMessage('✅ Batch defaults applied to all items!');
        setTimeout(() => setMessage(''), 3000);
    };

    // Receive Now - single item directly
    const receiveNow = async () => {
        if (!currentItem.productId) {
            setError('Please select a product');
            return;
        }

        const qty = parseInt(currentItem.quantityReceived);
        if (!qty || qty <= 0) {
            setError('Please enter a valid quantity');
            if (qtyRef.current) qtyRef.current.focus();
            return;
        }

        if (!currentItem.batchNumber) {
            setError('Please enter a batch number');
            return;
        }

        if (!currentItem.expiryDate) {
            setError('Please select an expiry date');
            return;
        }

        setSubmitting(true);
        setError('');
        setMessage('');

        try {
            const product = products.find(p => p._id === currentItem.productId);
            if (!product) {
                setError('Product not found');
                setSubmitting(false);
                return;
            }

            const newStock = (product.quantityOnHand || 0) + qty;

            const updateData = {
                quantityReceived: qty,
                quantityOnHand: newStock,
                batchNumber: currentItem.batchNumber,
                expiryDate: currentItem.expiryDate,
                dNote: currentItem.dNote || '',
                supplier: currentItem.supplier || '',
                remarks: currentItem.remarks || ''
            };

            // Save to history for dropdowns
            if (currentItem.supplier && !savedSuppliers.includes(currentItem.supplier)) {
                setSavedSuppliers([...savedSuppliers, currentItem.supplier]);
            }
            if (currentItem.remarks && !savedRemarks.includes(currentItem.remarks)) {
                setSavedRemarks([...savedRemarks, currentItem.remarks]);
            }

            const response = await api.put(`/api/products/${currentItem.productId}`, updateData);

            if (response.data.success) {
                setMessage(`✅ Successfully received ${qty} units!`);
                
                setCurrentItem({
                    productId: '',
                    productName: '',
                    quantityReceived: '',
                    batchNumber: '',
                    expiryDate: '',
                    dNote: batchDefaults.dNote || '',
                    supplier: batchDefaults.supplier || '',
                    remarks: batchDefaults.remarks || ''
                });
                setSelectedProduct(null);
                setSearchTerm('');
                fetchProducts();
                
                setTimeout(() => {
                    if (searchRef.current) searchRef.current.focus();
                }, 100);
                
                setTimeout(() => setMessage(''), 5000);
            }
        } catch (error) {
            console.error('Receive error:', error);
            setError(error.response?.data?.message || 'Failed to receive stock');
        } finally {
            setSubmitting(false);
        }
    };

    const addItemToList = () => {
        if (!currentItem.productId) {
            setError('Please select a product');
            return;
        }

        const qty = parseInt(currentItem.quantityReceived);
        if (!qty || qty <= 0) {
            setError('Please enter a valid quantity');
            if (qtyRef.current) qtyRef.current.focus();
            return;
        }

        if (!currentItem.batchNumber) {
            setError('Please enter a batch number');
            return;
        }

        if (!currentItem.expiryDate) {
            setError('Please select an expiry date');
            return;
        }

        const existingIndex = receiveItems.findIndex(item => item.productId === currentItem.productId);
        if (existingIndex !== -1) {
            const updatedItems = [...receiveItems];
            updatedItems[existingIndex] = {
                ...updatedItems[existingIndex],
                quantityReceived: (updatedItems[existingIndex].quantityReceived || 0) + qty,
                batchNumber: currentItem.batchNumber,
                expiryDate: currentItem.expiryDate,
                dNote: currentItem.dNote || updatedItems[existingIndex].dNote,
                supplier: currentItem.supplier || updatedItems[existingIndex].supplier,
                remarks: currentItem.remarks || updatedItems[existingIndex].remarks
            };
            setReceiveItems(updatedItems);
        } else {
            setReceiveItems([...receiveItems, { ...currentItem, quantityReceived: qty }]);
        }

        setTotalItems(prev => prev + qty);

        setCurrentItem({
            productId: '',
            productName: '',
            quantityReceived: '',
            batchNumber: '',
            expiryDate: '',
            dNote: batchDefaults.dNote || '',
            supplier: batchDefaults.supplier || '',
            remarks: batchDefaults.remarks || ''
        });
        setSelectedProduct(null);
        setSearchTerm('');
        setError('');
        setMessage('✅ Item added to list!');
        setTimeout(() => setMessage(''), 2000);

        setTimeout(() => {
            if (searchRef.current) searchRef.current.focus();
        }, 100);
    };

    const removeItem = (index) => {
        const item = receiveItems[index];
        setTotalItems(prev => prev - (item.quantityReceived || 0));
        const updatedItems = receiveItems.filter((_, i) => i !== index);
        setReceiveItems(updatedItems);
    };

    const updateItemQuantity = (index, newQuantity) => {
        const qty = parseInt(newQuantity) || 0;
        const oldQty = receiveItems[index].quantityReceived || 0;
        setTotalItems(prev => prev - oldQty + qty);
        const updatedItems = [...receiveItems];
        updatedItems[index].quantityReceived = qty;
        setReceiveItems(updatedItems);
    };

    const updateItemField = (index, field, value) => {
        const updatedItems = [...receiveItems];
        updatedItems[index][field] = value;
        setReceiveItems(updatedItems);
    };

    const handleReceiveAll = async () => {
        if (receiveItems.length === 0) {
            setError('No items to receive.');
            return;
        }

        setSubmitting(true);
        setError('');
        setMessage('');

        try {
            let successCount = 0;
            let failedItems = [];

            for (const item of receiveItems) {
                try {
                    const product = products.find(p => p._id === item.productId);
                    if (!product) {
                        failedItems.push(item.productName || item.productId);
                        continue;
                    }

                    const newStock = (product.quantityOnHand || 0) + item.quantityReceived;

                    const updateData = {
                        quantityReceived: item.quantityReceived,
                        quantityOnHand: newStock,
                        batchNumber: item.batchNumber,
                        expiryDate: item.expiryDate,
                        dNote: item.dNote || '',
                        supplier: item.supplier || '',
                        remarks: item.remarks || ''
                    };

                    // Save to history
                    if (item.supplier && !savedSuppliers.includes(item.supplier)) {
                        setSavedSuppliers([...savedSuppliers, item.supplier]);
                    }
                    if (item.remarks && !savedRemarks.includes(item.remarks)) {
                        setSavedRemarks([...savedRemarks, item.remarks]);
                    }

                    const response = await api.put(`/api/products/${item.productId}`, updateData);

                    if (response.data.success) {
                        successCount++;
                    } else {
                        failedItems.push(item.productName || item.productId);
                    }
                } catch (err) {
                    console.error('Error processing item:', err);
                    failedItems.push(item.productName || item.productId);
                }
            }

            if (failedItems.length === 0) {
                setMessage(`✅ Successfully received ${successCount} items! Total ${totalItems} units added.`);
            } else {
                setMessage(`⚠️ ${successCount} items received. Failed: ${failedItems.join(', ')}`);
            }

            setReceiveItems([]);
            setTotalItems(0);
            setBatchDefaults({ dNote: '', supplier: '', remarks: '' });
            setCurrentItem({
                productId: '',
                productName: '',
                quantityReceived: '',
                batchNumber: '',
                expiryDate: '',
                dNote: '',
                supplier: '',
                remarks: ''
            });
            setSelectedProduct(null);
            setSearchTerm('');
            fetchProducts();

            setTimeout(() => setMessage(''), 8000);
        } catch (error) {
            console.error('Receive stock error:', error);
            setError(error.response?.data?.message || 'Failed to receive stock');
        } finally {
            setSubmitting(false);
        }
    };

    const clearAll = () => {
        setReceiveItems([]);
        setTotalItems(0);
        setBatchDefaults({ dNote: '', supplier: '', remarks: '' });
        setCurrentItem({
            productId: '',
            productName: '',
            quantityReceived: '',
            batchNumber: '',
            expiryDate: '',
            dNote: '',
            supplier: '',
            remarks: ''
        });
        setSelectedProduct(null);
        setSearchTerm('');
        setError('');
        setMessage('');
        setShowDropdown(false);
        setFilteredProducts(products);
    };

    // Handlers for intelligent dropdowns
    const handleAddSupplier = (value) => {
        if (!savedSuppliers.includes(value)) {
            setSavedSuppliers([...savedSuppliers, value].sort());
        }
    };

    const handleDeleteSupplier = (value) => {
        setSavedSuppliers(savedSuppliers.filter(s => s !== value));
    };

    const handleAddRemark = (value) => {
        if (!savedRemarks.includes(value)) {
            setSavedRemarks([...savedRemarks, value].sort());
        }
    };

    const handleDeleteRemark = (value) => {
        setSavedRemarks(savedRemarks.filter(r => r !== value));
    };

    return (
        <div className="receive-stock-wrapper">
            <header className="receive-header">
                <div className="header-left">
                    <Icons.Pharmacy />
                    <span className="header-brand">MedOx <span className="gold">Pharmacy</span></span>
                    <span className="header-badge">Receive Stock</span>
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

            <div className="receive-content">
                <div className="receive-page-header">
                    <h1><Icons.ReceiveIcon /> Receive Stock</h1>
                    <p>Add stock to existing products with batch and expiry details</p>
                </div>

                {message && <div className="alert-success">{message}</div>}
                {error && <div className="alert-error">{error}</div>}

                <div className="receive-grid">
                    <div className="receive-left">
                        {/* Batch Defaults */}
                        <div className="receive-card">
                            <div className="card-header">
                                <Icons.Settings />
                                <h3>Batch Defaults</h3>
                                <span className="card-badge">Optional</span>
                            </div>
                            <div className="batch-defaults-row">
                                <input
                                    type="text"
                                    name="dNote"
                                    className="form-input"
                                    placeholder="D. Note / RIV (Optional)"
                                    value={batchDefaults.dNote}
                                    onChange={handleBatchDefaultChange}
                                />
                                <input
                                    type="text"
                                    name="supplier"
                                    className="form-input"
                                    placeholder="Supplier (Optional)"
                                    value={batchDefaults.supplier}
                                    onChange={handleBatchDefaultChange}
                                />
                                <input
                                    type="text"
                                    name="remarks"
                                    className="form-input"
                                    placeholder="Remarks (Optional)"
                                    value={batchDefaults.remarks}
                                    onChange={handleBatchDefaultChange}
                                />
                                <button className="btn-apply-defaults" onClick={applyBatchDefaults} disabled={receiveItems.length === 0}>
                                    <Icons.Apply /> Apply
                                </button>
                            </div>
                        </div>

                        {/* Add Item Form */}
                        <div className="receive-card">
                            <h3 className="card-title"><Icons.Add /> Add Item to Receive</h3>

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
                                {showDropdown && searchTerm && filteredProducts.length === 0 && (
                                    <div className="search-dropdown-empty">
                                        No products found for "{searchTerm}"
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
                                        name="quantityReceived"
                                        className="form-input"
                                        placeholder="0"
                                        value={currentItem.quantityReceived}
                                        onChange={handleInputChange}
                                        min="1"
                                        disabled={!selectedProduct}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Batch Number <span className="required-dot">*</span></label>
                                    <input
                                        type="text"
                                        name="batchNumber"
                                        className="form-input"
                                        placeholder="B-2026-001"
                                        value={currentItem.batchNumber}
                                        onChange={handleInputChange}
                                        disabled={!selectedProduct}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Expiry Date <span className="required-dot">*</span></label>
                                    <input
                                        type="date"
                                        name="expiryDate"
                                        className="form-input"
                                        value={currentItem.expiryDate}
                                        onChange={handleInputChange}
                                        disabled={!selectedProduct}
                                    />
                                </div>
                            </div>

                            <div className="form-row-3">
                                <div className="form-group">
                                    <label className="form-label">D. Note / RIV</label>
                                    <input
                                        type="text"
                                        name="dNote"
                                        className="form-input"
                                        placeholder="Optional"
                                        value={currentItem.dNote}
                                        onChange={handleInputChange}
                                        disabled={!selectedProduct}
                                    />
                                </div>
                                <IntelligentDropdown
                                    label="Supplier"
                                    name="supplier"
                                    options={savedSuppliers}
                                    value={currentItem.supplier}
                                    onChange={handleInputChange}
                                    placeholder="Type or select supplier..."
                                    onAddNew={handleAddSupplier}
                                    onDelete={handleDeleteSupplier}
                                    disabled={!selectedProduct}
                                />
                                <IntelligentDropdown
                                    label="Remarks"
                                    name="remarks"
                                    options={savedRemarks}
                                    value={currentItem.remarks}
                                    onChange={handleInputChange}
                                    placeholder="Type or select remark..."
                                    onAddNew={handleAddRemark}
                                    onDelete={handleDeleteRemark}
                                    disabled={!selectedProduct}
                                />
                            </div>

                            <div className="receive-actions-row">
                                <button
                                    className="btn-add-to-list"
                                    onClick={addItemToList}
                                    disabled={!selectedProduct || submitting}
                                >
                                    <Icons.Add /> Add to List
                                </button>
                                <button
                                    className="btn-receive-now"
                                    onClick={receiveNow}
                                    disabled={!selectedProduct || submitting}
                                >
                                    <Icons.Receive /> Receive Now
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="receive-right">
                        <div className="receive-card items-card">
                            <div className="items-header">
                                <h3>
                                    <Icons.Box /> Items to Receive
                                    <span className="items-count">{receiveItems.length}</span>
                                </h3>
                                {receiveItems.length > 0 && (
                                    <button className="btn-clear-all" onClick={clearAll}>
                                        <Icons.Clear /> Clear All
                                    </button>
                                )}
                            </div>

                            {receiveItems.length > 0 ? (
                                <>
                                    <div className="items-table-wrapper">
                                        <table className="items-table">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Product</th>
                                                    <th>Qty</th>
                                                    <th>Batch</th>
                                                    <th>Expiry</th>
                                                    <th>D.Note</th>
                                                    <th>Supplier</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {receiveItems.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td className="item-name">{item.productName}</td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                className="qty-input"
                                                                value={item.quantityReceived}
                                                                onChange={(e) => updateItemQuantity(index, e.target.value)}
                                                                min="1"
                                                            />
                                                        </td>
                                                        <td>{item.batchNumber}</td>
                                                        <td>{new Date(item.expiryDate).toLocaleDateString()}</td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                className="inline-input"
                                                                value={item.dNote || ''}
                                                                onChange={(e) => updateItemField(index, 'dNote', e.target.value)}
                                                                placeholder="—"
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                className="inline-input"
                                                                value={item.supplier || ''}
                                                                onChange={(e) => updateItemField(index, 'supplier', e.target.value)}
                                                                placeholder="—"
                                                            />
                                                        </td>
                                                        <td>
                                                            <button className="btn-remove-item" onClick={() => removeItem(index)}>
                                                                <Icons.Remove />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="items-summary">
                                        <div className="summary-left">
                                            <span>Total Items: <strong>{receiveItems.length}</strong></span>
                                            <span>Total Units: <strong>{totalItems}</strong></span>
                                        </div>
                                        <button
                                            className="btn-receive-all"
                                            onClick={handleReceiveAll}
                                            disabled={submitting}
                                        >
                                            {submitting ? (
                                                <>
                                                    <span className="spinner-small"></span>
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <Icons.Receive /> Receive All ({receiveItems.length} items)
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="empty-state">
                                    <Icons.EmptyBox />
                                    <p>No items added yet</p>
                                    <span>Search and add products to receive</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceiveStock;
