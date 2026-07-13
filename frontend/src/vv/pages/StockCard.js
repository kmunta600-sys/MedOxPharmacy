import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/styles.css';
import api from '../services/api';

const Icons = {
    Back: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
        </svg>
    ),
    Print: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"/>
            <path d="M18 9H6"/>
            <path d="M18 13H6"/>
            <rect x="2" y="9" width="20" height="10" rx="2"/>
            <line x1="6" y1="17" x2="6" y2="19"/>
            <line x1="18" y1="17" x2="18" y2="19"/>
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

const StockCard = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const printRef = useRef();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [physicalInventory, setPhysicalInventory] = useState(null);
    const [user, setUser] = useState(null);
    const [facilityName, setFacilityName] = useState('MedOx Pharmacy');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            setUser(userData);
        } catch (e) {
            console.error('Error parsing user:', e);
        }

        if (id) {
            fetchProductDetails(id);
        }
    }, [id]);

    const fetchProductDetails = async (productId) => {
        try {
            setLoading(true);
            console.log('📊 Fetching product details for ID:', productId);
            
            const response = await api.get(`/api/products/${productId}`);
            if (response.data && response.data.success) {
                const productData = response.data.data;
                setProduct(productData);
                console.log('✅ Product loaded:', productData.name);
                
                await loadTransactions(productData);
            }
        } catch (error) {
            console.error('❌ Error fetching product:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const loadTransactions = async (product) => {
        console.log('📊 Loading transactions for product:', product._id);
        console.log('📦 Current quantity:', product.quantityOnHand);
        
        let allTransactions = [];
        let balance = product.quantityOnHand || 0;
        
        // Add initial stock
        allTransactions.push({
            date: new Date(product.createdAt || Date.now()).toISOString().split('T')[0],
            docNumber: 'INIT-001',
            issuedTo: 'Initial Stock',
            batchNumber: 'INITIAL',
            expiryDate: '2025-12-31',
            quantityReceived: balance,
            quantityIssued: 0,
            losses: 0,
            positiveAdjustment: 0,
            negativeAdjustment: 0,
            quantityOnHand: balance,
            remarks: `Initial stock: ${balance} units`,
            officer: 'System',
            type: 'initial'
        });
        
        try {
            const response = await api.get(`/api/products/${product._id}/transactions`);
            
            if (response.data && response.data.success) {
                const realTransactions = response.data.data || [];
                console.log('✅ Found', realTransactions.length, 'transactions');
                
                realTransactions.forEach(t => {
                    let received = 0, issued = 0, losses = 0, posAdj = 0, negAdj = 0;
                    
                    // Process based on type
                    if (t.type === 'receipt') {
                        received = t.quantity || 0;
                        balance += received;
                    } else if (t.type === 'dispense') {
                        issued = t.quantity || 0;
                        balance -= issued;
                    } else if (t.type === 'loss') {
                        losses = t.quantity || 0;
                        balance -= losses;
                    } else if (t.type === 'adjustment') {
                        // Check remarks to determine if it's positive or negative
                        const remarks = t.remarks || '';
                        if (remarks.includes('Negative Adjustment')) {
                            negAdj = t.quantity || 0;
                            balance -= negAdj;
                        } else if (remarks.includes('Positive Adjustment')) {
                            posAdj = t.quantity || 0;
                            balance += posAdj;
                        } else if (t.quantity > 0) {
                            posAdj = t.quantity;
                            balance += posAdj;
                        } else {
                            negAdj = Math.abs(t.quantity);
                            balance -= negAdj;
                        }
                    }
                    
                    allTransactions.push({
                        date: t.date ? new Date(t.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                        docNumber: t.docNumber || 'N/A',
                        issuedTo: t.issuedTo || 'Pharmacy',
                        batchNumber: t.batchNumber || 'N/A',
                        expiryDate: t.expiryDate || 'N/A',
                        quantityReceived: received,
                        quantityIssued: issued,
                        losses: losses,
                        positiveAdjustment: posAdj,
                        negativeAdjustment: negAdj,
                        quantityOnHand: balance,
                        remarks: t.remarks || 'Stock update',
                        officer: t.officer || 'System',
                        type: t.type || 'adjustment'
                    });
                });
            }
        } catch (error) {
            console.error('❌ Error fetching transactions:', error);
        }
        
        // Sort by date
        allTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        console.log('✅ Final transactions:', allTransactions.length);
        setTransactions(allTransactions);
    };

    const handlePrint = () => {
        const printContent = printRef.current;
        const win = window.open('', '_blank');
        win.document.write(`
            <html>
                <head>
                    <title>Stock Card - ${product?.name || 'Product'}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
                        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                        .header h1 { margin: 0; font-size: 24px; }
                        .header p { margin: 5px 0; color: #666; }
                        .product-info { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; padding: 15px; background: #f9f9f9; border-radius: 5px; }
                        .product-info-item { display: flex; flex-direction: column; }
                        .product-info-item label { font-weight: bold; font-size: 12px; color: #666; }
                        .product-info-item span { font-size: 14px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
                        th { background: #f0f0f0; padding: 8px; text-align: left; border: 1px solid #ddd; }
                        td { padding: 6px 8px; border: 1px solid #ddd; }
                        .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #333; display: flex; justify-content: space-between; }
                        .signature { margin-top: 20px; }
                        .signature-line { display: inline-block; width: 200px; border-bottom: 1px solid #333; margin-left: 10px; }
                        @media print { body { margin: 20px; } }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                    <script>window.onload = function() { window.print(); }</script>
                </body>
            </html>
        `);
        win.document.close();
    };

    const handleBack = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const returnTo = urlParams.get('returnTo');
        if (returnTo) {
            navigate(returnTo);
        } else {
            navigate('/stock');
        }
    };

    if (loading) {
        return (
            <div className="stock-card-wrapper">
                <div className="stock-card-loading">Loading stock card...</div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="stock-card-wrapper">
                <div className="stock-card-empty">
                    <Icons.Empty />
                    <p>Product not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="stock-card-wrapper">
            <header className="stock-card-header">
                <div className="stock-card-header-left">
                    <Icons.Pharmacy />
                    <span className="stock-card-brand">MedOx <span className="gold">Pharmacy</span></span>
                    <span className="stock-card-badge">Stock Card</span>
                </div>
                <div className="stock-card-header-right">
                    <button className="stock-card-btn-print" onClick={handlePrint}>
                        <Icons.Print /> Print
                    </button>
                    <button className="stock-card-btn-back" onClick={handleBack}>
                        <Icons.Back /> Back
                    </button>
                </div>
            </header>

            <div className="stock-card-content" ref={printRef}>
                <div className="stock-card-container">
                    <div className="stock-card-header-print">
                        <h1>STOCK CARD</h1>
                        <p>Pharmacy Stock Management System</p>
                    </div>

                    <div className="stock-card-facility">
                        <div className="facility-info">
                            <label>Facility Name:</label>
                            <span>{facilityName}</span>
                        </div>
                        <div className="facility-info">
                            <label>Date:</label>
                            <span>{new Date().toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="stock-card-product">
                        <div className="product-grid">
                            <div className="product-item">
                                <label>Product Name & Strength</label>
                                <span>{product.name} {product.strength || ''}</span>
                            </div>
                            <div className="product-item">
                                <label>Product Code</label>
                                <span>{product.code || 'N/A'}</span>
                            </div>
                            <div className="product-item">
                                <label>Dosage Form</label>
                                <span>{product.dosageForm || 'N/A'}</span>
                            </div>
                            <div className="product-item">
                                <label>Unit of Issue</label>
                                <span>{product.unitOfIssue || 'Unit'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="stock-card-table-wrapper">
                        <table className="stock-card-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>D.Note/RIV #</th>
                                    <th>Issued To / Received From</th>
                                    <th>Received</th>
                                    <th>Issued</th>
                                    <th>Losses</th>
                                    <th>Pos Adj</th>
                                    <th>Neg Adj</th>
                                    <th>Qty on Hand</th>
                                    <th>Remarks</th>
                                    <th>Officer</th>
                                    <th>Signature</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="12" className="stock-card-empty-row">No transactions found</td>
                                    </tr>
                                ) : (
                                    transactions.map((t, index) => (
                                        <tr key={index}>
                                            <td>{t.date}</td>
                                            <td>{t.docNumber}</td>
                                            <td>{t.issuedTo}</td>
                                            <td style={{ color: t.quantityReceived > 0 ? '#10B981' : 'inherit', fontWeight: t.quantityReceived > 0 ? 'bold' : 'normal' }}>
                                                {t.quantityReceived > 0 ? t.quantityReceived : '-'}
                                            </td>
                                            <td style={{ color: t.quantityIssued > 0 ? '#EF4444' : 'inherit', fontWeight: t.quantityIssued > 0 ? 'bold' : 'normal' }}>
                                                {t.quantityIssued > 0 ? t.quantityIssued : '-'}
                                            </td>
                                            <td style={{ color: t.losses > 0 ? '#EF4444' : 'inherit', fontWeight: t.losses > 0 ? 'bold' : 'normal' }}>
                                                {t.losses > 0 ? t.losses : '-'}
                                            </td>
                                            <td style={{ color: t.positiveAdjustment > 0 ? '#10B981' : 'inherit', fontWeight: t.positiveAdjustment > 0 ? 'bold' : 'normal' }}>
                                                {t.positiveAdjustment > 0 ? t.positiveAdjustment : '-'}
                                            </td>
                                            <td style={{ color: t.negativeAdjustment > 0 ? '#EF4444' : 'inherit', fontWeight: t.negativeAdjustment > 0 ? 'bold' : 'normal' }}>
                                                {t.negativeAdjustment > 0 ? t.negativeAdjustment : '-'}
                                            </td>
                                            <td><strong>{t.quantityOnHand}</strong></td>
                                            <td>{t.remarks}</td>
                                            <td>{t.officer}</td>
                                            <td>________________________</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockCard;


