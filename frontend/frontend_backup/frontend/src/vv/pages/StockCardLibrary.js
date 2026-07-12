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
    )
};

const StockCardLibrary = () => {
    const navigate = useNavigate();
    const [stockCards, setStockCards] = useState([]);
    const [filteredCards, setFilteredCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCard, setSelectedCard] = useState(null);
    const [showModal, setShowModal] = useState(false);
    
    const [filters, setFilters] = useState({
        day: '',
        month: '',
        year: '',
        productName: '',
        status: 'all'
    });
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const years = ['2023', '2024', '2025', '2026'];
    const days = Array.from({length: 31}, (_, i) => String(i + 1).padStart(2, '0'));

    const [stats, setStats] = useState({
        totalCards: 0,
        verified: 0,
        pending: 0,
        discrepancies: 0,
        accuracy: 100
    });

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
            const sampleCards = generateSampleCards();
            setStockCards(sampleCards);
            setFilteredCards(sampleCards);
            updateStats(sampleCards);
        } catch (error) {
            console.error('Error loading stock cards:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateSampleCards = () => {
        const products = [
            { name: 'Paracetamol 500mg', code: 'PCM-001' },
            { name: 'Amoxicillin 250mg', code: 'AMX-002' },
            { name: 'Ibuprofen 400mg', code: 'IBU-003' },
            { name: 'Metformin 500mg', code: 'MET-004' },
            { name: 'Omeprazole 20mg', code: 'OME-005' },
            { name: 'Losartan 50mg', code: 'LOS-006' },
            { name: 'Amlodipine 10mg', code: 'AML-007' },
            { name: 'Atorvastatin 20mg', code: 'ATO-008' },
        ];

        const statuses = ['Verified', 'Pending', 'Discrepancy'];
        const officers = ['Dr. John Smith', 'Dr. Jane Doe', 'Pharm. Mike Johnson'];
        const units = ['Tablet', 'Capsule', 'Strip', 'Vial'];
        
        return products.map((product, index) => {
            const month = months[Math.floor(Math.random() * months.length)];
            const day = days[Math.floor(Math.random() * 28)];
            const year = years[Math.floor(Math.random() * years.length)];
            const systemQty = Math.floor(Math.random() * 500) + 50;
            const physicalQty = systemQty + (Math.random() > 0.7 ? Math.floor(Math.random() * 20) - 10 : 0);
            const status = Math.random() > 0.6 ? statuses[Math.floor(Math.random() * statuses.length)] : 'Verified';
            
            return {
                id: index + 1,
                productName: product.name,
                productCode: product.code,
                systemQuantity: systemQty,
                physicalQuantity: physicalQty,
                status: status,
                day: day,
                month: month,
                year: year,
                date: `${month} ${day}, ${year}`,
                verifiedBy: officers[Math.floor(Math.random() * officers.length)],
                notes: status === 'Discrepancy' ? 'Physical count differs from system' : 'Count verified',
                batchNumber: `BATCH-${String(index + 1).padStart(3, '0')}`,
                expiryDate: `Dec ${parseInt(year) + 1}`,
                unitOfIssue: units[Math.floor(Math.random() * units.length)]
            };
        });
    };

    const updateStats = (cards) => {
        const total = cards.length;
        const verified = cards.filter(c => c.status === 'Verified').length;
        const pending = cards.filter(c => c.status === 'Pending').length;
        const discrepancies = cards.filter(c => c.status === 'Discrepancy').length;
        const accuracy = total > 0 ? Math.round((verified / total) * 100) : 100;
        setStats({ totalCards: total, verified, pending, discrepancies, accuracy });
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
            filtered = filtered.filter(card => card.day === filters.day);
        }
        if (filters.month) {
            filtered = filtered.filter(card => card.month === filters.month);
        }
        if (filters.year) {
            filtered = filtered.filter(card => card.year === filters.year);
        }
        if (filters.status !== 'all') {
            filtered = filtered.filter(card => card.status === filters.status);
        }
        setFilteredCards(filtered);
        updateStats(filtered);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({
            day: '',
            month: '',
            year: '',
            productName: '',
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
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Stock Card - ${card.productName}</title>
                    <style>
                        body { font-family: 'Courier New', monospace; margin: 40px; color: #333; background: #fff; }
                        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px; }
                        .header h1 { margin: 0; font-size: 24px; color: #D69E2E; }
                        .header p { margin: 5px 0; color: #666; }
                        .details { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; padding: 15px; background: #f9f9f9; border-radius: 5px; }
                        .detail-item { display: flex; flex-direction: column; }
                        .detail-item label { font-size: 10px; color: #666; text-transform: uppercase; font-weight: bold; }
                        .detail-item span { font-size: 14px; font-weight: 500; }
                        .status-section { margin: 20px 0; padding: 15px; border: 2px solid #333; border-radius: 5px; text-align: center; }
                        .status-section .status { font-size: 18px; font-weight: bold; }
                        .status-section .status.verified { color: #10B981; }
                        .status-section .status.pending { color: #F59E0B; }
                        .status-section .status.discrepancy { color: #EF4444; }
                        .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #333; display: flex; justify-content: space-between; }
                        .signature { margin-top: 20px; display: flex; justify-content: space-between; }
                        .signature div { display: flex; flex-direction: column; }
                        .signature .line { border-bottom: 1px solid #333; width: 200px; margin-top: 5px; }
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
                        <div class="detail-item"><label>Physical Quantity</label><span style="color: ${card.physicalQuantity !== card.systemQuantity ? '#EF4444' : '#10B981'}">${card.physicalQuantity}</span></div>
                        <div class="detail-item"><label>Verified By</label><span>${card.verifiedBy}</span></div>
                        <div class="detail-item"><label>Notes</label><span>${card.notes}</span></div>
                    </div>
                    <div class="status-section">
                        <div>Status</div>
                        <div class="status ${card.status.toLowerCase()}">${card.status}</div>
                    </div>
                    <div class="signature">
                        <div><label>Verified By:</label><div class="line">&nbsp;</div></div>
                        <div><label>Signature:</label><div class="line">&nbsp;</div></div>
                        <div><label>Date:</label><div class="line">&nbsp;</div></div>
                    </div>
                    <div class="footer">
                        <span>Generated: ${new Date().toLocaleString()}</span>
                        <span>Stock Card #${card.id}</span>
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
        <div className="library-modern-wrapper">
            {/* Stats Bar */}
            <div className="library-stats-bar">
                <div className="stat-item">
                    <span className="stat-value">{stats.totalCards}</span>
                    <span className="stat-label">Total Stock Cards</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value" style={{ color: '#10B981' }}>{stats.verified}</span>
                    <span className="stat-label">Verified</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value" style={{ color: '#F59E0B' }}>{stats.pending}</span>
                    <span className="stat-label">Pending</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value" style={{ color: '#EF4444' }}>{stats.discrepancies}</span>
                    <span className="stat-label">Discrepancies</span>
                </div>
                <div className="stat-item accuracy">
                    <span className="stat-value">{stats.accuracy}%</span>
                    <span className="stat-label">Stock Accuracy</span>
                </div>
            </div>

            {/* Header */}
            <header className="library-header">
                <div className="library-header-left">
                    <Icons.Pharmacy />
                    <span className="library-brand">MedOx <span className="gold">Pharmacy</span></span>
                    <span className="library-badge">Stock Card Library</span>
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
                        <h1>Stock Card Library</h1>
                        <p>All stock cards ever created - filter by date, product, or status</p>
                    </div>

                    {/* Advanced Filters */}
                    <div className="library-advanced-filters">
                        <div className="filters-row">
                            <div className="filter-group">
                                <label>Product Name / Code</label>
                                <input type="text" name="productName" placeholder="Search products..." value={filters.productName} onChange={handleFilterChange} className="filter-input" />
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
                        
                        {(filters.day || filters.month || filters.year || filters.productName || filters.status !== 'all') && (
                            <div className="active-filters">
                                <span className="active-label">Active Filters:</span>
                                {filters.productName && <span className="filter-tag">Product: {filters.productName}</span>}
                                {filters.day && <span className="filter-tag">Day: {filters.day}</span>}
                                {filters.month && <span className="filter-tag">Month: {filters.month}</span>}
                                {filters.year && <span className="filter-tag">Year: {filters.year}</span>}
                                {filters.status !== 'all' && <span className="filter-tag">Status: {filters.status}</span>}
                                <span className="filter-results">{filteredCards.length} results</span>
                            </div>
                        )}
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
                                <div key={card.id} className="library-card" onClick={() => viewCard(card)} style={{ borderLeft: `4px solid ${getStatusColor(card.status)}` }}>
                                    <div className="card-header">
                                        <h3>{card.productName}</h3>
                                        <span className={`card-status ${card.status.toLowerCase()}`}>{card.status}</span>
                                    </div>
                                    <div className="card-body">
                                        <div className="card-info"><span className="info-label">Code:</span><span className="info-value">{card.productCode}</span></div>
                                        <div className="card-info"><span className="info-label">System Qty:</span><span className="info-value">{card.systemQuantity}</span></div>
                                        <div className="card-info"><span className="info-label">Physical Qty:</span><span className="info-value" style={{ color: card.physicalQuantity !== card.systemQuantity ? '#EF4444' : '#10B981' }}>{card.physicalQuantity}</span></div>
                                        <div className="card-info"><span className="info-label">Date:</span><span className="info-value">{card.date}</span></div>
                                        <div className="card-info"><span className="info-label">Verified By:</span><span className="info-value">{card.verifiedBy}</span></div>
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
                            <h2>Full Stock Card - {selectedCard.productName}</h2>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-grid">
                                <div className="modal-item"><label>Product Name</label><span>{selectedCard.productName}</span></div>
                                <div className="modal-item"><label>Product Code</label><span>{selectedCard.productCode}</span></div>
                                <div className="modal-item"><label>Batch Number</label><span>{selectedCard.batchNumber}</span></div>
                                <div className="modal-item"><label>Expiry Date</label><span>{selectedCard.expiryDate}</span></div>
                                <div className="modal-item"><label>Unit of Issue</label><span>{selectedCard.unitOfIssue}</span></div>
                                <div className="modal-item"><label>Date</label><span>{selectedCard.date}</span></div>
                                <div className="modal-item"><label>System Quantity</label><span>{selectedCard.systemQuantity}</span></div>
                                <div className="modal-item"><label>Physical Quantity</label><span style={{ color: selectedCard.physicalQuantity !== selectedCard.systemQuantity ? '#EF4444' : '#10B981' }}>{selectedCard.physicalQuantity}</span></div>
                                <div className="modal-item"><label>Status</label><span className={`card-status ${selectedCard.status.toLowerCase()}`}>{selectedCard.status}</span></div>
                                <div className="modal-item"><label>Verified By</label><span>{selectedCard.verifiedBy}</span></div>
                                <div className="modal-item full-width"><label>Notes</label><span>{selectedCard.notes}</span></div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="modal-btn modal-btn-close" onClick={closeModal}>Close</button>
                            <button className="modal-btn modal-btn-print" onClick={() => handlePrint(selectedCard)}>Print Stock Card</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockCardLibrary;





