import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/styles.css';
import api from '../services/api';

// Modern SVG Icons
const Icons = {
    Basic: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D69E2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
        </svg>
    ),
    Stock: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D69E2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
    ),
    Pricing: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D69E2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 12h8"/>
            <path d="M12 8v8"/>
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
    Clear: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
    ),
    Generate: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
    ),
    Dropdown: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
        </svg>
    ),
    AddNew: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
    ),
    Delete: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
    )
};

// Intelligent Dropdown Component with Add & Delete
const IntelligentDropdown = ({ 
    label, 
    name, 
    options, 
    value, 
    onChange, 
    required, 
    placeholder,
    onAddNew,
    onDelete
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
        if (onDelete) {
            if (window.confirm(`Delete "${option}" from ${label} options?`)) {
                onDelete(option);
                if (value === option) {
                    onChange({ target: { name, value: '' } });
                    setSearchTerm('');
                }
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
        if (!isAddingNew) {
            setIsOpen(true);
        }
    };

    return (
        <div className="form-group" ref={dropdownRef}>
            <label className="form-label">
                {label} {required && <span className="required-dot">*</span>}
            </label>
            <div className="intelligent-dropdown">
                <div className="dropdown-input-wrapper" onClick={() => !isAddingNew && setIsOpen(true)}>
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
                    />
                    <span className="dropdown-arrow"><Icons.Dropdown /></span>
                </div>

                {isOpen && !isAddingNew && (
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
                                        <Icons.Delete />
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
                                        <Icons.AddNew />
                                        <span>Add "{searchTerm}"</span>
                                    </div>
                                ) : (
                                    <div className="dropdown-empty">No options found</div>
                                )}
                            </>
                        )}
                        {options.length > 0 && searchTerm && filteredOptions.length === 0 && (
                            <div 
                                className="dropdown-item add-new-item"
                                onClick={() => {
                                    setIsAddingNew(true);
                                    setNewValue(searchTerm);
                                    setIsOpen(false);
                                }}
                            >
                                <Icons.AddNew />
                                <span>Add "{searchTerm}"</span>
                            </div>
                        )}
                    </div>
                )}

                {isAddingNew && (
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

const AddProduct = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const nameInputRef = useRef(null);
    
    // Saved options for dropdowns (stored in localStorage)
    const [savedCategories, setSavedCategories] = useState(() => {
        const saved = localStorage.getItem('medox_categories');
        return saved ? JSON.parse(saved) : ['POM', 'GSL', 'P', 'CD2', 'CD3', 'CD4', 'CD5', 'Other'];
    });
    
    const [savedDosageForms, setSavedDosageForms] = useState(() => {
        const saved = localStorage.getItem('medox_dosage_forms');
        return saved ? JSON.parse(saved) : ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Ointment', 'Drops', 'Inhaler', 'Suspension', 'Suppository', 'Other'];
    });
    
    const [savedUnits, setSavedUnits] = useState(() => {
        const saved = localStorage.getItem('medox_units');
        return saved ? JSON.parse(saved) : ['Strip', 'Bottle', 'Vial', 'Tube', 'Box', 'Pack', 'Tablet', 'Capsule', 'mL', 'g', 'mg', 'Other'];
    });

    const [formData, setFormData] = useState({
        name: '',
        strength: '',
        code: '',
        category: '',
        dosageForm: '',
        unitOfIssue: '',
        quantityReceived: '',
        quantityOnHand: '',
        batchNumber: '',
        expiryDate: '',
        dNote: '',
        supplier: '',
        remarks: '',
        minStock: '50',
        maxStock: '500',
        unitCost: '',
        sellingPrice: ''
    });

    // Save options to localStorage when they change
    useEffect(() => {
        localStorage.setItem('medox_categories', JSON.stringify(savedCategories));
    }, [savedCategories]);

    useEffect(() => {
        localStorage.setItem('medox_dosage_forms', JSON.stringify(savedDosageForms));
    }, [savedDosageForms]);

    useEffect(() => {
        localStorage.setItem('medox_units', JSON.stringify(savedUnits));
    }, [savedUnits]);

    useEffect(() => {
        if (nameInputRef.current) {
            nameInputRef.current.focus();
        }
    }, []);

    useEffect(() => {
        if (formData.name && formData.name.length >= 2) {
            const prefix = formData.name.substring(0, 3).toUpperCase();
            const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            setFormData(prev => ({ ...prev, code: `${prefix}-${random}` }));
        }
    }, [formData.name]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            const form = e.target.form;
            const index = Array.prototype.indexOf.call(form, e.target);
            if (index === form.length - 1) {
                handleSubmit(e);
            } else {
                form.elements[index + 1].focus();
                e.preventDefault();
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.strength || !formData.category || !formData.dosageForm || !formData.unitOfIssue) {
            setError('Please fill in all required fields');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const productData = {
                ...formData,
                quantityReceived: parseInt(formData.quantityReceived) || 0,
                quantityOnHand: parseInt(formData.quantityOnHand) || 0,
                minStock: parseInt(formData.minStock) || 50,
                maxStock: parseInt(formData.maxStock) || 500,
                unitCost: parseFloat(formData.unitCost) || 0,
                sellingPrice: parseFloat(formData.sellingPrice) || 0
            };

            const response = await api.post('/api/products', productData);
            
            if (response.data.success) {
                setMessage('✅ Product added successfully!');
                setFormData({
                    name: '',
                    strength: '',
                    code: '',
                    category: '',
                    dosageForm: '',
                    unitOfIssue: '',
                    quantityReceived: '',
                    quantityOnHand: '',
                    batchNumber: '',
                    expiryDate: '',
                    dNote: '',
                    supplier: '',
                    remarks: '',
                    minStock: '50',
                    maxStock: '500',
                    unitCost: '',
                    sellingPrice: ''
                });
                if (nameInputRef.current) {
                    nameInputRef.current.focus();
                }
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add product');
        } finally {
            setLoading(false);
        }
    };

    const clearForm = () => {
        setFormData({
            name: '',
            strength: '',
            code: '',
            category: '',
            dosageForm: '',
            unitOfIssue: '',
            quantityReceived: '',
            quantityOnHand: '',
            batchNumber: '',
            expiryDate: '',
            dNote: '',
            supplier: '',
            remarks: '',
            minStock: '50',
            maxStock: '500',
            unitCost: '',
            sellingPrice: ''
        });
        setError('');
        setMessage('');
        if (nameInputRef.current) {
            nameInputRef.current.focus();
        }
    };

    // Handlers for adding/removing dropdown options
    const handleAddCategory = (newCategory) => {
        if (!savedCategories.includes(newCategory)) {
            setSavedCategories([...savedCategories, newCategory].sort());
        }
    };

    const handleDeleteCategory = (category) => {
        setSavedCategories(savedCategories.filter(c => c !== category));
    };

    const handleAddDosageForm = (newForm) => {
        if (!savedDosageForms.includes(newForm)) {
            setSavedDosageForms([...savedDosageForms, newForm].sort());
        }
    };

    const handleDeleteDosageForm = (form) => {
        setSavedDosageForms(savedDosageForms.filter(f => f !== form));
    };

    const handleAddUnit = (newUnit) => {
        if (!savedUnits.includes(newUnit)) {
            setSavedUnits([...savedUnits, newUnit].sort());
        }
    };

    const handleDeleteUnit = (unit) => {
        setSavedUnits(savedUnits.filter(u => u !== unit));
    };

    return (
        <div className="add-product-wrapper">
            <header className="app-header">
                <div className="header-left">
                    <span className="header-icon">⚕️</span>
                    <span className="header-brand">MedOx <span className="gold">Pharmacy</span></span>
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

            <div className="add-product-content">
                <div className="page-header">
                    <h1>Add New Product</h1>
                    <p>Enter product details to add to inventory</p>
                </div>

                {message && <div className="alert-success">{message}</div>}
                {error && <div className="alert-error">{error}</div>}

                <form className="product-form" onSubmit={handleSubmit}>
                    {/* GROUP 1: Basic Information */}
                    <div className="form-section">
                        <div className="section-header">
                            <Icons.Basic />
                            <h3>Basic Information</h3>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Product Name <span className="required-dot">*</span></label>
                                <input
                                    ref={nameInputRef}
                                    type="text"
                                    name="name"
                                    className="form-input"
                                    placeholder="Enter product name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    onKeyPress={handleKeyPress}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Strength <span className="required-dot">*</span></label>
                                <input
                                    type="text"
                                    name="strength"
                                    className="form-input"
                                    placeholder="e.g. 500mg"
                                    value={formData.strength}
                                    onChange={handleChange}
                                    onKeyPress={handleKeyPress}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Product Code</label>
                                <div className="code-wrapper">
                                    <input
                                        type="text"
                                        name="code"
                                        className="form-input"
                                        placeholder="Auto-generated"
                                        value={formData.code}
                                        onChange={handleChange}
                                        onKeyPress={handleKeyPress}
                                    />
                                    <button type="button" className="btn-generate" onClick={() => {
                                        const prefix = formData.name ? formData.name.substring(0, 3).toUpperCase() : 'PROD';
                                        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
                                        setFormData(prev => ({ ...prev, code: `${prefix}-${random}` }));
                                    }}>
                                        <Icons.Generate /> Generate
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="form-row">
                            <IntelligentDropdown
                                label="Category"
                                name="category"
                                options={savedCategories}
                                value={formData.category}
                                onChange={handleChange}
                                required={true}
                                placeholder="Type to search category..."
                                onAddNew={handleAddCategory}
                                onDelete={handleDeleteCategory}
                            />
                            <IntelligentDropdown
                                label="Dosage Form"
                                name="dosageForm"
                                options={savedDosageForms}
                                value={formData.dosageForm}
                                onChange={handleChange}
                                required={true}
                                placeholder="Type to search dosage form..."
                                onAddNew={handleAddDosageForm}
                                onDelete={handleDeleteDosageForm}
                            />
                            <IntelligentDropdown
                                label="Unit of Issue"
                                name="unitOfIssue"
                                options={savedUnits}
                                value={formData.unitOfIssue}
                                onChange={handleChange}
                                required={true}
                                placeholder="Type to search unit..."
                                onAddNew={handleAddUnit}
                                onDelete={handleDeleteUnit}
                            />
                        </div>
                    </div>

                    {/* GROUP 2: Stock Information */}
                    <div className="form-section">
                        <div className="section-header">
                            <Icons.Stock />
                            <h3>Stock Information</h3>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Quantity Received</label>
                                <input
                                    type="number"
                                    name="quantityReceived"
                                    className="form-input"
                                    placeholder="0"
                                    value={formData.quantityReceived}
                                    onChange={handleChange}
                                    onKeyPress={handleKeyPress}
                                    min="0"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Quantity on Hand</label>
                                <input
                                    type="number"
                                    name="quantityOnHand"
                                    className="form-input"
                                    placeholder="0"
                                    value={formData.quantityOnHand}
                                    onChange={handleChange}
                                    onKeyPress={handleKeyPress}
                                    min="0"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Batch Number</label>
                                <input
                                    type="text"
                                    name="batchNumber"
                                    className="form-input"
                                    placeholder="B-2026-001"
                                    value={formData.batchNumber}
                                    onChange={handleChange}
                                    onKeyPress={handleKeyPress}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Expiry Date</label>
                                <input
                                    type="date"
                                    name="expiryDate"
                                    className="form-input"
                                    value={formData.expiryDate}
                                    onChange={handleChange}
                                    onKeyPress={handleKeyPress}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Min Stock Level</label>
                                <input
                                    type="number"
                                    name="minStock"
                                    className="form-input"
                                    placeholder="50"
                                    value={formData.minStock}
                                    onChange={handleChange}
                                    onKeyPress={handleKeyPress}
                                    min="0"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Max Stock Level</label>
                                <input
                                    type="number"
                                    name="maxStock"
                                    className="form-input"
                                    placeholder="500"
                                    value={formData.maxStock}
                                    onChange={handleChange}
                                    onKeyPress={handleKeyPress}
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* GROUP 3: Supplier & Pricing */}
                    <div className="form-section">
                        <div className="section-header">
                            <Icons.Pricing />
                            <h3>Supplier & Pricing</h3>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">D. Note / RIV</label>
                                <input
                                    type="text"
                                    name="dNote"
                                    className="form-input"
                                    placeholder="DN-2026-001"
                                    value={formData.dNote}
                                    onChange={handleChange}
                                    onKeyPress={handleKeyPress}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Supplier</label>
                                <input
                                    type="text"
                                    name="supplier"
                                    className="form-input"
                                    placeholder="Supplier name"
                                    value={formData.supplier}
                                    onChange={handleChange}
                                    onKeyPress={handleKeyPress}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Remarks</label>
                                <input
                                    type="text"
                                    name="remarks"
                                    className="form-input"
                                    placeholder="Additional notes"
                                    value={formData.remarks}
                                    onChange={handleChange}
                                    onKeyPress={handleKeyPress}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Unit Cost (MK)</label>
                                <input
                                    type="number"
                                    name="unitCost"
                                    className="form-input"
                                    placeholder="0.00"
                                    value={formData.unitCost}
                                    onChange={handleChange}
                                    onKeyPress={handleKeyPress}
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Selling Price (MK)</label>
                                <input
                                    type="number"
                                    name="sellingPrice"
                                    className="form-input"
                                    placeholder="0.00"
                                    value={formData.sellingPrice}
                                    onChange={handleChange}
                                    onKeyPress={handleKeyPress}
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <div className="form-group"></div>
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="form-actions">
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <Icons.Add /> Add Product
                                </>
                            )}
                        </button>
                        <button type="button" className="btn-clear" onClick={clearForm}>
                            <Icons.Clear /> Clear All
                        </button>
                    </div>
                </form>

                <div className="app-footer">
                    <span>© 2026 MedOx Pharmacy. All rights reserved.</span>
                    <span>Powered by <span className="gold">NexusRX</span></span>
                </div>
            </div>
        </div>
    );
};

export default AddProduct;


