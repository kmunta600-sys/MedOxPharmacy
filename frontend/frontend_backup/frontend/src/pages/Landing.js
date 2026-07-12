import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Loading screen for 3.5 seconds
        const timer = setTimeout(() => {
            setLoading(false);
        }, 3500);
        
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        
        return () => {
            clearTimeout(timer);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // SVG Icons
    const FeatureIcon1 = () => (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D69E2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <line x1="16" y1="21" x2="16" y2="17"/>
            <line x1="8" y1="21" x2="8" y2="17"/>
            <line x1="2" y1="11" x2="22" y2="11"/>
        </svg>
    );

    const FeatureIcon2 = () => (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D69E2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
        </svg>
    );

    const FeatureIcon3 = () => (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D69E2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
    );

    const FeatureIcon4 = () => (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D69E2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
    );

    const ArrowRightIcon = () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
        </svg>
    );

    const features = [
        { icon: <FeatureIcon1 />, title: 'Inventory Management', desc: 'Real-time stock tracking with batch and expiry management.' },
        { icon: <FeatureIcon2 />, title: 'Smart Dispensing', desc: 'FEFO dispensing with patient safety checks and warnings.' },
        { icon: <FeatureIcon3 />, title: 'Quarantine Control', desc: 'Isolate expired, recalled, or damaged products instantly.' },
        { icon: <FeatureIcon4 />, title: 'Pharmacy Analytics', desc: 'Track performance, stock levels, and dispensing trends.' }
    ];

    // Loading Screen
    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-content">
                    <div className="loading-logo">✦</div>
                    <h1 className="loading-title">CytochromeRX</h1>
                    <p className="loading-subtitle">Smart Inventory System</p>
                    <div className="loading-bar-container">
                        <div className="loading-bar"></div>
                    </div>
                    <p className="loading-text">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="landing-container">
            {/* Aura Orbs */}
            <div className="aura-orb-1"></div>
            <div className="aura-orb-2"></div>
            <div className="aura-orb-3"></div>
            <div className="aura-grid"></div>

            {/* Floating Particles */}
            <div className="floating-particles">
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
            </div>

            {/* Navigation */}
            <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
                <div className="nav-brand">
                    <span>MedOx <span className="gold">Pharmacy</span></span>
                </div>
                <div className="nav-links">
                    <a href="#features">Features</a>
                    <a href="#about">About</a>
                    <button onClick={() => navigate('/login')} className="nav-getstarted">
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Hero Section - BIG */}
            <section className="hero-section">
                <div className="hero-content">
                    <div style={{ textAlign: 'center' }}>
                        <h1 style={{ 
                            fontSize: '96px', 
                            fontWeight: '900', 
                            color: '#FFFFFF',
                            margin: '0',
                            letterSpacing: '-3px',
                            lineHeight: '1.05'
                        }}>
                            Smart Inventory
                        </h1>
                        <h1 style={{ 
                            fontSize: '96px', 
                            fontWeight: '900', 
                            color: '#D69E2E',
                            margin: '0',
                            letterSpacing: '-3px',
                            lineHeight: '1.05'
                        }}>
                            Management System
                        </h1>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-section">
                <div className="section-header">
                    <span className="section-badge">Features</span>
                    <h2 className="section-title">Everything You Need</h2>
                    <p className="section-subtitle">Built for modern pharmacy operations.</p>
                </div>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div key={index} className="feature-card">
                            <div className="feature-icon">{feature.icon}</div>
                            <h3>{feature.title}</h3>
                            <p>{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="about-section">
                <h2>About This System</h2>
                <p>
                    This is a <strong style={{ color: '#D69E2E' }}>Smart Inventory Management System</strong> built for 
                    <strong style={{ color: '#D69E2E' }}> MedOx Pharmacy</strong>. It provides real-time inventory tracking, 
                    patient dispensing, stock adjustments, and advanced safety features including expiry warnings and 
                    quarantine management. Designed to streamline pharmaceutical operations, this system ensures 
                    patient safety, regulatory compliance, and operational efficiency.
                </p>
                <div className="about-credit">
                    <div className="powered">
                        ✦ <span>CytochromeRX</span> built the Smart Inventory System for MedOx Pharmacy
                    </div>
                    <div className="developer">
                        Idea by <span>Jones Ezekiel Chikuni</span> • Pharmacist
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <span>MedOx <span className="gold">Pharmacy</span></span>
                        <p>Powered by CytochromeRX</p>
                    </div>
                    <div className="footer-links">
                        <button onClick={() => navigate('/login')}>Login</button>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>© 2026 MedOx Pharmacy • Powered by CytochromeRX</p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;