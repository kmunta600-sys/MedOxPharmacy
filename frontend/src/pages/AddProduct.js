import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import IntelligentDropdown from '../components/IntelligentDropdown';

const AddProduct = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [touched, setTouched] = useState({});
    
    const [categories, setCategories] = useState(['Analgesic', 'Antibiotic', 'Antihistamine', 'Antiviral', 'Cardiovascular', 'Diabetes', 'Digestive', 'Pain Relief', 'Respiratory', 'Skin Care', 'Vitamin', 'Other']);
    const [dosageForms, setDosageForms] = useState(['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Ointment', 'Drops', 'Inhaler']);
    const [suppliers, setSuppliers] = useState([]);
    const [supplierNames, setSupplierNames] = useState([]);
    
    const [formData, setFormData] = useState({
        name: '',
        strength: '',
        dosageForm: '',
        code: '',
        category: '',
        quantityOnHand: '',
        minStock: '',
        maxStock: '',
        sellingPrice: '',
        unitCost: '',
        expiryDate: '',
        batchNumber: '',
        dnoteNumber: '',
        supplier: '',
        remarks: ''
    });

    // Modern SVG Icons
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

    const BackIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
        </svg>
    );

    const RequiredIcon = () => (
        <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
            <circle cx="3" cy="3" r="3" fill="#EF4444"/>
        </svg>
    );

    const validate = (data) => {
        const errors = {};
        if (!data.name || data.name.trim() === '') errors.name = 'Product name is required';
        if (!data.strength || data.strength.trim() === '') errors.strength = 'Strength is required';
        if (!data.dosageForm || data.dosageForm.trim() === '') errors.dosageForm = 'Dosage form is required';
        if (!data.code || data.code.trim() === '') errors.code = 'Product code is required';
        if (!data.category || data.category.trim() === '') errors.category = 'Category is required';
        if (!data.quantityOnHand || data.quantityOnHand === '') errors.quantityOnHand = 'Quantity is required';
        if (parseFloat(data.quantityOnHand) < 0) errors.quantityOnHand = 'Quantity cannot be negative';
        if (!data.minStock || data.minStock === '') errors.minStock = 'Minimum stock is required';
        if (parseFloat(data.minStock) < 0) errors.minStock = 'Minimum stock cannot be negative';
        if (!data.maxStock || data.maxStock === '') errors.maxStock = 'Maximum stock is required';
        if (parseFloat(data.maxStock) < 0) errors.maxStock = 'Maximum stock cannot be negative';
        if (parseFloat(data.maxStock) < parseFloat(data.minStock)) errors.maxStock = 'Maximum stock must be greater than minimum';
        if (!data.sellingPrice || data.sellingPrice === '') errors.sellingPrice = 'Selling price is required';
        if (parseFloat(data.sellingPrice) < 0) errors.sellingPrice = 'Selling price cannot be negative';
        if (!data.unitCost || data.unitCost === '') errors.unitCost = 'Unit cost is required';
        if (parseFloat(data.unitCost) < 0) errors.unitCost = 'Unit cost cannot be negative';
        if (!data.expiryDate) errors.expiryDate = 'Expiry date is required';
        if (!data.batchNumber || data.batchNumber.trim() === '') errors.batchNumber = 'Batch number is required';
        if (!data.dnoteNumber || data.dnoteNumber.trim() === '') errors.dnoteNumber = 'D-Note number is required';
        if (!data.supplier || data.supplier.trim() === '') errors.supplier = 'Supplier is required';
        return errors;
    };

    const isFormValid = () => {
        const errors = validate(formData);
        return Object.keys(errors).length === 0;
    };

    useEffect(() => {
        loadSuppliers();
        generateProductCode();
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

    const generateProductCode = () => {
        const prefix = 'MED';
        const random = Math.floor(1000 + Math.random() * 9000);
        setFormData(prev => ({ ...prev, code: prefix + random }));
    };

    const handleAddSupplier = async (name) => {
        try {
            const res = await api.post('/stock/suppliers', { name });
            if (res.data.success) {
                setSuppliers([...suppliers, res.data.data]);
                setSupplierNames([...supplierNames, name]);
                setFormData(prev => ({ ...prev, supplier: name }));
                setSuccess('Supplier "' + name + '" added successfully!');
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            if (err.response?.data?.data) {
                setFormData(prev => ({ ...prev, supplier: name }));
                setError('Supplier "' + name + '" already exists. Using existing.');
                setTimeout(() => setError(''), 3000);
            }
        }
    };

    const handleDeleteSupplier = async (name) => {
        const supplier = suppliers.find(s => s.name === name);
        if (supplier) {
            try {
                await api.delete(`/stock/suppliers/${supplier._id}`);
                setSuppliers(suppliers.filter(s => s.name !== name));
                setSupplierNames(supplierNames.filter(n => n !== name));
                if (formData.supplier === name) {
                    setFormData(prev => ({ ...prev, supplier: '' }));
                }
                setSuccess('Supplier "' + name + '" deleted!');
                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                setError('Failed to delete supplier');
            }
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (error) setError('');
    };

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const errors = validate(formData);
        if (Object.keys(errors).length > 0) {
            const errorMessages = Object.values(errors);
            setError('Please fill in all required fields: ' + errorMessages.join(', '));
            setLoading(false);
            return;
        }

        if (formData.expiryDate) {
            const expiry = new Date(formData.expiryDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (expiry < today) {
                setError('Cannot add expired medicine. Please select a valid future date.');
                setLoading(false);
                return;
            }
        }

        // SMART DUPLICATE CHECK
        try {
            const checkRes = await api.get(`/products?search=${encodeURIComponent(formData.name)}`);
            if (checkRes.data.success) {
                const existingProduct = checkRes.data.data.find(p => 
                    p.name.toLowerCase() === formData.name.toLowerCase() &&
                    p.strength === formData.strength &&
                    p.dosageForm === formData.dosageForm
                );
                if (existingProduct) {
                    setError('Product already exists! "' + formData.name + '" (' + formData.strength + ') - ' + formData.dosageForm + ' already in system.');
                    setLoading(false);
                    return;
                }
                
                const existingBatch = checkRes.data.data.find(p => 
                    p.batchNumber && p.batchNumber.toLowerCase() === formData.batchNumber.toLowerCase()
                );
                if (existingBatch) {
                    setError('Batch number "' + formData.batchNumber + '" already exists for product "' + existingBatch.name + '". Please use a unique batch number.');
                    setLoading(false);
                    return;
                }
            }
        } catch (err) {
            console.log('Product check failed, continuing...');
        }

        try {
            const response = await api.post('/products', {
                ...formData,
                quantityOnHand: parseFloat(formData.quantityOnHand),
                minStock: parseFloat(formData.minStock),
                maxStock: parseFloat(formData.maxStock),
                sellingPrice: parseFloat(formData.sellingPrice),
                unitCost: parseFloat(formData.unitCost)
            });
            if (response.data.success) {
                setSuccess('"' + formData.name + '" added successfully!');
                setFormData({
                    name: '',
                    strength: '',
                    dosageForm: '',
                    code: '',
                    category: '',
                    quantityOnHand: '',
                    minStock: '',
                    maxStock: '',
                    sellingPrice: '',
                    unitCost: '',
                    expiryDate: '',
                    batchNumber: '',
                    dnoteNumber: '',
                    supplier: '',
                    remarks: ''
                });
                setTouched({});
                generateProductCode();
                setTimeout(() => setSuccess(''), 4000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add product');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = (field) => ({
        width: '100%',
        padding: '8px 12px',
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${touched[field] && !formData[field] ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: '6px',
        color: '#FFFFFF',
        fontSize: '13px',
        outline: 'none',
        fontFamily: 'inherit',
        transition: 'all 0.2s'
    });

    const labelStyle = (field) => ({
        fontSize: '12px',
        fontWeight: '600',
        color: touched[field] && !formData[field] ? '#EF4444' : 'rgba(255,255,255,0.3)',
        display: 'block',
        marginBottom: '3px'
    });

    return (
        <div className="dashboard-container">
            <div className="dashboard-main" style={{ marginLeft: '0', padding: '24px 32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#FFFFFF', margin: '0' }}>Add Product</h1>
                        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px', margin: '2px 0 0' }}>All fields are required</p>
                    </div>
                    <button onClick={() => navigate('/dashboard')} style={{
                        display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px',
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '6px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
                        fontSize: '12px', fontFamily: 'inherit', transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}>
                        <BackIcon /> Back
                    </button>
                </div>

                {error && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        background: 'rgba(239,68,68,0.06)',
                        border: '1px solid rgba(239,68,68,0.12)',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        marginBottom: '16px'
                    }}>
                        <span style={{ color: '#EF4444', marginTop: '1px', flexShrink: 0 }}><ErrorIcon /></span>
                        <div>
                            <div style={{ color: '#EF4444', fontSize: '13px', fontWeight: '500' }}>Error</div>
                            <div style={{ color: 'rgba(239,68,68,0.7)', fontSize: '13px' }}>{error}</div>
                        </div>
                    </div>
                )}
                {success && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        background: 'rgba(16,185,129,0.06)',
                        border: '1px solid rgba(16,185,129,0.12)',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        marginBottom: '16px'
                    }}>
                        <span style={{ color: '#10B981', marginTop: '1px', flexShrink: 0 }}><SuccessIcon /></span>
                        <div>
                            <div style={{ color: '#10B981', fontSize: '13px', fontWeight: '500' }}>Success</div>
                            <div style={{ color: 'rgba(16,185,129,0.7)', fontSize: '13px' }}>{success}</div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px', padding: '20px 24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px', marginBottom: '12px' }}>
                        <div>
                            <label style={labelStyle('name')}>Product Name <span style={{ color: '#EF4444' }}>*</span></label>
                            <input type="text" name="name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} onBlur={() => handleBlur('name')} placeholder="Enter product name" required style={inputStyle('name')} />
                            {touched.name && !formData.name && <div style={{ fontSize: '10px', color: '#EF4444', marginTop: '2px' }}>Required</div>}
                        </div>
                        <div>
                            <label style={labelStyle('code')}>Product Code <span style={{ color: '#EF4444' }}>*</span></label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input type="text" name="code" value={formData.code} onChange={(e) => handleChange('code', e.target.value)} onBlur={() => handleBlur('code')} placeholder="Auto" style={{ ...inputStyle('code'), flex: 1 }} />
                                <button type="button" onClick={generateProductCode} style={{ padding: '8px 14px', background: 'rgba(214,158,46,0.08)', border: '1px solid rgba(214,158,46,0.1)', borderRadius: '6px', color: '#D69E2E', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>Generate</button>
                            </div>
                            {touched.code && !formData.code && <div style={{ fontSize: '10px', color: '#EF4444', marginTop: '2px' }}>Required</div>}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '12px' }}>
                        <div>
                            <label style={labelStyle('strength')}>Strength <span style={{ color: '#EF4444' }}>*</span></label>
                            <input type="text" name="strength" value={formData.strength} onChange={(e) => handleChange('strength', e.target.value)} onBlur={() => handleBlur('strength')} placeholder="e.g. 500mg" style={inputStyle('strength')} />
                            {touched.strength && !formData.strength && <div style={{ fontSize: '10px', color: '#EF4444', marginTop: '2px' }}>Required</div>}
                        </div>
                        <div>
                            <label style={labelStyle('dnoteNumber')}>D-Note Number <span style={{ color: '#EF4444' }}>*</span></label>
                            <input type="text" name="dnoteNumber" value={formData.dnoteNumber} onChange={(e) => handleChange('dnoteNumber', e.target.value)} onBlur={() => handleBlur('dnoteNumber')} placeholder="e.g. DN-2024-001" style={inputStyle('dnoteNumber')} />
                            {touched.dnoteNumber && !formData.dnoteNumber && <div style={{ fontSize: '10px', color: '#EF4444', marginTop: '2px' }}>Required</div>}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '12px' }}>
                        <div>
                            <IntelligentDropdown
                                label="Dosage Form *"
                                options={dosageForms}
                                value={formData.dosageForm}
                                onChange={(val) => { handleChange('dosageForm', val); handleBlur('dosageForm'); }}
                                placeholder="Select dosage form..."
                                allowNew={true}
                                onAddNew={(newVal) => setDosageForms([...dosageForms, newVal])}
                                allowDelete={true}
                                onDelete={(val) => setDosageForms(dosageForms.filter(d => d !== val))}
                                required={true}
                            />
                            {touched.dosageForm && !formData.dosageForm && <div style={{ fontSize: '10px', color: '#EF4444', marginTop: '2px' }}>Required</div>}
                        </div>
                        <div>
                            <IntelligentDropdown
                                label="Category *"
                                options={categories}
                                value={formData.category}
                                onChange={(val) => { handleChange('category', val); handleBlur('category'); }}
                                placeholder="Select category..."
                                allowNew={true}
                                onAddNew={(newVal) => setCategories([...categories, newVal])}
                                allowDelete={true}
                                onDelete={(val) => setCategories(categories.filter(c => c !== val))}
                                required={true}
                            />
                            {touched.category && !formData.category && <div style={{ fontSize: '10px', color: '#EF4444', marginTop: '2px' }}>Required</div>}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '12px' }}>
                        <div>
                            <label style={labelStyle('quantityOnHand')}>Quantity <span style={{ color: '#EF4444' }}>*</span></label>
                            <input type="number" name="quantityOnHand" value={formData.quantityOnHand} onChange={(e) => handleChange('quantityOnHand', e.target.value)} onBlur={() => handleBlur('quantityOnHand')} min="0" placeholder="0" style={inputStyle('quantityOnHand')} />
                            {touched.quantityOnHand && !formData.quantityOnHand && <div style={{ fontSize: '10px', color: '#EF4444', marginTop: '2px' }}>Required</div>}
                        </div>
                        <div>
                            <label style={labelStyle('sellingPrice')}>Selling Price (MK) <span style={{ color: '#EF4444' }}>*</span></label>
                            <input type="number" name="sellingPrice" value={formData.sellingPrice} onChange={(e) => handleChange('sellingPrice', e.target.value)} onBlur={() => handleBlur('sellingPrice')} min="0" step="0.01" placeholder="0.00" style={inputStyle('sellingPrice')} />
                            {touched.sellingPrice && !formData.sellingPrice && <div style={{ fontSize: '10px', color: '#EF4444', marginTop: '2px' }}>Required</div>}
                        </div>
                        <div>
                            <label style={labelStyle('unitCost')}>Unit Cost (MK) <span style={{ color: '#EF4444' }}>*</span></label>
                            <input type="number" name="unitCost" value={formData.unitCost} onChange={(e) => handleChange('unitCost', e.target.value)} onBlur={() => handleBlur('unitCost')} min="0" step="0.01" placeholder="0.00" style={inputStyle('unitCost')} />
                            {touched.unitCost && !formData.unitCost && <div style={{ fontSize: '10px', color: '#EF4444', marginTop: '2px' }}>Required</div>}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '12px' }}>
                        <div>
                            <label style={labelStyle('batchNumber')}>Batch Number <span style={{ color: '#EF4444' }}>*</span></label>
                            <input type="text" name="batchNumber" value={formData.batchNumber} onChange={(e) => handleChange('batchNumber', e.target.value)} onBlur={() => handleBlur('batchNumber')} placeholder="Enter batch number" style={inputStyle('batchNumber')} />
                            {touched.batchNumber && !formData.batchNumber && <div style={{ fontSize: '10px', color: '#EF4444', marginTop: '2px' }}>Required</div>}
                        </div>
                        <div>
                            <IntelligentDropdown
                                label="Supplier *"
                                options={supplierNames}
                                value={formData.supplier}
                                onChange={(val) => { handleChange('supplier', val); handleBlur('supplier'); }}
                                placeholder="Type or select supplier..."
                                allowNew={true}
                                onAddNew={handleAddSupplier}
                                allowDelete={true}
                                onDelete={handleDeleteSupplier}
                                required={true}
                            />
                            {touched.supplier && !formData.supplier && <div style={{ fontSize: '10px', color: '#EF4444', marginTop: '2px' }}>Required</div>}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '12px' }}>
                        <div>
                            <label style={labelStyle('expiryDate')}>Expiry Date <span style={{ color: '#EF4444' }}>*</span></label>
                            <input type="date" name="expiryDate" value={formData.expiryDate} onChange={(e) => handleChange('expiryDate', e.target.value)} onBlur={() => handleBlur('expiryDate')} style={inputStyle('expiryDate')} />
                            {touched.expiryDate && !formData.expiryDate && <div style={{ fontSize: '10px', color: '#EF4444', marginTop: '2px' }}>Required</div>}
                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.1)', marginTop: '2px' }}>Expired products will be blocked</div>
                        </div>
                        <div>
                            <label style={labelStyle('minStock')}>Min Stock <span style={{ color: '#EF4444' }}>*</span></label>
                            <input type="number" name="minStock" value={formData.minStock} onChange={(e) => handleChange('minStock', e.target.value)} onBlur={() => handleBlur('minStock')} min="0" placeholder="50" style={inputStyle('minStock')} />
                            {touched.minStock && !formData.minStock && <div style={{ fontSize: '10px', color: '#EF4444', marginTop: '2px' }}>Required</div>}
                        </div>
                        <div>
                            <label style={labelStyle('maxStock')}>Max Stock <span style={{ color: '#EF4444' }}>*</span></label>
                            <input type="number" name="maxStock" value={formData.maxStock} onChange={(e) => handleChange('maxStock', e.target.value)} onBlur={() => handleBlur('maxStock')} min="0" placeholder="500" style={inputStyle('maxStock')} />
                            {touched.maxStock && !formData.maxStock && <div style={{ fontSize: '10px', color: '#EF4444', marginTop: '2px' }}>Required</div>}
                        </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={labelStyle('remarks')}>Remarks <span style={{ color: '#EF4444' }}>*</span></label>
                        <input type="text" name="remarks" value={formData.remarks} onChange={(e) => handleChange('remarks', e.target.value)} onBlur={() => handleBlur('remarks')} placeholder="Additional notes..." style={inputStyle('remarks')} />
                        {touched.remarks && !formData.remarks && <div style={{ fontSize: '10px', color: '#EF4444', marginTop: '2px' }}>Required</div>}
                    </div>

                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '16px',
                        padding: '8px 12px',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.04)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <RequiredIcon />
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>
                                All fields marked with <span style={{ color: '#EF4444' }}>*</span> are required
                            </span>
                        </div>
                        <div style={{ fontSize: '11px', color: isFormValid() ? '#10B981' : 'rgba(255,255,255,0.1)' }}>
                            {isFormValid() ? 'All fields filled' : Object.keys(validate(formData)).length + ' fields remaining'}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '16px' }}>
                        <button type="button" onClick={() => { setFormData({ name: '', strength: '', dosageForm: '', code: '', category: '', quantityOnHand: '', minStock: '', maxStock: '', sellingPrice: '', unitCost: '', expiryDate: '', batchNumber: '', dnoteNumber: '', supplier: '', remarks: '' }); generateProductCode(); setError(''); setSuccess(''); setTouched({}); }} style={{ padding: '8px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>Clear</button>
                        <button type="submit" disabled={loading || !isFormValid()} style={{ padding: '8px 28px', background: loading || !isFormValid() ? 'rgba(214,158,46,0.2)' : 'linear-gradient(135deg, #D69E2E, #B8860B)', border: 'none', borderRadius: '6px', color: loading || !isFormValid() ? 'rgba(255,255,255,0.3)' : '#FFFFFF', fontSize: '13px', fontWeight: '600', cursor: loading || !isFormValid() ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', opacity: loading || !isFormValid() ? '0.6' : '1' }}
                        onMouseEnter={e => { if (!loading && isFormValid()) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(214,158,46,0.2)'; } }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                            {loading ? 'Adding...' : 'Add Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;
