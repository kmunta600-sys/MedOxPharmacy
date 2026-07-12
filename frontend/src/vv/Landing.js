import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/styles.css';

const Landing = () => {
    const navigate = useNavigate();
    const [showAbout, setShowAbout] = useState(false);
    const [isReading, setIsReading] = useState(false);
    const utteranceRef = useRef(null);

    // Modern SVG Icons
    const AnalyticsIcon = () => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D69E2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12v-2a5 5 0 0 0-5-5H8a5 5 0 0 0-5 5v2"/>
            <circle cx="12" cy="16" r="5"/>
            <path d="M12 11v5"/>
            <path d="M9 16l3-3 3 3"/>
        </svg>
    );

    const WorkflowIcon = () => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D69E2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
    );

    const AccessIcon = () => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D69E2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
            <path d="M6 8h.01"/>
            <path d="M10 8h.01"/>
            <path d="M14 8h.01"/>
        </svg>
    );

    const SecurityIcon = () => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D69E2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <polyline points="9 12 11 14 15 10"/>
        </svg>
    );

    // Read Aloud function
    const readAboutAloud = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }

        const fullText = 
            "MedOx Pharmacy. Version 2.0. " +
            "CytochromeRX is proud to provide MedOx Pharmacy with a state-of-the-art inventory management solution. " +
            "This system combines intelligent tracking, automated workflows, and data-driven insights to help MedOx Pharmacy deliver exceptional pharmaceutical care. " +
            "Key features include: real-time inventory tracking, automated expiry alerts, multi-product receiving, intelligent analytics and reporting, and a mobile-friendly interface. " +
            "Concept and design by Jones Ezekiel Chikuni, Pharmacist. " +
            "Engineering by Kondwani Pax Munta, Pharmacy Tech and Software Engineer. " +
            "Built by CytochromeRX. Made in Malawi.";

        if (!window.speechSynthesis) {
            alert('Text-to-speech is not supported in your browser.');
            return;
        }

        const utterance = new SpeechSynthesisUtterance(fullText);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        utterance.onstart = () => {
            setIsReading(true);
        };
        
        utterance.onend = () => {
            setIsReading(false);
        };
        
        utterance.onerror = () => {
            setIsReading(false);
        };
        
        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    };

    const stopReading = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        setIsReading(false);
    };

    useEffect(() => {
        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    // About Modal
    const AboutModal = () => (
        <div className="about-overlay" onClick={() => {
            if (isReading) stopReading();
            setShowAbout(false);
        }}>
            <div className="about-modal" onClick={(e) => e.stopPropagation()}>
                <button className="about-close" onClick={() => {
                    if (isReading) stopReading();
                    setShowAbout(false);
                }}>✕</button>
                <div className="about-icon">⚕️</div>
                <h2 className="about-title">MedOx <span className="gold">Pharmacy</span></h2>
                <p className="about-version">Version 2.0.0</p>
                
                <div className="about-read-aloud">
                    <button 
                        className={`about-read-btn ${isReading ? 'reading' : ''}`}
                        onClick={isReading ? stopReading : readAboutAloud}
                    >
                        {isReading ? (
                            <>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="6" y="4" width="4" height="16"/>
                                    <rect x="14" y="4" width="4" height="16"/>
                                </svg>
                                Stop Reading
                            </>
                        ) : (
                            <>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="3 18 5 20 21 12 5 4 3 6 17 12 3 18"/>
                                </svg>
                                Read Aloud
                            </>
                        )}
                    </button>
                    {isReading && (
                        <span className="about-reading-indicator">
                            <span className="pulse-dot"></span>
                            Speaking...
                        </span>
                    )}
                </div>

                <div className="about-divider"></div>
                
                <p className="about-description">
                    CytochromeRX is proud to provide MedOx Pharmacy with a state-of-the-art inventory 
                    management solution. This system combines intelligent tracking, automated 
                    workflows, and data-driven insights to help MedOx Pharmacy deliver exceptional 
                    pharmaceutical care.
                </p>
                <div className="about-features-list">
                    <div className="about-feature-item">
                        <span className="about-feature-check">✓</span>
                        <span>Real-time inventory tracking</span>
                    </div>
                    <div className="about-feature-item">
                        <span className="about-feature-check">✓</span>
                        <span>Automated expiry alerts</span>
                    </div>
                    <div className="about-feature-item">
                        <span className="about-feature-check">✓</span>
                        <span>Multi-product receiving</span>
                    </div>
                    <div className="about-feature-item">
                        <span className="about-feature-check">✓</span>
                        <span>Intelligent analytics &amp; reporting</span>
                    </div>
                    <div className="about-feature-item">
                        <span className="about-feature-check">✓</span>
                        <span>Mobile-friendly interface</span>
                    </div>
                </div>
                <div className="about-divider"></div>
                <div className="about-creators">
                    <div className="about-creator">
                        <span className="about-creator-role">Concept &amp; Design</span>
                        <span className="about-creator-name">Jones Ezekiel Chikuni</span>
                        <span className="about-creator-badge">Pharmacist</span>
                    </div>
                    <div className="about-creator">
                        <span className="about-creator-role">Engineering</span>
                        <span className="about-creator-name">Kondwani Pax Munta</span>
                        <span className="about-creator-badge">Pharmacy Tech • Software Engineer</span>
                    </div>
                </div>
                <div className="about-divider"></div>
                <div className="about-powered">
                    <span className="about-powered-text">Built by</span>
                    <span className="about-powered-brand">CytochromeRX</span>
                </div>
                <div className="about-country">🇲🇼 Made in Malawi</div>
            </div>
        </div>
    );

    return (
        <div className="landing-page">
            {/* Background Effects */}
            <div className="landing-glow-1"></div>
            <div className="landing-glow-2"></div>
            <div className="landing-grid"></div>

            {/* Navigation */}
            <nav className="landing-nav">
                <div className="landing-brand">
                    <span className="brand-icon">⚕️</span>
                    <span className="brand-name">MedOx <span className="gold">Pharmacy</span></span>
                </div>
                <div className="landing-nav-right">
                    <button className="landing-btn-about" onClick={() => setShowAbout(true)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="16" x2="12" y2="12"/>
                            <line x1="12" y1="8" x2="12.01" y2="8"/>
                        </svg>
                        About App
                    </button>
                </div>
            </nav>

            {/* About Modal */}
            {showAbout && <AboutModal />}

            {/* Hero Section */}
            <div className="landing-hero">
                <div className="landing-hero-content">
                    <div className="landing-badge">
                        <span className="badge-dot"></span>
                        Enterprise Pharmacy Management
                    </div>
                    <h1 className="landing-title">
                        Transform Your
                        <br />
                        <span className="gold-text">Pharmacy Operations</span>
                    </h1>
                    <p className="landing-description">
                        Empowering pharmacies with intelligent inventory control, 
                        real-time visibility, and data-driven decision making. 
                        The complete solution for modern pharmaceutical management.
                    </p>
                    <div className="landing-actions">
                        <button className="landing-btn-primary-large" onClick={() => navigate('/login')}>
                            Start Free Trial
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="5" y1="12" x2="19" y2="12"/>
                                <polyline points="12 5 19 12 12 19"/>
                            </svg>
                        </button>
                        <button className="landing-btn-outline-large" onClick={() => navigate('/login')}>
                            Sign In
                        </button>
                    </div>
                    
                    {/* Updated Stats */}
                    <div className="landing-stats">
                        <div className="landing-stat">
                            <span className="stat-number">100%</span>
                            <span className="stat-label">Stock Accuracy</span>
                        </div>
                        <div className="landing-stat">
                            <span className="stat-number">24/7</span>
                            <span className="stat-label">System Uptime</span>
                        </div>
                        <div className="landing-stat">
                            <span className="stat-number">Zero</span>
                            <span className="stat-label">Data Loss</span>
                        </div>
                    </div>
                </div>
                <div className="landing-hero-visual">
                    <div className="landing-features-grid">
                        <div className="landing-feature-card">
                            <div className="feature-icon"><AnalyticsIcon /></div>
                            <div className="feature-title">Intelligent Analytics</div>
                            <div className="feature-desc">Data-driven insights for better decisions</div>
                        </div>
                        <div className="landing-feature-card">
                            <div className="feature-icon"><WorkflowIcon /></div>
                            <div className="feature-title">Automated Workflows</div>
                            <div className="feature-desc">Streamline daily pharmacy operations</div>
                        </div>
                        <div className="landing-feature-card">
                            <div className="feature-icon"><AccessIcon /></div>
                            <div className="feature-title">Cross-Platform Access</div>
                            <div className="feature-desc">Manage from anywhere, any device</div>
                        </div>
                        <div className="landing-feature-card">
                            <div className="feature-icon"><SecurityIcon /></div>
                            <div className="feature-title">Enterprise Security</div>
                            <div className="feature-desc">Bank-grade protection for your data</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="landing-footer">
                <div className="landing-footer-left">
                    <span>© 2026 MedOx Pharmacy. All rights reserved.</span>
                </div>
                <div className="landing-footer-right">
                    <span className="footer-credit">
                        <span className="credit-role">Built with ❤️ in Malawi</span>
                    </span>
                    <span className="footer-divider">|</span>
                    <span className="footer-powered">
                        <span className="powered-text">Powered by</span>
                        <span className="powered-brand">CytochromeRX</span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Landing;





