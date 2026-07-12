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
    Print: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"/>
            <path d="M18 9H6"/>
            <path d="M18 13H6"/>
            <rect x="2" y="9" width="20" height="10" rx="2"/>
            <line x1="6" y1="17" x2="6" y2="19"/>
            <line x1="18" y1="17" x2="18" y2="19"/>
        </svg>
    )
};

const StockCards = () => {
    const navigate = useNavigate();
    const [stockCards, setStockCards] = useState([]);
    const [filteredCards, setFilteredCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCard, setSelectedCard] = useState(null);
    const [showModal, setShowModal] = useState(false);
    
    // Filters
    const [filters, setFilters] = useState({
        productName: '',
        day: '',
        month: '',
        year: '',
        status: 'all'
    });
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const years = ['2023', '2024', '2025', '2026'];
    const days = Array.from({length: 31}, (_, i) => String(i + 1).padStart(2, '0'));

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        loadStockCards();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, stockCards]);

    const loadStockCards = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/products');
            if (response.data && response.data.success) {
                // Generate stock cards from products
                const cards = generateStockCards(response.data.data);
                setStockCards(cards);
                setFilteredCards(cards);
            }
        } catch (error) {
            console.error('Error loading stock cards:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateStockCards = (products) => {
        const statuses = ['Verified', 'Pending', 'Discrepancy'];
        const officers = ['Dr. John Smith', 'Dr. Jane Doe', 'Pharm. Mike Johnson'];
        
        return products.map((product, index) => {
            const month = months[Math.floor(Math.random() * months.length)];
            const day = days[Math.floor(Math.random() * 28)];
            const year = years[Math.floor(Math.random() * years.length)];
            const status = Math.random() > 0.6 ? statuses[Math.floor(Math.random() * statuses.length)] : 'Verified';
            const officer = officers[Math.floor(Math.random() * officers.length)];
            
            return {
                id: index + 1,
                productName: product.name,
                productCode: product.code || 'N/A',
                dosageForm: product.dosageForm || 'Tablet',
                unitOfIssue: product.unitOfIssue || 'Unit',
                batchNumber: `BATCH-${String(index + 1).padStart(3, '0')}`,
                expiryDate: `Dec ${parseInt(year) + 1}`,
                docNumber: `RCP-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
                date: `${month} ${day}, ${year}`,
                issuedTo: ['Ward A', 'Pharmacy', 'Ward B', 'Clinic'][Math.floor(Math.random() * 4)],
                quantityIssued: Math.floor(Math.random() * 20),
                losses: Math.random() > 0.8 ? Math.floor(Math.random() * 5) : 0,
                positiveAdjustment: Math.random() > 0.7 ? Math.floor(Math.random() * 10) : 0,
                negativeAdjustment: Math.random() > 0.8 ? Math.floor(Math.random() * 5) : 0,
                systemQuantity: product.quantityOnHand || 0,
                physicalQuantity: product.quantityOnHand || 0,
                status: status,
                verifiedBy: officer,
                officer: officer,
                notes: status === 'Discrepancy' ? 'Physical count differs from system' : 'Count verified',
                signature: '________________________'
            };
        });
    };

    const applyFilters = () => {
        let filtered = [...stockCards];
        
        if (filters.productName.trim()) {
            const searchTerm = filters.productName.toLowerCase().trim();
            filtered = filtered.filter(card =>
                card.productName.toLowerCase().includes(searchTerm) ||
                card.productCode.toLowerCase().includes(searchTerm)
            );
        }
        if (filters.day) {
            filtered = filtered.filter(card => card.date.includes(filters.day));
        }
        if (filters.month) {
            filtered = filtered.filter(card => card.date.includes(filters.month));
        }
        if (filters.year) {
            filtered = filtered.filter(card => card.date.includes(filters.year));
        }
        if (filters.status !== 'all') {
            filtered = filtered.filter(card => card.status === filters.status);
        }
        setFilteredCards(filtered);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({
            productName: '',
            day: '',
            month: '',
            year: '',
            status: 'all'
        });
    };

    const viewCard = (card) => {
        setSelectedCard(card);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedCard(null);
    };

    const handlePrint = (card) => {
        const printWindow = window.open('', '_blank', 'width=900,height=700');
        printWindow.document.write(`
            <html>
                <head><title>Stock Card - ${card.productName}</title>
                <style>
                    body { font-family: 'Times New Roman', serif; margin: 40px; color: #000; }
                    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
                    .header h1 { font-size: 24px; margin: 0; }
                    .details { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0; padding: 15px; background: #f9f9f9; }
                    .detail-item label { font-size: 11px; color: #666; text-transform: uppercase; font-weight: bold; }
                    .detail-item span { font-size: 14px; }
                    .status-section { text-align: center; padding: 15px; border: 2px solid #000; margin: 20px 0; }
                    .signature { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 30px; padding-top: 20px; border-top: 2px solid #000; }
                    .signature .line { border-bottom: 1px solid #000; height: 30px; }
                    .footer { margin-top: 20px; display: flex; justify-content: space-between; font-size: 12px; color: #666; }
                    @media print { body { margin: 20px; } }
                </style>
                </head>
                <body>
                    <div class="header">
                        <h1>STOCK CARD</h1>
                        <p>MedOx Pharmacy - Stock Management System</p>
                    </div>
                    <div class="details">
                        <div class="detail-item"><label>Product Name</label><span>${card.productName}</span></div>
                        <div class="detail-item"><label>Product Code</label><span>${card.productCode}</span></div>
                        <div class="detail-item"><label>Batch Number</label><span>${card.batchNumber}</span></div>
                        <div class="detail-item"><label>Expiry Date</label><span>${card.expiryDate}</span></div>
                        <div class="detail-item"><label>Unit of Issue</label><span>${card.unitOfIssue}</span></div>
                        <div class="detail-item"><label>Date</label><span>${card.date}</span></div>
                        <div class="detail-item"><label>System Quantity</label><span>${card.systemQuantity}</span></div>
                        <div class="detail-item"><label>Physical Quantity</label><span>${card.physicalQuantity}</span></div>
                        <div class="detail-item"><label>Verified By</label><span>${card.verifiedBy}</span></div>
                        <div class="detail-item"><label>Status</label><span>${card.status}</span></div>
                    </div>
                    <div class="status-section">
                        <div>Status: ${card.status}</div>
                    </div>
                    <div class="signature">
                        <div><label>Verified By:</label><div class="line"></div></div>
                        <div><label>Signature:</label><div class="line"></div></div>
                        <div><label>Date:</label><div class="line"></div></div>
                    </div>
                    <div class="footer">
                        <span>Generated: ${new Date().toLocaleString()}</span>
                        <span>Stock Card #${String(card.id).padStart(4, '0')}</span>
                    </div>
                    <script>window.onload = function() { window.print(); }</script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Verified': return '#10B981';
            case 'Pending': return '#F59E0B';
            case 'Discrepancy': return '#EF4444';
            default: return 'rgba(255,255,255,0.3)';
        }
    };

    return (
        <div className="stockcard-library-wrapper">
            {/* Header */}
            <header className="library-header">
                <div className="library-header-left">
                    <Icons.Pharmacy />
                    <span className="library-brand">MedOx <span className="gold">Pharmacy</span></span>
                    <span className="library-badge">Stock Cards</span>
                </div>
                <div className="library-header-right">
                    <button className="library-btn-back" onClick={() => navigate('/dashboard')}>
                        <Icons.Back /> Back
                    </button>
                </div>
            </header>

            {/* Content */}
            <div className="library-content">
                <div className="library-container">
                    {/* Page Header */}
                    <div className="library-page-header">
                        <h1>Stock Cards</h1>
                        <p>View and filter all stock cards</p>
                    </div>

                    {/* Filters */}
                    <div className="library-advanced-filters">
                        <div className="filters-row">
                            <div className="filter-group">
                                <label>Product Name / Code</label>
                                <input
                                    type="text"
                                    name="productName"
                                    placeholder="Search products..."
                                    value={filters.productName}
                                    onChange={handleFilterChange}
                                    className="filter-input"
                                />
                            </div>
                            <div className="filter-group">
                                <label>Day</label>
                                <select name="day" value={filters.day} onChange={handleFilterChange} className="filter-select">
                                    <option value="">All Days</option>
                                    {days.map(day => <option key={day} value={day}>{day}</option>)}
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Month</label>
                                <select name="month" value={filters.month} onChange={handleFilterChange} className="filter-select">
                                    <option value="">All Months</option>
                                    {months.map(month => <option key={month} value={month}>{month}</option>)}
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Year</label>
                                <select name="year" value={filters.year} onChange={handleFilterChange} className="filter-select">
                                    <option value="">All Years</option>
                                    {years.map(year => <option key={year} value={year}>{year}</option>)}
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Status</label>
                                <select name="status" value={filters.status} onChange={handleFilterChange} className="filter-select">
                                    <option value="all">All Status</option>
                                    <option value="Verified">Verified</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Discrepancy">Discrepancy</option>
                                </select>
                            </div>
                            <div className="filter-group filter-actions">
                                <button className="filter-btn-clear" onClick={clearFilters}>Clear Filters</button>
                            </div>
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="active-filters">
                        <span>{filteredCards.length} stock cards found</span>
                    </div>

                    {/* Stock Cards Grid */}
                    <div className="library-grid">
                        {loading ? (
                            <div className="library-loading">Loading stock cards...</div>
                        ) : filteredCards.length === 0 ? (
                            <div className="library-empty">
                                <Icons.Empty />
                                <p>No stock cards found</p>
                                <span>Try adjusting your filters</span>
                            </div>
                        ) : (
                            filteredCards.map((card) => (
                                <div 
                                    key={card.id} 
                                    className="library-card"
                                    onClick={() => viewCard(card)}
                                    style={{ borderLeft: `4px solid ${getStatusColor(card.status)}` }}
                                >
                                    <div className="card-header">
                                        <h3>{card.productName}</h3>
                                        <span className={`card-status ${card.status.toLowerCase()}`}>
                                            {card.status}
                                        </span>
                                    </div>
                                    <div className="card-body">
                                        <div className="card-info">
                                            <div className="card-info"><label>Code:</label><span>{card.productCode}</span></div>
                                            <div className="card-info"><label>Batch:</label><span>{card.batchNumber}</span></div>
                                            <div className="card-info"><label>Expiry:</label><span>{card.expiryDate}</span></div>
                                        </div>
                                        <div className="card-info">
                                            <div className="card-info"><label>Dosage:</label><span>{card.dosageForm}</span></div>
                                            <div className="card-info"><label>Unit:</label><span>{card.unitOfIssue}</span></div>
                                            <div className="card-info"><label>Date:</label><span>{card.date}</span></div>
                                        </div>
                                        <div className="card-info">
                                            <div className="card-info"><label>System Qty:</label><span className="highlight">{card.systemQuantity}</span></div>
                                            <div className="card-info"><label>Physical Qty:</label><span className="highlight" style={{ color: card.physicalQuantity !== card.systemQuantity ? '#EF4444' : '#10B981' }}>{card.physicalQuantity}</span></div>
                                            <div className="card-info"><label>Verified:</label><span>{card.verifiedBy}</span></div>
                                        </div>
                                        <div className="card-info">
                                            <div className="card-info full-width"><label>Remarks:</label><span>{card.notes}</span></div>
                                        </div>
                                    </div>
                                    <div className="card-footer">
                                        <button className="card-view-btn">View Details</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && selectedCard && (
                <div className="library-modal-overlay" onClick={closeModal}>
                    <div className="library-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Stock Card - {selectedCard.productName}</h2>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-grid">
                                <div className="modal-item"><label>Product Name</label><span>{selectedCard.productName}</span></div>
                                <div className="modal-item"><label>Product Code</label><span>{selectedCard.productCode}</span></div>
                                <div className="modal-item"><label>Dosage Form</label><span>{selectedCard.dosageForm}</span></div>
                                <div className="modal-item"><label>Unit of Issue</label><span>{selectedCard.unitOfIssue}</span></div>
                                <div className="modal-item"><label>Batch Number</label><span>{selectedCard.batchNumber}</span></div>
                                <div className="modal-item"><label>Expiry Date</label><span>{selectedCard.expiryDate}</span></div>
                                <div className="modal-item"><label>D.Note/RIV</label><span>{selectedCard.docNumber}</span></div>
                                <div className="modal-item"><label>Date</label><span>{selectedCard.date}</span></div>
                                <div className="modal-item"><label>Issued To/From</label><span>{selectedCard.issuedTo}</span></div>
                                <div className="modal-item"><label>Quantity Issued</label><span>{selectedCard.quantityIssued}</span></div>
                                <div className="modal-item"><label>Losses</label><span>{selectedCard.losses}</span></div>
                                <div className="modal-item"><label>Positive Adj</label><span>{selectedCard.positiveAdjustment}</span></div>
                                <div className="modal-item"><label>Negative Adj</label><span>{selectedCard.negativeAdjustment}</span></div>
                                <div className="modal-item"><label>System Quantity</label><span className="highlight">{selectedCard.systemQuantity}</span></div>
                                <div className="modal-item"><label>Physical Quantity</label><span className="highlight">{selectedCard.physicalQuantity}</span></div>
                                <div className="modal-item full-width"><label>Remarks</label><span>{selectedCard.notes}</span></div>
                                <div className="modal-item"><label>Status</label><span className={`card-status ${selectedCard.status.toLowerCase()}`}>{selectedCard.status}</span></div>
                                <div className="modal-item"><label>Verified By</label><span>{selectedCard.verifiedBy}</span></div>
                                <div className="modal-item"><label>Officer</label><span>{selectedCard.officer}</span></div>
                                <div className="modal-item"><label>Signature</label><span>{selectedCard.signature}</span></div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="modal-btn modal-btn-close" onClick={closeModal}>Close</button>
                            <button className="modal-btn modal-btn-print" onClick={() => handlePrint(selectedCard)}>Print</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockCards;

