import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Placeholder.css';

const Profile = () => {
    const navigate = useNavigate();
    return (
        <div className="placeholder-container">
            <div className="placeholder-content">
                <div className="placeholder-icon">👤</div>
                <h1>Profile</h1>
                <p>This feature is coming soon. You'll be able to manage your profile settings.</p>
                <button className="placeholder-btn" onClick={() => navigate('/dashboard')}>
                    ← Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default Profile;
