import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './ForgotPassword.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitted, setSubmitted] = useState(false);

    // Modern SVG Icons
    const MailIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
        </svg>
    );

    const ArrowLeftIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
        </svg>
    );

    const CheckIcon = () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
        </svg>
    );

    const SpinnerIcon = () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spinner-svg">
            <line x1="12" y1="2" x2="12" y2="6"/>
            <line x1="12" y1="18" x2="12" y2="22"/>
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
            <line x1="2" y1="12" x2="6" y2="12"/>
            <line x1="18" y1="12" x2="22" y2="12"/>
            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
        </svg>
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email) {
            setError('Please enter your email address');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await api.post('/auth/forgot-password', { email });
            
            if (response.data.success) {
                setSuccess('Password reset instructions have been sent to your email');
                setSubmitted(true);
            } else {
                setError(response.data.message || 'Something went wrong');
            }
        } catch (err) {
            if (err.response) {
                setError(err.response.data.message || 'Failed to send reset link');
            } else if (err.request) {
                setError('No response from server. Please try again.');
            } else {
                setError('An error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-page">
            <div className="forgot-password-container">
                {/* Header */}
                <div className="forgot-password-header">
                    <div className="logo">
                        <span className="logo-icon">✦</span>
                        <span className="logo-text">MedOx Pharmacy</span>
                    </div>
                    <h1>Forgot Password</h1>
                    <p>Enter your email to receive a reset link</p>
                </div>

                {/* Alert Messages */}
                {error && (
                    <div className="alert alert-error">
                        <span className="alert-icon">⚠️</span>
                        <span className="alert-message">{error}</span>
                        <button className="alert-close" onClick={() => setError('')}>×</button>
                    </div>
                )}

                {success && (
                    <div className="alert alert-success">
                        <span className="alert-icon"><CheckIcon /></span>
                        <span className="alert-message">{success}</span>
                        {submitted && (
                            <div className="alert-actions">
                                <Link to="/login" className="btn-back-to-login">
                                    Back to Login
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* Form - Only show if not submitted */}
                {!submitted && (
                    <form onSubmit={handleSubmit} className="forgot-password-form">
                        <div className="form-group">
                            <label htmlFor="email">
                                Email Address
                                <span className="required">*</span>
                            </label>
                            <div className="input-wrapper">
                                <span className="input-icon"><MailIcon /></span>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    disabled={loading}
                                    className={error ? 'input-error' : ''}
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="btn-submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <SpinnerIcon />
                                    <span>Sending...</span>
                                </>
                            ) : (
                                <>
                                    <span>Send Reset Link</span>
                                </>
                            )}
                        </button>

                        <div className="form-footer">
                            <Link to="/login" className="back-to-login">
                                <ArrowLeftIcon /> Back to Login
                            </Link>
                        </div>
                    </form>
                )}

                {/* Footer */}
                <div className="forgot-password-footer">
                    <p>© 2026 MedOx Pharmacy. All rights reserved.</p>
                    <p className="powered-by">Powered by CytochromeRX</p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
