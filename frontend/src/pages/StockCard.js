import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import './Dashboard.css';

const StockCard = () => {
    const navigate = useNavigate();
    const { productId } = useParams();
    
    // State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [product, setProduct] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [showSpotCheckModal, setShowSpotCheckModal] = useState(false);
    const [showPhysicalInventoryModal, setShowPhysicalInventoryModal] = useState(false);
    const [physicalCount, setPhysicalCount] = useState('');
    const [spotCheckRemarks, setSpotCheckRemarks] = useState('');
    const [facilityName, setFacilityName] = useState('MedOx Pharmacy');
    const [monthEndWarning, setMonthEndWarning] = useState(false);
    const [daysUntilMonthEnd, setDaysUntilMonthEnd] = useState(0);
    const [showMonthEndReminder, setShowMonthEndReminder] = useState(true);
    
    const [focusedCell, setFocusedCell] = useState({ row: -1, col: -1 });
    const tableRef = useRef(null);
    const searchRef = useRef(null);
    const searchTimeout = useRef(null);

    // Check if month end is approaching
    useEffect(() => {
        const checkMonthEnd = () => {
            const today = new Date();
            const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            const daysLeft = Math.ceil((lastDayOfMonth - today) / (1000 * 60 * 60 * 24));
            setDaysUntilMonthEnd(daysLeft);
            
            if (daysLeft <= 3 && daysLeft >= 0 && showMonthEndReminder) {
                setMonthEndWarning(true);
            } else {
                setMonthEndWarning(false);
            }
        };
        
        checkMonthEnd();
        const interval = setInterval(checkMonthEnd, 86400000);
        return () => clearInterval(interval);
    }, [showMonthEndReminder]);

    // Keyboard navigation for table cells
    useEffect(() => {
        const highlightCell = (row, colIndex) => {
            document.querySelectorAll('.cell-highlight').forEach(el => {
                el.classList.remove('cell-highlight');
                el.style.background = '';
                el.style.outline = '';
                el.style.boxShadow = '';
                el.style.borderRadius = '';
            });
            
            const cells = row.querySelectorAll('td');
            if (cells[colIndex]) {
                cells[colIndex].classList.add('cell-highlight');
                cells[colIndex].style.background = 'rgba(214,158,46,0.2)';
                cells[colIndex].style.outline = '2px solid #D69E2E';
                cells[colIndex].style.outlineOffset = '-1px';
                cells[colIndex].style.borderRadius = '4px';
                cells[colIndex].style.boxShadow = '0 0 20px rgba(214,158,46,0.15)';
                cells[colIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        };

        const handleTableKeyDown = (e) => {
            if (!tableRef.current || transactions.length === 0) return;
            
            const rows = tableRef.current.querySelectorAll('tbody tr');
            if (rows.length === 0) return;
            
            let { row, col } = focusedCell;
            const cols = 14;
            
            if (row === -1 && col === -1) {
                setFocusedCell({ row: 0, col: 0 });
                setTimeout(() => {
                    const newRows = tableRef.current?.querySelectorAll('tbody tr');
                    if (newRows && newRows[0]) {
                        highlightCell(newRows[0], 0);
                    }
                }, 50);
                return;
            }
            
            let newRow = row;
            let newCol = col;
            let moved = false;
            
            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    if (row < rows.length - 1) {
                        newRow = row + 1;
                        moved = true;
                    }
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    if (row > 0) {
                        newRow = row - 1;
                        moved = true;
                    }
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    if (col < cols - 1) {
                        newCol = col + 1;
                        moved = true;
                    }
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    if (col > 0) {
                        newCol = col - 1;
                        moved = true;
                    }
                    break;
                case 'Home':
                    e.preventDefault();
                    newCol = 0;
                    moved = true;
                    break;
                case 'End':
                    e.preventDefault();
                    newCol = cols - 1;
                    moved = true;
                    break;
                case 'PageDown':
                    e.preventDefault();
                    if (row + 5 < rows.length) {
                        newRow = row + 5;
                        moved = true;
                    }
                    break;
                case 'PageUp':
                    e.preventDefault();
                    if (row - 5 >= 0) {
                        newRow = row - 5;
                        moved = true;
                    }
                    break;
            }
            
            if (moved) {
                setFocusedCell({ row: newRow, col: newCol });
                const newRows = tableRef.current?.querySelectorAll('tbody tr');
                if (newRows && newRows[newRow]) {
                    highlightCell(newRows[newRow], newCol);
                }
            }
        };
        
        const handleClickOutside = (e) => {
            if (!e.target.closest('table')) {
                document.querySelectorAll('.cell-highlight').forEach(el => {
                    el.classList.remove('cell-highlight');
                    el.style.background = '';
                    el.style.outline = '';
                    el.style.boxShadow = '';
                    el.style.borderRadius = '';
                });
                setFocusedCell({ row: -1, col: -1 });
            }
        };

        const handleCellClick = (e) => {
            const cell = e.target.closest('td');
            if (cell) {
                const row = cell.closest('tr');
                const rowIndex = Array.from(row.parentNode.children).indexOf(row);
                const colIndex = Array.from(row.children).indexOf(cell);
                setFocusedCell({ row: rowIndex, col: colIndex });
                highlightCell(row, colIndex);
            }
        };
        
        if (product && transactions.length > 0) {
            document.addEventListener('keydown', handleTableKeyDown);
            document.addEventListener('click', handleClickOutside);
            
            const table = tableRef.current;
            if (table) {
                table.addEventListener('click', handleCellClick);
            }
            
            return () => {
                document.removeEventListener('keydown', handleTableKeyDown);
                document.removeEventListener('click', handleClickOutside);
                if (table) {
                    table.removeEventListener('click', handleCellClick);
                }
            };
        }
    }, [transactions, product, focusedCell]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === '1') {
                e.preventDefault();
                navigate('/dashboard');
            }
            if (e.ctrlKey && e.key === '2') {
                e.preventDefault();
                navigate('/search');
            }
            if (e.ctrlKey && e.key === 'p') {
                if (product) {
                    e.preventDefault();
                    handlePrint();
                }
            }
            if (e.key === 'Escape') {
                if (showSpotCheckModal) {
                    setShowSpotCheckModal(false);
                    setPhysicalCount('');
                    setSpotCheckRemarks('');
                }
                if (showPhysicalInventoryModal) {
                    setShowPhysicalInventoryModal(false);
                    setPhysicalCount('');
                    setSpotCheckRemarks('');
                }
            }
            if (e.key === 'Enter') {
                if (showSpotCheckModal && physicalCount) {
                    const form = document.getElementById('spot-check-form');
                    if (form) {
                        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                    }
                }
                if (showPhysicalInventoryModal && physicalCount) {
                    const form = document.getElementById('physical-inventory-form');
                    if (form) {
                        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                    }
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [navigate, product, showSpotCheckModal, showPhysicalInventoryModal, physicalCount]);

    useEffect(() => {
        if (productId) {
            loadStockCard(productId);
        } else {
            setTimeout(() => searchRef.current?.focus(), 100);
        }
    }, [productId]);

    const loadStockCard = async (id) => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get(`/stockcard/${id}`);
            if (response.data.success) {
                setProduct(response.data.data.product);
                setTransactions(response.data.data.transactions);
            } else {
                setError('Failed to load stock card');
            }
        } catch (err) {
            console.error('Error loading stock card:', err);
            setError('Error loading stock card');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        
        if (term.length < 2) {
            setSearchResults([]);
            setShowSearchDropdown(false);
            return;
        }
        
        searchTimeout.current = setTimeout(async () => {
            try {
                const response = await api.get(`/products?search=${encodeURIComponent(term)}`);
                if (response.data.success) {
                    setSearchResults(response.data.data);
                    setShowSearchDropdown(response.data.data.length > 0);
                }
            } catch (err) {
                console.error('Search error:', err);
            }
        }, 300);
    };

    const selectProduct = (product) => {
        setSearchTerm(product.name);
        setShowSearchDropdown(false);
        navigate(`/stock-card/${product._id}`);
        loadStockCard(product._id);
    };

    const handleSpotCheck = async (e) => {
        e.preventDefault();
        if (!physicalCount) {
            setError('Please enter physical count');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            const response = await api.post('/stockcard/spot-check', {
                productId: productId,
                physicalCount: parseInt(physicalCount),
                remarks: spotCheckRemarks
            });
            
            if (response.data.success) {
                setSuccess(`Spot check completed! Variance: ${response.data.data.variance}`);
                setShowSpotCheckModal(false);
                setPhysicalCount('');
                setSpotCheckRemarks('');
                loadStockCard(productId);
                setTimeout(() => setSuccess(''), 5000);
            } else {
                setError(response.data.message || 'Failed to perform spot check');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error performing spot check');
        } finally {
            setLoading(false);
        }
    };

    const handlePhysicalInventory = async (e) => {
        e.preventDefault();
        if (!physicalCount) {
            setError('Please enter physical count');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            const response = await api.post('/stockcard/physical-inventory', {
                productId: productId,
                physicalCount: parseInt(physicalCount),
                remarks: spotCheckRemarks
            });
            
            if (response.data.success) {
                setSuccess(`Physical inventory recorded! Variance: ${response.data.data.variance}`);
                setShowPhysicalInventoryModal(false);
                setPhysicalCount('');
                setSpotCheckRemarks('');
                setShowMonthEndReminder(false);
                loadStockCard(productId);
                setTimeout(() => setSuccess(''), 5000);
            } else {
                setError(response.data.message || 'Failed to record physical inventory');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error recording physical inventory');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        });
    };

    // SVG Icons
    const BackIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
        </svg>
    );

    const SearchIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
    );

    const PrintIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"/>
            <path d="M18 9H6"/>
            <path d="M18 13H6"/>
            <path d="M6 13v8h12v-8"/>
        </svg>
    );

    const SpotCheckIcon = () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4"/>
            <path d="M12 16h.01"/>
        </svg>
    );

    const PhysicalInventoryIcon = () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
    );

    const StockCardIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="18" rx="2" ry="2"/>
            <line x1="2" y1="9" x2="22" y2="9"/>
            <line x1="2" y1="15" x2="22" y2="15"/>
            <line x1="8" y1="3" x2="8" y2="21"/>
            <line x1="16" y1="3" x2="16" y2="21"/>
        </svg>
    );

    const CloseIcon = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
    );

    const handleBack = () => {
        navigate('/dashboard');
    };

    // Professional Print Function - No Govt Headers, No Signatures
    const handlePrint = () => {
        const printWindow = window.open('', '_blank', 'width=1100,height=800');
        
        const printContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Stock Card - ${product?.name || 'Product'}</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body {
                            font-family: 'Segoe UI', Arial, sans-serif;
                            padding: 40px;
                            background: #ffffff;
                            color: #1a1a2e;
                            font-size: 11px;
                            line-height: 1.4;
                        }
                        .print-container {
                            max-width: 1100px;
                            margin: 0 auto;
                            padding: 20px;
                            border: 1px solid #ccc;
                            background: #fff;
                        }
                        
                        .header {
                            text-align: center;
                            margin-bottom: 20px;
                            padding-bottom: 15px;
                            border-bottom: 3px double #1a1a2e;
                        }
                        .header .title {
                            font-size: 22px;
                            font-weight: 700;
                            color: #1a1a2e;
                            letter-spacing: 4px;
                            text-transform: uppercase;
                        }
                        .header .facility {
                            font-size: 14px;
                            font-weight: 600;
                            color: #555;
                            margin-top: 6px;
                            letter-spacing: 1px;
                            text-transform: uppercase;
                        }
                        .header .subtitle {
                            font-size: 10px;
                            color: #888;
                            margin-top: 4px;
                            letter-spacing: 2px;
                        }
                        
                        .product-grid {
                            display: grid;
                            grid-template-columns: repeat(6, 1fr);
                            gap: 6px 12px;
                            margin-bottom: 15px;
                            padding: 10px 14px;
                            background: #f8f9fa;
                            border: 1px solid #dee2e6;
                            border-radius: 4px;
                        }
                        .product-grid .item .label {
                            font-size: 8px;
                            color: #6c757d;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                            font-weight: 600;
                        }
                        .product-grid .item .value {
                            font-size: 12px;
                            font-weight: 600;
                            color: #1a1a2e;
                            margin-top: 2px;
                        }
                        .product-grid .item .value.stock {
                            color: #10B981;
                            font-size: 16px;
                        }
                        
                        .table-wrapper {
                            border: 1px solid #dee2e6;
                            border-radius: 4px;
                            overflow: hidden;
                            margin-bottom: 15px;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            font-size: 9.5px;
                        }
                        thead {
                            background: #1a1a2e;
                        }
                        thead th {
                            padding: 7px 5px;
                            text-align: left;
                            color: #ffffff;
                            font-weight: 600;
                            font-size: 8.5px;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                            border-right: 1px solid rgba(255,255,255,0.1);
                        }
                        thead th:last-child { border-right: none; }
                        thead th.right { text-align: right; }
                        thead th.center { text-align: center; }
                        
                        tbody td {
                            padding: 5px;
                            border-bottom: 1px solid #f0f0f0;
                            color: #333;
                            font-size: 9px;
                            border-right: 1px solid #f0f0f0;
                        }
                        tbody td:last-child { border-right: none; }
                        tbody td.right { text-align: right; }
                        tbody td.center { text-align: center; }
                        tbody tr:last-child td { border-bottom: none; }
                        
                        .spot-check td { background: #fffbeb !important; }
                        .spot-check td { color: #92400e !important; }
                        .physical-inventory td { background: #fef2f2 !important; }
                        .physical-inventory td { color: #991b1b !important; font-weight: 600; }
                        
                        .month-end-badge {
                            font-size: 7px;
                            color: #991b1b;
                            font-weight: 700;
                            display: block;
                            margin-top: 1px;
                        }
                        .spot-badge {
                            font-size: 7px;
                            color: #92400e;
                            font-weight: 700;
                            display: block;
                            margin-top: 1px;
                        }
                        
                        .text-success { color: #10B981; font-weight: 600; }
                        .text-danger { color: #dc2626; font-weight: 600; }
                        .text-warning { color: #f59e0b; font-weight: 600; }
                        .text-muted { color: #6c757d; }
                        .font-bold { font-weight: 600; }
                        
                        .footer {
                            margin-top: 15px;
                            padding-top: 12px;
                            border-top: 2px solid #1a1a2e;
                            display: flex;
                            justify-content: space-between;
                            font-size: 9px;
                            color: #6c757d;
                        }
                        
                        @media print {
                            body { padding: 20px; }
                            .no-print { display: none !important; }
                            .print-container { border: none; padding: 0; }
                            .product-grid { background: #f8f9fa !important; }
                            thead { background: #1a1a2e !important; }
                            thead th { color: #ffffff !important; }
                            .spot-check td { background: #fffbeb !important; }
                            .physical-inventory td { background: #fef2f2 !important; }
                        }
                    </style>
                </head>
                <body>
                    <div class="print-container">
                        <div class="header">
                            <div class="title">SMART STOCK CARD</div>
                            <div class="facility">${facilityName}</div>
                            <div class="subtitle">PHARMACEUTICAL STOCK MANAGEMENT SYSTEM</div>
                        </div>

                        <div class="product-grid">
                            <div class="item">
                                <div class="label">Product Name</div>
                                <div class="value">${product?.name || 'N/A'}</div>
                            </div>
                            <div class="item">
                                <div class="label">Strength</div>
                                <div class="value">${product?.strength || 'N/A'}</div>
                            </div>
                            <div class="item">
                                <div class="label">Dosage Form</div>
                                <div class="value">${product?.dosageForm || 'N/A'}</div>
                            </div>
                            <div class="item">
                                <div class="label">Product Code</div>
                                <div class="value">${product?.code || 'N/A'}</div>
                            </div>
                            <div class="item">
                                <div class="label">Unit of Issue</div>
                                <div class="value">${product?.unitOfIssue || 'Each'}</div>
                            </div>
                            <div class="item">
                                <div class="label">Current Stock</div>
                                <div class="value stock">${product?.currentStock || 0}</div>
                            </div>
                        </div>

                        <div class="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th style="width:8%;">Date</th>
                                        <th style="width:8%;">D. Note / RIV</th>
                                        <th style="width:10%;">Issued To / Received From</th>
                                        <th style="width:6%; text-align:right;">Qty Received</th>
                                        <th style="width:8%;">Batch No.</th>
                                        <th style="width:8%;">Expiry Date</th>
                                        <th style="width:6%; text-align:right;">Qty Issued</th>
                                        <th style="width:5%; text-align:right;">Losses</th>
                                        <th style="width:5%; text-align:right;">Pos Adj</th>
                                        <th style="width:5%; text-align:right;">Neg Adj</th>
                                        <th style="width:7%; text-align:right;">Qty on Hand</th>
                                        <th style="width:10%;">Remarks</th>
                                        <th style="width:8%;">Officer</th>
                                        <th style="width:6%;">Signature</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${transactions.length === 0 ? `
                                        <tr>
                                            <td colspan="14" style="text-align:center; padding:30px; color:#999;">
                                                No transactions found
                                            </td>
                                        </tr>
                                    ` : transactions.map((t, index) => {
                                        const isSpotCheck = t.isSpotCheck;
                                        const isPhysicalInventory = t.isPhysicalInventory;
                                        const rowClass = isPhysicalInventory ? 'physical-inventory' : isSpotCheck ? 'spot-check' : '';
                                        
                                        return `
                                            <tr class="${rowClass}">
                                                <td>
                                                    ${formatDate(t.date)}
                                                    ${isPhysicalInventory ? '<span class="month-end-badge">🔴 MONTH END</span>' : ''}
                                                    ${isSpotCheck && !isPhysicalInventory ? '<span class="spot-badge">🟡 SPOT CHECK</span>' : ''}
                                                </td>
                                                <td>${t.dnoteNumber || t.referenceNumber || '-'}</td>
                                                <td>${t.issuedTo || t.receivedFrom || '-'}</td>
                                                <td class="right ${t.quantityReceived > 0 ? 'text-success' : ''}">${t.quantityReceived > 0 ? t.quantityReceived : '-'}</td>
                                                <td>${t.batchNumber || '-'}</td>
                                                <td>${t.expiryDate ? formatDate(t.expiryDate) : '-'}</td>
                                                <td class="right ${t.quantityIssued > 0 ? 'text-danger' : ''}">${t.quantityIssued > 0 ? t.quantityIssued : '-'}</td>
                                                <td class="right text-muted">${t.losses > 0 ? t.losses : '-'}</td>
                                                <td class="right ${t.positiveAdjustment > 0 ? 'text-success' : ''}">${t.positiveAdjustment > 0 ? t.positiveAdjustment : '-'}</td>
                                                <td class="right ${t.negativeAdjustment > 0 ? 'text-warning' : ''}">${t.negativeAdjustment > 0 ? t.negativeAdjustment : '-'}</td>
                                                <td class="right font-bold ${isPhysicalInventory ? 'text-danger' : isSpotCheck ? 'text-warning' : 'text-success'}">
                                                    ${t.quantityOnHand}
                                                    ${(isPhysicalInventory || isSpotCheck) ? `
                                                        <div style="font-size:7px; margin-top:1px;">
                                                            Phys: ${t.physicalCount || '-'}
                                                            ${t.variance !== 0 ? `
                                                                <span style="color: ${t.variance > 0 ? '#10B981' : '#dc2626'}">
                                                                    (${t.variance > 0 ? '+' : ''}${t.variance})
                                                                </span>
                                                            ` : '✅'}
                                                        </div>
                                                    ` : ''}
                                                </td>
                                                <td style="font-size:8px; color:#666;">${t.remarks || '-'}</td>
                                                <td style="font-size:8px; color:#666;">${t.transactingOfficer || '-'}</td>
                                                <td style="font-size:8px; color:#666;">${t.signature ? '✍️' : '-'}</td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>

                        <div class="footer">
                            <div>Generated: ${new Date().toLocaleString()}</div>
                            <div>Total Transactions: ${transactions.length}</div>
                            <div>Page 1 of 1</div>
                        </div>
                    </div>
                </body>
            </html>
        `;
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-main" style={{ marginLeft: '0', padding: '30px' }}>
                <style>{`
                    *::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
                    * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
                    *::-webkit-scrollbar-track { display: none !important; }
                    *::-webkit-scrollbar-thumb { display: none !important; }
                    .hide-scrollbar::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
                    .hide-scrollbar { scrollbar-width: none !important; -ms-overflow-style: none !important; }
                `}</style>

                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                    flexWrap: 'wrap',
                    gap: '12px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'rgba(214,158,46,0.1)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <StockCardIcon />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#FFFFFF', margin: '0' }}>Stock Card</h1>
                            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', margin: '0' }}>Complete transaction history</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {monthEndWarning && (
                            <div style={{
                                padding: '6px 12px',
                                background: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.2)',
                                borderRadius: '6px',
                                color: '#EF4444',
                                fontSize: '11px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="12" y1="8" x2="12" y2="12"/>
                                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                                </svg>
                                {daysUntilMonthEnd}d
                            </div>
                        )}
                        {product && (
                            <>
                                <button onClick={() => setShowSpotCheckModal(true)} style={{
                                    padding: '6px 14px',
                                    background: 'rgba(245,158,11,0.1)',
                                    border: '1px solid rgba(245,158,11,0.2)',
                                    borderRadius: '6px',
                                    color: '#F59E0B',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontFamily: 'inherit',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    <SpotCheckIcon /> Spot Check
                                </button>
                                <button onClick={() => setShowPhysicalInventoryModal(true)} style={{
                                    padding: '6px 14px',
                                    background: 'rgba(239,68,68,0.1)',
                                    border: '1px solid rgba(239,68,68,0.2)',
                                    borderRadius: '6px',
                                    color: '#EF4444',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontFamily: 'inherit',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    <PhysicalInventoryIcon /> Physical
                                </button>
                                <button onClick={handlePrint} style={{
                                    padding: '6px 14px',
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: '6px',
                                    color: 'rgba(255,255,255,0.4)',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontFamily: 'inherit',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    <PrintIcon /> Print
                                </button>
                            </>
                        )}
                        <button onClick={handleBack} style={{
                            padding: '6px 14px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '6px',
                            color: 'rgba(255,255,255,0.4)',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontFamily: 'inherit',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            <BackIcon /> Back
                        </button>
                    </div>
                </div>

                {monthEndWarning && product && (
                    <div style={{
                        padding: '12px 16px',
                        background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.02))',
                        border: '1px solid rgba(239,68,68,0.15)',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '8px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                                width: '28px',
                                height: '28px',
                                background: 'rgba(239,68,68,0.1)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="12" y1="8" x2="12" y2="12"/>
                                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                                </svg>
                            </div>
                            <div>
                                <div style={{ color: '#EF4444', fontWeight: '600', fontSize: '12px' }}>Month End in {daysUntilMonthEnd} Days</div>
                                <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px' }}>Prepare physical inventory</div>
                            </div>
                        </div>
                        <button onClick={() => setShowPhysicalInventoryModal(true)} style={{
                            padding: '5px 14px',
                            background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                            border: 'none',
                            borderRadius: '6px',
                            color: '#FFFFFF',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: '600',
                            fontFamily: 'inherit',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            <PhysicalInventoryIcon /> Record
                        </button>
                    </div>
                )}

                {!product && (
                    <div style={{ position: 'relative', marginBottom: '16px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '10px',
                            padding: '0 12px'
                        }}>
                            <SearchIcon />
                            <input
                                ref={searchRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Search for a product..."
                                style={{
                                    flex: 1,
                                    padding: '10px 10px',
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#FFFFFF',
                                    fontSize: '13px',
                                    outline: 'none',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>
                        {showSearchDropdown && searchResults.length > 0 && (
                            <div style={{
                                position: 'absolute',
                                top: 'calc(100% + 4px)',
                                left: 0,
                                right: 0,
                                background: '#1A1A1A',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '10px',
                                maxHeight: '250px',
                                overflow: 'auto',
                                zIndex: 100,
                                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none'
                            }}
                            className="hide-scrollbar">
                                {searchResults.map((p) => (
                                    <div key={p._id} onClick={() => selectProduct(p)} style={{
                                        padding: '10px 14px',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                                        <div style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: '500' }}>{p.name}</div>
                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '2px' }}>
                                            {p.code} • Stock: {p.quantityOnHand} • Batch: {p.batchNumber}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {error && <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '6px', color: '#EF4444', fontSize: '12px', marginBottom: '14px' }}>{error}</div>}
                {success && <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '6px', color: '#10B981', fontSize: '12px', marginBottom: '14px' }}>{success}</div>}

                {product && (
                    <div id="stock-card-print">
                        <div style={{ textAlign: 'center', padding: '12px 0', marginBottom: '14px', borderBottom: '2px solid rgba(255,255,255,0.04)' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#D69E2E', margin: '0 0 4px 0', letterSpacing: '2px', textTransform: 'uppercase' }}>SMART STOCK CARD</h2>
                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', letterSpacing: '1px' }}>{facilityName}</div>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                            gap: '8px',
                            marginBottom: '14px'
                        }}>
                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', padding: '10px 14px' }}>
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Product</div>
                                <div style={{ color: '#FFFFFF', fontWeight: '500', fontSize: '14px', marginTop: '2px' }}>{product.name}</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', padding: '10px 14px' }}>
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Strength</div>
                                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginTop: '2px' }}>{product.strength || 'N/A'}</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', padding: '10px 14px' }}>
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dosage Form</div>
                                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginTop: '2px' }}>{product.dosageForm || 'N/A'}</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', padding: '10px 14px' }}>
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Product Code</div>
                                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginTop: '2px' }}>{product.code || 'N/A'}</div>
                            </div>
                            <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)', borderRadius: '8px', padding: '10px 14px' }}>
                                <div style={{ fontSize: '10px', color: 'rgba(16,185,129,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Stock</div>
                                <div style={{ color: '#10B981', fontWeight: '700', fontSize: '20px', marginTop: '2px' }}>{product.currentStock}</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', padding: '10px 14px' }}>
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Unit of Issue</div>
                                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginTop: '2px' }}>{product.unitOfIssue || 'Each'}</div>
                            </div>
                        </div>

                        <div style={{
                            overflow: 'auto',
                            maxHeight: '500px',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.04)',
                            borderRadius: '10px',
                            position: 'relative',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none'
                        }}
                        className="hide-scrollbar">
                            <table ref={tableRef} style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '12px',
                                minWidth: '1200px'
                            }}>
                                <thead>
                                    <tr style={{
                                        borderBottom: '2px solid #D69E2E',
                                        background: 'rgba(214,158,46,0.06)',
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 10
                                    }}>
                                        <th style={{ padding: '10px 10px', textAlign: 'left', color: '#D69E2E', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
                                        <th style={{ padding: '10px 10px', textAlign: 'left', color: '#D69E2E', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>D. Note / RIV</th>
                                        <th style={{ padding: '10px 10px', textAlign: 'left', color: '#D69E2E', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Issued To / Received From</th>
                                        <th style={{ padding: '10px 10px', textAlign: 'right', color: '#D69E2E', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Qty Received</th>
                                        <th style={{ padding: '10px 10px', textAlign: 'left', color: '#D69E2E', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Batch No.</th>
                                        <th style={{ padding: '10px 10px', textAlign: 'left', color: '#D69E2E', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Expiry Date</th>
                                        <th style={{ padding: '10px 10px', textAlign: 'right', color: '#D69E2E', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Qty Issued</th>
                                        <th style={{ padding: '10px 10px', textAlign: 'right', color: '#D69E2E', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Losses</th>
                                        <th style={{ padding: '10px 10px', textAlign: 'right', color: '#D69E2E', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pos Adj</th>
                                        <th style={{ padding: '10px 10px', textAlign: 'right', color: '#D69E2E', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Neg Adj</th>
                                        <th style={{ padding: '10px 10px', textAlign: 'right', color: '#D69E2E', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Qty on Hand</th>
                                        <th style={{ padding: '10px 10px', textAlign: 'left', color: '#D69E2E', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Remarks</th>
                                        <th style={{ padding: '10px 10px', textAlign: 'left', color: '#D69E2E', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Officer</th>
                                        <th style={{ padding: '10px 10px', textAlign: 'left', color: '#D69E2E', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Signature</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.length === 0 ? (
                                        <tr><td colSpan="14" style={{ padding: '30px', textAlign: 'center', color: 'rgba(255,255,255,0.05)' }}>No transactions found</td></tr>
                                    ) : (
                                        transactions.map((t, index) => {
                                            const isSpotCheck = t.isSpotCheck;
                                            const isPhysicalInventory = t.isPhysicalInventory;
                                            return (
                                                <tr key={t._id || index} style={{
                                                    borderBottom: index === transactions.length - 1 ? 'none' : '1px solid rgba(214,158,46,0.06)',
                                                    background: isPhysicalInventory ? 'rgba(239,68,68,0.04)' : isSpotCheck ? 'rgba(245,158,11,0.04)' : 'transparent'
                                                }}>
                                                    <td style={{ padding: '8px 10px', color: isPhysicalInventory ? '#EF4444' : isSpotCheck ? '#F59E0B' : 'rgba(255,255,255,0.5)', fontSize: '11px' }}>
                                                        {formatDate(t.date)}
                                                        {isPhysicalInventory && <div style={{ fontSize: '8px', color: '#EF4444', fontWeight: '700', marginTop: '1px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> MONTH END
                                                        </div>}
                                                        {isSpotCheck && !isPhysicalInventory && <div style={{ fontSize: '8px', color: '#F59E0B', fontWeight: '600', marginTop: '1px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg> SPOT CHECK
                                                        </div>}
                                                    </td>
                                                    <td style={{ padding: '8px 10px', color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{t.dnoteNumber || t.referenceNumber || '-'}</td>
                                                    <td style={{ padding: '8px 10px', color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{t.issuedTo || t.receivedFrom || '-'}</td>
                                                    <td style={{ padding: '8px 10px', textAlign: 'right', color: t.quantityReceived > 0 ? '#10B981' : 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{t.quantityReceived > 0 ? t.quantityReceived : '-'}</td>
                                                    <td style={{ padding: '8px 10px', color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{t.batchNumber || '-'}</td>
                                                    <td style={{ padding: '8px 10px', color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{t.expiryDate ? formatDate(t.expiryDate) : '-'}</td>
                                                    <td style={{ padding: '8px 10px', textAlign: 'right', color: t.quantityIssued > 0 ? '#EF4444' : 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{t.quantityIssued > 0 ? t.quantityIssued : '-'}</td>
                                                    <td style={{ padding: '8px 10px', textAlign: 'right', color: t.losses > 0 ? '#6B7280' : 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{t.losses > 0 ? t.losses : '-'}</td>
                                                    <td style={{ padding: '8px 10px', textAlign: 'right', color: t.positiveAdjustment > 0 ? '#3B82F6' : 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{t.positiveAdjustment > 0 ? t.positiveAdjustment : '-'}</td>
                                                    <td style={{ padding: '8px 10px', textAlign: 'right', color: t.negativeAdjustment > 0 ? '#F59E0B' : 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{t.negativeAdjustment > 0 ? t.negativeAdjustment : '-'}</td>
                                                    <td style={{
                                                        padding: '8px 10px',
                                                        textAlign: 'right',
                                                        fontWeight: '600',
                                                        color: isPhysicalInventory ? '#EF4444' : isSpotCheck ? '#F59E0B' : '#10B981',
                                                        fontSize: '13px'
                                                    }}>
                                                        {t.quantityOnHand}
                                                        {(isPhysicalInventory || isSpotCheck) && (
                                                            <div style={{ fontSize: '9px', marginTop: '1px' }}>
                                                                Phys: {t.physicalCount || '-'}
                                                                {t.variance !== 0 && <span style={{ color: t.variance > 0 ? '#10B981' : '#EF4444' }}>({t.variance > 0 ? '+' : ''}{t.variance})</span>}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '8px 10px', color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>{t.remarks || '-'}</td>
                                                    <td style={{ padding: '8px 10px', color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>{t.transactingOfficer || '-'}</td>
                                                    <td style={{ padding: '8px 10px', color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>{t.signature ? '✍️' : '-'}</td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            marginTop: '12px',
                            fontSize: '12px',
                            color: 'rgba(255,255,255,0.15)'
                        }}>
                            Total: {transactions.length} transactions
                        </div>
                    </div>
                )}

                {/* Spot Check Modal - Yellow */}
                {showSpotCheckModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.85)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px'
                    }}>
                        <div style={{
                            background: '#1A1A1A',
                            borderRadius: '16px',
                            padding: '28px',
                            maxWidth: '450px',
                            width: '100%',
                            border: '1px solid rgba(245,158,11,0.2)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#F59E0B', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <SpotCheckIcon /> Spot Check
                                </h2>
                                <button onClick={() => { setShowSpotCheckModal(false); setPhysicalCount(''); setSpotCheckRemarks(''); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', padding: '4px', fontSize: '18px' }}>
                                    <CloseIcon />
                                </button>
                            </div>
                            <div style={{ padding: '12px', background: 'rgba(245,158,11,0.05)', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.1)', marginBottom: '14px' }}>
                                <div style={{ fontSize: '13px', color: '#F59E0B' }}>Verify current stock against physical count</div>
                            </div>
                            {product && (
                                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.04)' }}>
                                    <div style={{ color: '#FFFFFF', fontWeight: '500', fontSize: '14px' }}>{product.name}</div>
                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>System Stock: {product.currentStock} • {product.code}</div>
                                </div>
                            )}
                            <form id="spot-check-form" onSubmit={handleSpotCheck}>
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: '4px', fontWeight: '500' }}>Physical Count *</label>
                                    <input type="number" value={physicalCount} onChange={(e) => setPhysicalCount(e.target.value)} placeholder="Enter physical count..." required style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(245,158,11,0.2)',
                                        borderRadius: '8px',
                                        color: '#FFFFFF',
                                        fontSize: '14px',
                                        outline: 'none',
                                        fontFamily: 'inherit'
                                    }} onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }} />
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: '4px', fontWeight: '500' }}>Remarks</label>
                                    <textarea value={spotCheckRemarks} onChange={(e) => setSpotCheckRemarks(e.target.value)} placeholder="Any discrepancies or notes..." rows="2" style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(245,158,11,0.2)',
                                        borderRadius: '8px',
                                        color: '#FFFFFF',
                                        fontSize: '13px',
                                        outline: 'none',
                                        fontFamily: 'inherit',
                                        resize: 'vertical'
                                    }} onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }} />
                                </div>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                    <button type="button" onClick={() => { setShowSpotCheckModal(false); setPhysicalCount(''); setSpotCheckRemarks(''); }} style={{
                                        padding: '8px 16px',
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        borderRadius: '6px',
                                        color: 'rgba(255,255,255,0.4)',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontFamily: 'inherit'
                                    }}>Cancel</button>
                                    <button type="submit" disabled={loading} style={{
                                        padding: '8px 20px',
                                        background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                                        border: 'none',
                                        borderRadius: '6px',
                                        color: '#FFFFFF',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        fontFamily: 'inherit',
                                        opacity: loading ? 0.5 : 1
                                    }}>{loading ? 'Processing...' : 'Perform Spot Check'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Physical Inventory Modal - Red */}
                {showPhysicalInventoryModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.85)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px'
                    }}>
                        <div style={{
                            background: '#1A1A1A',
                            borderRadius: '16px',
                            padding: '28px',
                            maxWidth: '450px',
                            width: '100%',
                            border: '1px solid rgba(239,68,68,0.2)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#EF4444', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <PhysicalInventoryIcon /> Physical Inventory
                                </h2>
                                <button onClick={() => { setShowPhysicalInventoryModal(false); setPhysicalCount(''); setSpotCheckRemarks(''); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', padding: '4px', fontSize: '18px' }}>
                                    <CloseIcon />
                                </button>
                            </div>
                            <div style={{ padding: '12px', background: 'rgba(239,68,68,0.05)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.1)', marginBottom: '14px' }}>
                                <div style={{ fontSize: '13px', color: '#EF4444' }}>Month End Physical Inventory - Recorded in RED</div>
                            </div>
                            {product && (
                                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.04)' }}>
                                    <div style={{ color: '#FFFFFF', fontWeight: '500', fontSize: '14px' }}>{product.name}</div>
                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>System Stock: {product.currentStock} • {product.code}</div>
                                </div>
                            )}
                            <form id="physical-inventory-form" onSubmit={handlePhysicalInventory}>
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: '4px', fontWeight: '500' }}>Physical Count *</label>
                                    <input type="number" value={physicalCount} onChange={(e) => setPhysicalCount(e.target.value)} placeholder="Enter physical count..." required style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(239,68,68,0.2)',
                                        borderRadius: '8px',
                                        color: '#FFFFFF',
                                        fontSize: '14px',
                                        outline: 'none',
                                        fontFamily: 'inherit'
                                    }} onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }} />
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: '4px', fontWeight: '500' }}>Remarks</label>
                                    <textarea value={spotCheckRemarks} onChange={(e) => setSpotCheckRemarks(e.target.value)} placeholder="Any discrepancies or notes..." rows="2" style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(239,68,68,0.2)',
                                        borderRadius: '8px',
                                        color: '#FFFFFF',
                                        fontSize: '13px',
                                        outline: 'none',
                                        fontFamily: 'inherit',
                                        resize: 'vertical'
                                    }} onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }} />
                                </div>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                    <button type="button" onClick={() => { setShowPhysicalInventoryModal(false); setPhysicalCount(''); setSpotCheckRemarks(''); }} style={{
                                        padding: '8px 16px',
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        borderRadius: '6px',
                                        color: 'rgba(255,255,255,0.4)',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontFamily: 'inherit'
                                    }}>Cancel</button>
                                    <button type="submit" disabled={loading} style={{
                                        padding: '8px 20px',
                                        background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                                        border: 'none',
                                        borderRadius: '6px',
                                        color: '#FFFFFF',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        fontFamily: 'inherit',
                                        opacity: loading ? 0.5 : 1
                                    }}>{loading ? 'Processing...' : 'Record Physical Inventory'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StockCard;