import React from 'react';
import { useNavigate } from 'react-router-dom';


const About = () => {
    const navigate = useNavigate();

    // SVG Icons
    const BackIcon = () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
        </svg>
    );

    const ArrowRightIcon = () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
        </svg>
    );

    const LogoIcon = () => (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#D69E2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
            <path d="M4 8v10"/>
            <path d="M12 8v10"/>
            <path d="M20 8v10"/>
        </svg>
    );

    const PillIcon = () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z"/>
            <line x1="6" y1="8" x2="18" y2="8"/>
            <line x1="6" y1="12" x2="18" y2="12"/>
            <line x1="6" y1="16" x2="18" y2="16"/>
        </svg>
    );

    const ShieldIcon = () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <polyline points="9 12 11 14 15 10"/>
        </svg>
    );

    const ClockIcon = () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
        </svg>
    );

    const BoxIcon = () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <line x1="16" y1="21" x2="16" y2="17"/>
            <line x1="8" y1="21" x2="8" y2="17"/>
            <line x1="2" y1="11" x2="22" y2="11"/>
        </svg>
    );

    return (
        <div className="landing-container">
            {/* Background Effects */}
            <div className="landing-bg-glow-1"></div>
            <div className="landing-bg-glow-2"></div>
            <div className="landing-bg-grid"></div>

            {/* Navigation */}
            <nav className="landing-nav">
                <div className="landing-nav-content">
                    <div className="landing-logo">
                        <span className="landing-logo-icon">✦</span>
                        <span style={{ fontWeight: '700', fontSize: '18px' }}>
                            MedOx <span className="landing-gold">Pharmacy</span>
                        </span>
                    </div>
                    <div className="landing-nav-links">
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="landing-nav-btn"
                            style={{
                                padding: '8px 20px',
                                background: 'linear-gradient(135deg, #D69E2E, #B8860B)',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#000',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontFamily: 'inherit',
                                transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(214,158,46,0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <BackIcon /> Dashboard
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="landing-hero">
                <div className="landing-hero-content">
                    <div className="landing-hero-text">
                        <div style={{ marginBottom: '16px' }}>
                            <LogoIcon />
                        </div>
                        <h1>
                            About <span className="landing-gold">CytochromeRX</span>
                        </h1>
                        <p className="landing-hero-subtitle">
                            Pharmacy Management System
                        </p>
                        <p style={{
                            color: 'rgba(255,255,255,0.4)',
                            fontSize: '16px',
                            maxWidth: '600px',
                            margin: '20px auto 0 auto',
                            lineHeight: '1.8'
                        }}>
                            A comprehensive pharmacy management system designed to 
                            streamline operations, ensure patient safety, and optimize 
                            inventory management.
                        </p>
                    </div>
                </div>
            </section>

            {/* Details Section */}
            <section className="landing-features">
                <div className="landing-features-grid" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    {/* Concept Card */}
                    <div className="landing-feature-card" style={{ gridColumn: '1 / -1' }}>
                        <h3 style={{ 
                            color: '#FFFFFF', 
                            fontSize: '18px', 
                            marginBottom: '16px',
                            textAlign: 'center'
                        }}>
                            💡 Concept & Development
                        </h3>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '16px'
                        }}>
                            <div style={{
                                background: 'rgba(214,158,46,0.04)',
                                border: '1px solid rgba(214,158,46,0.08)',
                                borderRadius: '12px',
                                padding: '20px',
                                textAlign: 'center'
                            }}>
                                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginBottom: '8px' }}>
                                    Concept by
                                </div>
                                <div style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: '600' }}>
                                    Jones Chikuni
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>
                                    Pharmacist
                                </div>
                            </div>
                            <div style={{
                                background: 'rgba(16,185,129,0.04)',
                                border: '1px solid rgba(16,185,129,0.08)',
                                borderRadius: '12px',
                                padding: '20px',
                                textAlign: 'center'
                            }}>
                                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginBottom: '8px' }}>
                                    Brought to life by
                                </div>
                                <div style={{ color: '#10B981', fontSize: '18px', fontWeight: '600' }}>
                                    CytochromeRX
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>
                                    Technology Partner
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="landing-feature-card" style={{ gridColumn: '1 / -1' }}>
                        <h3 style={{ 
                            color: '#FFFFFF', 
                            fontSize: '18px', 
                            marginBottom: '16px',
                            textAlign: 'center'
                        }}>
                            Key Features
                        </h3>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '16px'
                        }}>
                            <div style={{
                                textAlign: 'center',
                                padding: '16px',
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: '10px',
                                border: '1px solid rgba(255,255,255,0.04)'
                            }}>
                                <BoxIcon />
                                <div style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: '500', marginTop: '8px' }}>Inventory Management</div>
                                <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', marginTop: '4px' }}>Real-time stock tracking</div>
                            </div>
                            <div style={{
                                textAlign: 'center',
                                padding: '16px',
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: '10px',
                                border: '1px solid rgba(255,255,255,0.04)'
                            }}>
                                <PillIcon />
                                <div style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: '500', marginTop: '8px' }}>Dispensing (FEFO)</div>
                                <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', marginTop: '4px' }}>First Expiry First Out</div>
                            </div>
                            <div style={{
                                textAlign: 'center',
                                padding: '16px',
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: '10px',
                                border: '1px solid rgba(255,255,255,0.04)'
                            }}>
                                <ShieldIcon />
                                <div style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: '500', marginTop: '8px' }}>Patient Safety</div>
                                <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', marginTop: '4px' }}>Expiry & recall alerts</div>
                            </div>
                            <div style={{
                                textAlign: 'center',
                                padding: '16px',
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: '10px',
                                border: '1px solid rgba(255,255,255,0.04)'
                            }}>
                                <ClockIcon />
                                <div style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: '500', marginTop: '8px' }}>Smart Alerts</div>
                                <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', marginTop: '4px' }}>Low stock & expiry warnings</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="landing-footer-content">
                    <p>© 2026 <span className="landing-gold">CytochromeRX</span>. All rights reserved.</p>
                    <p style={{ margin: '8px 0 0 0', color: 'rgba(255,255,255,0.1)', fontSize: '12px' }}>
                        Concept by Jones Chikuni • Pharmacy Management System
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default About;

