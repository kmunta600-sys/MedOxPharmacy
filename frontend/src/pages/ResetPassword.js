import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import './Login.css';

const ResetPassword = () => {
    const navigate = useNavigate();
    const { token } = useParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [validating, setValidating] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);

    useEffect(() => {
        validateToken();
    }, []);

    const validateToken = async () => {
        try {
            const response = await api.get(`/auth/validate-token/${token}`);
            if (response.data.success) {
                setTokenValid(true);
            } else {
                setError('Invalid or expired reset link');
            }
        } catch (err) {
            setError('Invalid or expired reset link');
        } finally {
            setValidating(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const response = await api.post('/auth/reset-password', {
                token,
                newPassword: password
            });

            if (response.data.success) {
                setSuccess('Password reset successfully! Redirecting to login...');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(response.data.message || 'Failed to reset password');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error resetting password');
        } finally {
            setLoading(false);
        }
    };

    if (validating) {
        return (
            <div className="login-container">
                <div className="login-box">
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <p>Validating reset link...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!tokenValid) {
        return (
            <div className="login-container">
                <div className="login-box">
                    <div className="login-header">
                        <h1>❌ Invalid Link</h1>
                    </div>
                    <div className="alert alert-error">
                        {error}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <button 
                            onClick={() => navigate('/forgot-password')}
                            className="btn-login"
                        >
                            Request New Reset Link
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <h1>🔐 Reset Password</h1>
                    <p>Enter your new password</p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="alert alert-success">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new password"
                            required
                            disabled={loading || success}
                            minLength="6"
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            required
                            disabled={loading || success}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn-login" 
                        disabled={loading || success}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>

                <div className="login-footer">
                    <button 
                        onClick={() => navigate('/login')}
                        className="link-btn"
                    >
                        ← Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
