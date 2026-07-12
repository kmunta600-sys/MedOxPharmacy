import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Dashboard.css';

const Settings = () => {
    const navigate = useNavigate();
    
    // State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('general');
    
    // General Settings
    const [generalSettings, setGeneralSettings] = useState({
        facilityName: 'MedOx Pharmacy',
        facilityAddress: '123 Pharmacy Street, City',
        facilityPhone: '+265 888 888 888',
        facilityEmail: 'info@medoxpharmacy.com',
        facilityLicense: 'PH-2024-001',
        currency: 'MK',
        taxRate: 0,
        lowStockThreshold: 10,
        criticalStockThreshold: 5
    });
    
    // User Profile
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        email: '',
        role: '',
        phone: '',
        notificationEmail: ''
    });
    
    // Password Change
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    // System Settings
    const [systemSettings, setSystemSettings] = useState({
        expiryWarningDays: 30,
        autoBackup: true,
        enableFEFO: true,
        requireApproval: true,
        enableNotifications: true
    });
    
    // Backup Settings
    const [backupSettings, setBackupSettings] = useState({
        autoBackupEnabled: true,
        backupFrequency: 'daily',
        backupTime: '23:00',
        backupLocation: 'C:\\MedOxPharmacy\\backups'
    });

    // Staff Management State
    const [staff, setStaff] = useState([]);
    const [staffLoading, setStaffLoading] = useState(false);
    const [showCreateStaffModal, setShowCreateStaffModal] = useState(false);
    const [showStaffPerformanceModal, setShowStaffPerformanceModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [staffPerformance, setStaffPerformance] = useState(null);
    const [filterRole, setFilterRole] = useState('');
    
    // Product Delete State
    const [showDeleteProductModal, setShowDeleteProductModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [deleteProductLoading, setDeleteProductLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [productSearchTerm, setProductSearchTerm] = useState('');
    
    // Available roles for intelligent dropdown
    const [availableRoles, setAvailableRoles] = useState(['Pharmacist', 'Admin', 'Assistant', 'Manager']);
    const [roleInput, setRoleInput] = useState('');
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const [filteredRoles, setFilteredRoles] = useState([]);
    const roleInputRef = useRef(null);
    
    // New Staff Form
    const [newStaff, setNewStaff] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'Pharmacist',
        phone: '',
        address: '',
        notificationEmail: ''
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        
        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            setUser(userData);
            setProfile({
                firstName: userData?.firstName || '',
                lastName: userData?.lastName || '',
                email: userData?.email || '',
                role: userData?.role || 'Pharmacist',
                phone: userData?.phone || '',
                notificationEmail: userData?.notificationEmail || ''
            });
        } catch (e) {
            console.error('Error parsing user:', e);
        }
        
        loadSettings();
        loadAvailableRoles();
        loadProducts();
    }, []);

    useEffect(() => {
        if (activeTab === 'staff') {
            loadStaff();
        }
        if (activeTab === 'products') {
            loadProducts();
        }
    }, [activeTab]);

    useEffect(() => {
        if (roleInput) {
            const filtered = availableRoles.filter(role => 
                role.toLowerCase().includes(roleInput.toLowerCase())
            );
            setFilteredRoles(filtered);
            setShowRoleDropdown(true);
        } else {
            setFilteredRoles(availableRoles);
            setShowRoleDropdown(false);
        }
    }, [roleInput, availableRoles]);

    const loadAvailableRoles = async () => {
        try {
            const response = await api.get('/settings/roles');
            if (response.data.success) {
                setAvailableRoles(response.data.data);
            }
        } catch (err) {
            console.log('Using default roles');
        }
    };

    const saveRoles = async (roles) => {
        try {
            await api.post('/settings/roles', { roles });
        } catch (err) {
            console.error('Error saving roles:', err);
        }
    };

    const addRole = () => {
        if (roleInput && !availableRoles.includes(roleInput)) {
            const newRoles = [...availableRoles, roleInput];
            setAvailableRoles(newRoles);
            saveRoles(newRoles);
            setNewStaff({ ...newStaff, role: roleInput });
            setRoleInput('');
            setShowRoleDropdown(false);
            setSuccess(`Role "${roleInput}" added successfully!`);
            setTimeout(() => setSuccess(''), 3000);
        }
    };

    const deleteRole = (roleToDelete) => {
        const defaultRoles = ['Pharmacist', 'Admin', 'Assistant', 'Manager'];
        if (defaultRoles.includes(roleToDelete)) {
            setError('Cannot delete default roles');
            setTimeout(() => setError(''), 3000);
            return;
        }
        
        if (window.confirm(`Are you sure you want to delete the role "${roleToDelete}"?`)) {
            const newRoles = availableRoles.filter(role => role !== roleToDelete);
            setAvailableRoles(newRoles);
            saveRoles(newRoles);
            if (newStaff.role === roleToDelete) {
                setNewStaff({ ...newStaff, role: newRoles[0] || '' });
            }
            setSuccess(`Role "${roleToDelete}" deleted successfully!`);
            setTimeout(() => setSuccess(''), 3000);
        }
    };

    const selectRole = (role) => {
        setNewStaff({ ...newStaff, role });
        setRoleInput('');
        setShowRoleDropdown(false);
    };

    const loadSettings = async () => {
        setLoading(true);
        try {
            const response = await api.get('/settings');
            if (response.data.success) {
                const data = response.data.data;
                setGeneralSettings({
                    facilityName: data.pharmacyName || 'MedOx Pharmacy',
                    facilityAddress: data.pharmacyAddress || '123 Pharmacy Street, City',
                    facilityPhone: data.pharmacyPhone || '+265 888 888 888',
                    facilityEmail: data.pharmacyEmail || 'info@medoxpharmacy.com',
                    facilityLicense: data.facilityLicense || '',
                    currency: data.currency || 'MWK',
                    taxRate: data.taxRate || 0,
                    lowStockThreshold: data.lowStockThreshold || 10,
                    criticalStockThreshold: data.criticalStockThreshold || 5
                });
                setSystemSettings({
                    expiryWarningDays: data.expiryWarningDays || 30,
                    autoBackup: data.autoBackup !== undefined ? data.autoBackup : true,
                    enableFEFO: data.enableFEFO !== undefined ? data.enableFEFO : true,
                    requireApproval: data.requireApproval !== undefined ? data.requireApproval : true,
                    enableNotifications: data.enableNotifications !== undefined ? data.enableNotifications : true
                });
                setBackupSettings({
                    autoBackupEnabled: data.autoBackup !== undefined ? data.autoBackup : true,
                    backupFrequency: data.backupFrequency || 'daily',
                    backupTime: data.backupTime || '23:00',
                    backupLocation: data.backupLocation || 'C:\\MedOxPharmacy\\backups'
                });
            }
        } catch (err) {
            console.log('Using default settings');
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        
        try {
            const settingsData = {
                pharmacyName: generalSettings.facilityName,
                pharmacyAddress: generalSettings.facilityAddress,
                pharmacyPhone: generalSettings.facilityPhone,
                pharmacyEmail: generalSettings.facilityEmail,
                facilityLicense: generalSettings.facilityLicense,
                currency: generalSettings.currency,
                taxRate: generalSettings.taxRate,
                lowStockThreshold: generalSettings.lowStockThreshold,
                criticalStockThreshold: generalSettings.criticalStockThreshold,
                expiryWarningDays: systemSettings.expiryWarningDays,
                autoBackup: systemSettings.autoBackup,
                enableFEFO: systemSettings.enableFEFO,
                requireApproval: systemSettings.requireApproval,
                enableNotifications: systemSettings.enableNotifications,
                backupFrequency: backupSettings.backupFrequency,
                backupTime: backupSettings.backupTime,
                backupLocation: backupSettings.backupLocation
            };
            
            const response = await api.put('/settings', settingsData);
            
            if (response.data.success) {
                setSuccess('Settings saved successfully!');
                await loadSettings();
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError('Failed to save settings');
            }
        } catch (err) {
            console.error('Save settings error:', err.response?.data || err.message);
            setError('Error saving settings: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        
        try {
            const response = await api.put('/auth/profile', profile);
            if (response.data.success) {
                setSuccess('Profile updated successfully!');
                const userData = JSON.parse(localStorage.getItem('user') || '{}');
                const updatedUser = { ...userData, ...profile };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            setError('Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    const changePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match');
            setLoading(false);
            return;
        }
        
        if (passwordData.newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }
        
        try {
            const response = await api.post('/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            
            if (response.data.success) {
                setSuccess('Password changed successfully!');
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(response.data.message || 'Failed to change password');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error changing password');
        } finally {
            setLoading(false);
        }
    };

    const loadStaff = async () => {
        setStaffLoading(true);
        try {
            const response = await api.get('/staff');
            if (response.data.success) {
                let staffData = response.data.data;
                if (filterRole) {
                    staffData = staffData.filter(member => member.role === filterRole);
                }
                setStaff(staffData);
            }
        } catch (err) {
            console.error('Error loading staff:', err);
            setError('Failed to load staff');
        } finally {
            setStaffLoading(false);
        }
    };

    const loadProducts = async () => {
        setProductsLoading(true);
        try {
            const response = await api.get('/products');
            if (response.data.success) {
                setProducts(response.data.data || []);
            }
        } catch (err) {
            console.error('Error loading products:', err);
        } finally {
            setProductsLoading(false);
        }
    };

    const handleCreateStaff = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        
        const staffData = {
            firstName: newStaff.firstName,
            lastName: newStaff.lastName,
            email: newStaff.email,
            password: newStaff.password,
            role: newStaff.role.toLowerCase(),
            phone: newStaff.phone || '',
            address: newStaff.address || '',
            notificationEmail: newStaff.notificationEmail || ''
        };
        
        try {
            const response = await api.post('/staff', staffData);
            if (response.data.success) {
                setSuccess('Staff member created successfully!');
                setShowCreateStaffModal(false);
                setNewStaff({ 
                    firstName: '', 
                    lastName: '', 
                    email: '', 
                    password: '', 
                    role: 'Pharmacist', 
                    phone: '', 
                    address: '',
                    notificationEmail: '' 
                });
                loadStaff();
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(response.data.message || 'Failed to create staff');
            }
        } catch (err) {
            console.error('Create staff error:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Error creating staff');
        } finally {
            setLoading(false);
        }
    };

    const toggleStaffStatus = async (userId, currentStatus) => {
        if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this staff member?`)) return;
        
        setLoading(true);
        try {
            const response = await api.put(`/users/${userId}/status`, { isActive: !currentStatus });
            if (response.data.success) {
                setSuccess(`Staff ${currentStatus ? 'deactivated' : 'activated'} successfully!`);
                loadStaff();
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            setError('Failed to update staff status');
        } finally {
            setLoading(false);
        }
    };

    const deleteStaff = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this staff member? This action cannot be undone.')) return;
        
        setLoading(true);
        try {
            const response = await api.delete(`/users/${userId}`);
            if (response.data.success) {
                setSuccess('Staff member deleted successfully!');
                loadStaff();
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            setError('Failed to delete staff');
        } finally {
            setLoading(false);
        }
    };

    const viewStaffPerformance = async (userId) => {
        setSelectedStaff(userId);
        setStaffLoading(true);
        try {
            const response = await api.get(`/users/${userId}/performance`);
            if (response.data.success) {
                setStaffPerformance(response.data.data);
                setShowStaffPerformanceModal(true);
            }
        } catch (err) {
            setError('Failed to load staff performance');
        } finally {
            setStaffLoading(false);
        }
    };

    const handleBackupNow = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        
        try {
            const response = await api.post('/backup/create');
            
            if (response.data.success) {
                setSuccess(`Backup created successfully! File: ${response.data.data.file}`);
                setTimeout(() => setSuccess(''), 5000);
            } else {
                setError('Backup failed: ' + response.data.message);
            }
        } catch (err) {
            console.error('Backup error:', err);
            setError('Error creating backup: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (productId) => {
        const userRole = user?.role || 'admin';
        if (userRole !== 'pharmacist' && userRole !== 'admin') {
            setError('Only pharmacists and admins can delete products');
            setTimeout(() => setError(''), 3000);
            return;
        }

        if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone!')) return;

        setDeleteProductLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await api.delete(`/products/${productId}`);
            if (response.data.success) {
                setSuccess('Product deleted successfully!');
                setShowDeleteProductModal(false);
                setProductToDelete(null);
                loadProducts();
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError('Failed to delete product: ' + response.data.message);
            }
        } catch (err) {
            console.error('Delete product error:', err);
            setError('Error deleting product: ' + (err.response?.data?.message || err.message));
        } finally {
            setDeleteProductLoading(false);
        }
    };

    const openDeleteProductModal = (product) => {
        const userRole = user?.role || 'admin';
        if (userRole !== 'pharmacist' && userRole !== 'admin') {
            setError('Only pharmacists and admins can delete products');
            setTimeout(() => setError(''), 3000);
            return;
        }
        setProductToDelete(product);
        setShowDeleteProductModal(true);
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    // SVG Icons
    const BackIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
        </svg>
    );

    const SettingsIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>
    );

    const UserIcon = () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
        </svg>
    );

    const LockIcon = () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
    );

    const SystemIcon = () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="2" ry="2"/>
            <line x1="2" y1="9" x2="22" y2="9"/>
            <line x1="2" y1="15" x2="22" y2="15"/>
            <line x1="9" y1="22" x2="9" y2="9"/>
            <line x1="15" y1="22" x2="15" y2="9"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
        </svg>
    );

    const BackupIcon = () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
    );

    const UsersIcon = () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
    );

    const ProductsIcon = () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <line x1="16" y1="21" x2="16" y2="17"/>
            <line x1="8" y1="21" x2="8" y2="17"/>
            <line x1="2" y1="11" x2="22" y2="11"/>
        </svg>
    );

    const RefreshIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
    );

    const WarningIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v4"/>
            <path d="M12 17h.01"/>
            <circle cx="12" cy="12" r="10"/>
        </svg>
    );

    const LogoutIcon = () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
    );

    const CloseIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
    );

    const AddIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
    );

    const DeleteIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
        </svg>
    );

    const LockIcon2 = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
    );

    const tabs = [
        { id: 'general', label: 'General', icon: <SettingsIcon /> },
        { id: 'profile', label: 'Profile', icon: <UserIcon /> },
        { id: 'security', label: 'Security', icon: <LockIcon /> },
        { id: 'system', label: 'System', icon: <SystemIcon /> },
        { id: 'staff', label: 'Staff', icon: <UsersIcon /> },
        { id: 'products', label: 'Products', icon: <ProductsIcon /> },
        { id: 'backup', label: 'Backup', icon: <BackupIcon /> }
    ];

    return (
        <div className="dashboard-container">
            <div className="dashboard-main" style={{ marginLeft: '0', padding: '30px' }}>
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
                            <SettingsIcon />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#FFFFFF', margin: '0' }}>Settings</h1>
                            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', margin: '0' }}>System configuration and preferences</p>
                        </div>
                    </div>
                    <button onClick={() => navigate('/dashboard')} style={{
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

                {/* Error/Success Messages */}
                {error && <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '6px', color: '#EF4444', fontSize: '12px', marginBottom: '14px' }}>{error}</div>}
                {success && <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '6px', color: '#10B981', fontSize: '12px', marginBottom: '14px' }}>{success}</div>}

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '4px',
                    marginBottom: '20px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderRadius: '10px',
                    padding: '4px',
                    overflow: 'auto',
                    flexWrap: 'wrap'
                }}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '8px 16px',
                                background: activeTab === tab.id ? 'rgba(214,158,46,0.15)' : 'transparent',
                                border: activeTab === tab.id ? '1px solid rgba(214,158,46,0.2)' : '1px solid transparent',
                                borderRadius: '6px',
                                color: activeTab === tab.id ? '#D69E2E' : 'rgba(255,255,255,0.3)',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontFamily: 'inherit',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={(e) => {
                                if (activeTab !== tab.id) {
                                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeTab !== tab.id) {
                                    e.currentTarget.style.color = 'rgba(255,255,255,0.3)';
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderRadius: '10px',
                    padding: '20px'
                }}>
                    {/* General Settings */}
                    {activeTab === 'general' && (
                        <div>
                            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#FFFFFF', marginBottom: '16px' }}>General Settings</h2>
                            <form onSubmit={(e) => { e.preventDefault(); saveSettings(); }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                    <div>
                                        <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: '4px' }}>Facility Name</label>
                                        <input type="text" value={generalSettings.facilityName} onChange={(e) => setGeneralSettings({ ...generalSettings, facilityName: e.target.value })} style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#FFFFFF', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: '4px' }}>Facility Address</label>
                                        <input type="text" value={generalSettings.facilityAddress} onChange={(e) => setGeneralSettings({ ...generalSettings, facilityAddress: e.target.value })} style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#FFFFFF', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: '4px' }}>Phone Number</label>
                                        <input type="text" value={generalSettings.facilityPhone} onChange={(e) => setGeneralSettings({ ...generalSettings, facilityPhone: e.target.value })} style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#FFFFFF', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: '4px' }}>Email Address</label>
                                        <input type="email" value={generalSettings.facilityEmail} onChange={(e) => setGeneralSettings({ ...generalSettings, facilityEmail: e.target.value })} style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#FFFFFF', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: '4px' }}>License Number</label>
                                        <input type="text" value={generalSettings.facilityLicense} onChange={(e) => setGeneralSettings({ ...generalSettings, facilityLicense: e.target.value })} style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#FFFFFF', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: '4px' }}>Currency</label>
                                        <input type="text" value={generalSettings.currency} onChange={(e) => setGeneralSettings({ ...generalSettings, currency: e.target.value })} style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#FFFFFF', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: '4px' }}>Low Stock Threshold</label>
                                        <input type="number" value={generalSettings.lowStockThreshold} onChange={(e) => setGeneralSettings({ ...generalSettings, lowStockThreshold: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#FFFFFF', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: '4px' }}>Critical Stock Threshold</label>
                                        <input type="number" value={generalSettings.criticalStockThreshold} onChange={(e) => setGeneralSettings({ ...generalSettings, criticalStockThreshold: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#FFFFFF', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
                                    </div>
                                </div>
                                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="submit" disabled={loading} style={{
                                        padding: '8px 20px',
                                        background: 'linear-gradient(135deg, #D69E2E, #B8860B)',
                                        border: 'none',
                                        borderRadius: '6px',
                                        color: '#FFFFFF',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        fontFamily: 'inherit',
                                        opacity: loading ? 0.5 : 1
                                    }}>
                                        {loading ? 'Saving...' : 'Save Settings'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Profile Settings */}
                    {activeTab === 'profile' && (
                        <div>
                            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#FFFFFF', marginBottom: '16px' }}>User Profile</h2>
                            <form onSubmit={updateProfile}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                    <div>
                                        <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: '4px' }}>First Name</label>
                                        <input type="text" value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#FFFFFF', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: '4px' }}>Last Name</label>
                                        <input type="text" value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#FFFFFF', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: '4px' }}>Email</label>
                                        <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#FFFFFF', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: '4px' }}>Role</label>
                                        <input type="text" value={profile.role} disabled style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', color: 'rgba(255,255,255,0.2)', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: '4px' }}>Phone</label>
                                        <input type="text" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#FFFFFF', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: '4px' }}>Notification Email</label>
                                        <input
                                            type="email"
                                            value={profile.notificationEmail || ''}
                                            onChange={(e) => setProfile({ ...profile, notificationEmail: e.target.value })}
                                            placeholder="Email for password reset notifications"
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                background: 'rgba(255,255,255,0.04)',
                                                border: '1px solid rgba(255,255,255,0.06)',
                                                borderRadius: '6px',
                                                color: '#FFFFFF',
                                                fontSize: '13px',
                                                outline: 'none',
                                                fontFamily: 'inherit'
                                            }}
                                        />
                                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.1)', marginTop: '2px' }}>
                                            This email will receive password reset links
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="submit" disabled={loading} style={{
                                        padding: '8px 20px',
                                        background: 'linear-gradient(135deg, #D69E2E, #B8860B)',
                                        border: 'none',
                                        borderRadius: '6px',
                                        color: '#FFFFFF',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        fontFamily: 'inherit',
                                        opacity: loading ? 0.5 : 1
                                    }}>
                                        {loading ? 'Updating...' : 'Update Profile'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Security Settings */}
                    {activeTab === 'security' && (
                        <div>
                            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#FFFFFF', marginBottom: '16px' }}>Change Password</h2>
                            <form onSubmit={changePassword}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                    <div>
                                        <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: '4px' }}>Current Password</label>
                                        <input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} required style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#FFFFFF', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
                                    </div>
                                    <div></div>
                                    <div>
                                        <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: '4px' }}>New Password</label>
                                        <input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} required minLength="6" style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#FFFFFF', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: '4px' }}>Confirm New Password</label>
                                        <input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} required style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#FFFFFF', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
                                    </div>
                                </div>
                                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="submit" disabled={loading} style={{
                                        padding: '8px 20px',
                                        background: 'linear-gradient(135deg, #D69E2E, #B8860B)',
                                        border: 'none',
                                        borderRadius: '6px',
                                        color: '#FFFFFF',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        fontFamily: 'inherit',
                                        opacity: loading ? 0.5 : 1
                                    }}>
                                        {loading ? 'Changing...' : 'Change Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* System Settings */}
                    {activeTab === 'system' && (
                        <div>
                            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#FFFFFF', marginBottom: '16px' }}>System Settings</h2>
                            <form onSubmit={(e) => { e.preventDefault(); saveSettings(); }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                    <div>
                                        <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: '4px' }}>Expiry Warning Days</label>
                                        <input type="number" value={systemSettings.expiryWarningDays} onChange={(e) => setSystemSettings({ ...systemSettings, expiryWarningDays: parseInt(e.target.value) || 30 })} style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#FFFFFF', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '20px' }}>
                                        <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                            <input type="checkbox" checked={systemSettings.autoBackup} onChange={(e) => setSystemSettings({ ...systemSettings, autoBackup: e.target.checked })} style={{ accentColor: '#D69E2E' }} />
                                            Auto Backup
                                        </label>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '20px' }}>
                                        <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                            <input type="checkbox" checked={systemSettings.enableFEFO} onChange={(e) => setSystemSettings({ ...systemSettings, enableFEFO: e.target.checked })} style={{ accentColor: '#D69E2E' }} />
                                            Enable FEFO
                                        </label>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '20px' }}>
                                        <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                            <input type="checkbox" checked={systemSettings.requireApproval} onChange={(e) => setSystemSettings({ ...systemSettings, requireApproval: e.target.checked })} style={{ accentColor: '#D69E2E' }} />
                                            Require Approval for Adjustments
                                        </label>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '20px' }}>
                                        <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                            <input type="checkbox" checked={systemSettings.enableNotifications} onChange={(e) => setSystemSettings({ ...systemSettings, enableNotifications: e.target.checked })} style={{ accentColor: '#D69E2E' }} />
                                            Enable Notifications
                                        </label>
                                    </div>
                                </div>
                                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="submit" disabled={loading} style={{
                                        padding: '8px 20px',
                                        background: 'linear-gradient(135deg, #D69E2E, #B8860B)',
                                        border: 'none',
                                        borderRadius: '6px',
                                        color: '#FFFFFF',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        fontFamily: 'inherit',
                                        opacity: loading ? 0.5 : 1
                                    }}>
                                        {loading ? 'Saving...' : 'Save Settings'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Staff Management */}
                    {activeTab === 'staff' && (
                        <div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '16px',
                                flexWrap: 'wrap',
                                gap: '10px'
                            }}>
                                <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#FFFFFF', margin: '0' }}>Staff Management</h2>
                                <button
                                    onClick={() => setShowCreateStaffModal(true)}
                                    style={{
                                        padding: '8px 16px',
                                        background: 'linear-gradient(135deg, #D69E2E, #B8860B)',
                                        border: 'none',
                                        borderRadius: '6px',
                                        color: '#FFFFFF',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        fontFamily: 'inherit',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <AddIcon /> Add Staff
                                </button>
                            </div>

                            {staffLoading ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.1)' }}>Loading...</div>
                            ) : staff.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.1)' }}>No staff members found</div>
                            ) : (
                                <div style={{ overflow: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'rgba(255,255,255,0.2)', fontWeight: '400' }}>Name</th>
                                                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'rgba(255,255,255,0.2)', fontWeight: '400' }}>Email</th>
                                                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'rgba(255,255,255,0.2)', fontWeight: '400' }}>Role</th>
                                                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'rgba(255,255,255,0.2)', fontWeight: '400' }}>Status</th>
                                                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'rgba(255,255,255,0.2)', fontWeight: '400' }}>Joined</th>
                                                <th style={{ padding: '10px 12px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontWeight: '400' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {staff.map((member) => (
                                                <tr key={member._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                    <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.8)' }}>
                                                        {member.firstName} {member.lastName}
                                                    </td>
                                                    <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.4)' }}>{member.email}</td>
                                                    <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.4)' }}>
                                                        <span style={{
                                                            padding: '2px 10px',
                                                            borderRadius: '12px',
                                                            background: member.role === 'Admin' ? 'rgba(214,158,46,0.1)' : 'rgba(16,185,129,0.1)',
                                                            color: member.role === 'Admin' ? '#D69E2E' : '#10B981',
                                                            fontSize: '11px',
                                                            border: '1px solid ' + (member.role === 'Admin' ? 'rgba(214,158,46,0.2)' : 'rgba(16,185,129,0.2)')
                                                        }}>
                                                            {member.role || 'Pharmacist'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '10px 12px' }}>
                                                        <span style={{
                                                            padding: '2px 10px',
                                                            borderRadius: '12px',
                                                            background: member.isActive !== false ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                                            color: member.isActive !== false ? '#10B981' : '#EF4444',
                                                            fontSize: '11px',
                                                            border: '1px solid ' + (member.isActive !== false ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)')
                                                        }}>
                                                            {member.isActive !== false ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
                                                        {new Date(member.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                            <button
                                                                onClick={() => viewStaffPerformance(member._id)}
                                                                style={{
                                                                    padding: '4px 10px',
                                                                    background: 'rgba(59,130,246,0.1)',
                                                                    border: '1px solid rgba(59,130,246,0.2)',
                                                                    borderRadius: '4px',
                                                                    color: '#3B82F6',
                                                                    cursor: 'pointer',
                                                                    fontSize: '11px',
                                                                    fontFamily: 'inherit'
                                                                }}
                                                            >
                                                                Performance
                                                            </button>
                                                            <button
                                                                onClick={() => toggleStaffStatus(member._id, member.isActive !== false)}
                                                                style={{
                                                                    padding: '4px 10px',
                                                                    background: member.isActive !== false ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                                                                    border: '1px solid ' + (member.isActive !== false ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'),
                                                                    borderRadius: '4px',
                                                                    color: member.isActive !== false ? '#EF4444' : '#10B981',
                                                                    cursor: 'pointer',
                                                                    fontSize: '11px',
                                                                    fontFamily: 'inherit'
                                                                }}
                                                            >
                                                                {member.isActive !== false ? 'Deactivate' : 'Activate'}
                                                            </button>
                                                            <button
                                                                onClick={() => deleteStaff(member._id)}
                                                                style={{
                                                                    padding: '4px 10px',
                                                                    background: 'rgba(239,68,68,0.1)',
                                                                    border: '1px solid rgba(239,68,68,0.2)',
                                                                    borderRadius: '4px',
                                                                    color: '#EF4444',
                                                                    cursor: 'pointer',
                                                                    fontSize: '11px',
                                                                    fontFamily: 'inherit'
                                                                }}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Products Management */}
                    {activeTab === 'products' && (
                        <div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '16px',
                                flexWrap: 'wrap',
                                gap: '10px'
                            }}>
                                <div>
                                    <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#FFFFFF', margin: '0' }}>Product Management</h2>
                                    <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', margin: '0' }}>
                                        <LockIcon2 /> Pharmacist access - You can delete products
                                    </p>
                                </div>
                            </div>

                            <div style={{
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.04)',
                                borderRadius: '8px',
                                padding: '16px',
                                marginBottom: '16px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1, minWidth: '150px' }}>
                                        <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: '4px' }}>
                                            Search Products
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Search by name or code..."
                                            value={productSearchTerm}
                                            onChange={(e) => setProductSearchTerm(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                background: 'rgba(255,255,255,0.04)',
                                                border: '1px solid rgba(255,255,255,0.06)',
                                                borderRadius: '6px',
                                                color: '#FFFFFF',
                                                fontSize: '13px',
                                                outline: 'none',
                                                fontFamily: 'inherit'
                                            }}
                                            onFocus={(e) => {
                                                e.currentTarget.style.borderColor = 'rgba(214,158,46,0.3)';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                                        <button
                                            style={{
                                                padding: '8px 16px',
                                                background: 'rgba(214,158,46,0.1)',
                                                border: '1px solid rgba(214,158,46,0.2)',
                                                borderRadius: '6px',
                                                color: '#D69E2E',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                fontFamily: 'inherit'
                                            }}
                                            onClick={() => loadProducts()}
                                        >
                                            <RefreshIcon /> Refresh
                                        </button>
                                        <button
                                            style={{
                                                padding: '8px 16px',
                                                background: 'rgba(255,255,255,0.04)',
                                                border: '1px solid rgba(255,255,255,0.06)',
                                                borderRadius: '6px',
                                                color: 'rgba(255,255,255,0.2)',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                fontFamily: 'inherit'
                                            }}
                                            onClick={() => setProductSearchTerm('')}
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {productsLoading ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.1)' }}>Loading products...</div>
                            ) : (
                                <div style={{
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.04)',
                                    borderRadius: '8px',
                                    overflow: 'auto',
                                    maxHeight: '400px'
                                }}>
                                    {products.filter(p => 
                                        p.name?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                                        p.code?.toLowerCase().includes(productSearchTerm.toLowerCase())
                                    ).length === 0 ? (
                                        <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.1)' }}>
                                            No products found
                                        </div>
                                    ) : (
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.02)' }}>
                                                    <th style={{ padding: '10px 12px', textAlign: 'left', color: 'rgba(255,255,255,0.2)', fontWeight: '400' }}>Name</th>
                                                    <th style={{ padding: '10px 12px', textAlign: 'left', color: 'rgba(255,255,255,0.2)', fontWeight: '400' }}>Code</th>
                                                    <th style={{ padding: '10px 12px', textAlign: 'left', color: 'rgba(255,255,255,0.2)', fontWeight: '400' }}>Stock</th>
                                                    <th style={{ padding: '10px 12px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontWeight: '400' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {products
                                                    .filter(p => 
                                                        p.name?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                                                        p.code?.toLowerCase().includes(productSearchTerm.toLowerCase())
                                                    )
                                                    .map((product) => (
                                                        <tr key={product._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                            <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.8)' }}>{product.name}</td>
                                                            <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.3)' }}>{product.code || 'N/A'}</td>
                                                            <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.3)' }}>{product.quantityOnHand || 0}</td>
                                                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                                                <button
                                                                    onClick={() => openDeleteProductModal(product)}
                                                                    style={{
                                                                        padding: '4px 12px',
                                                                        background: 'rgba(239,68,68,0.1)',
                                                                        border: '1px solid rgba(239,68,68,0.2)',
                                                                        borderRadius: '4px',
                                                                        color: '#EF4444',
                                                                        cursor: 'pointer',
                                                                        fontSize: '11px',
                                                                        fontFamily: 'inherit',
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        gap: '4px'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                                                                    }}
                                                                >
                                                                    <DeleteIcon /> Delete
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                }
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Backup Settings */}
                    {activeTab === 'backup' && (
                        <div>
                            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#FFFFFF', marginBottom: '16px' }}>Backup Settings</h2>
                            <form onSubmit={(e) => { e.preventDefault(); saveSettings(); }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '10px' }}>
                                        <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                            <input type="checkbox" checked={backupSettings.autoBackupEnabled} onChange={(e) => setBackupSettings({ ...backupSettings, autoBackupEnabled: e.target.checked })} style={{ accentColor: '#D69E2E' }} />
                                            Enable Auto Backup
                                        </label>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: '4px' }}>Backup Frequency</label>
                                        <select value={backupSettings.backupFrequency} onChange={(e) => setBackupSettings({ ...backupSettings, backupFrequency: e.target.value })} style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#FFFFFF', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}>
                                            <option value="hourly" style={{ background: '#1A1A1A' }}>Hourly</option>
                                            <option value="daily" style={{ background: '#1A1A1A' }}>Daily</option>
                                            <option value="weekly" style={{ background: '#1A1A1A' }}>Weekly</option>
                                            <option value="monthly" style={{ background: '#1A1A1A' }}>Monthly</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: '4px' }}>Backup Time</label>
                                        <input type="time" value={backupSettings.backupTime} onChange={(e) => setBackupSettings({ ...backupSettings, backupTime: e.target.value })} style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#FFFFFF', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: '4px' }}>Backup Location</label>
                                        <input type="text" value={backupSettings.backupLocation} onChange={(e) => setBackupSettings({ ...backupSettings, backupLocation: e.target.value })} style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#FFFFFF', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
                                    </div>
                                </div>
                                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                    <button 
                                        type="button" 
                                        onClick={handleBackupNow} 
                                        disabled={loading}
                                        style={{
                                            padding: '8px 20px',
                                            background: 'rgba(59,130,246,0.15)',
                                            border: '1px solid rgba(59,130,246,0.3)',
                                            borderRadius: '6px',
                                            color: '#3B82F6',
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            fontSize: '13px',
                                            fontFamily: 'inherit',
                                            opacity: loading ? 0.5 : 1,
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!loading) {
                                                e.currentTarget.style.background = 'rgba(59,130,246,0.25)';
                                                e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(59,130,246,0.15)';
                                            e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)';
                                        }}
                                    >
                                        <BackupIcon /> {loading ? 'Creating Backup...' : 'Backup Now'}
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={loading} 
                                        style={{
                                            padding: '8px 20px',
                                            background: 'linear-gradient(135deg, #D69E2E, #B8860B)',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: '#FFFFFF',
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            fontFamily: 'inherit',
                                            opacity: loading ? 0.5 : 1
                                        }}
                                    >
                                        {loading ? 'Saving...' : 'Save Settings'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* Create Staff Modal */}
                {showCreateStaffModal && (
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
                            padding: '32px',
                            maxWidth: '500px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            border: '1px solid rgba(255,255,255,0.06)'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '20px'
                            }}>
                                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#FFFFFF', margin: '0' }}>
                                    Add Staff Member
                                </h2>
                                <button
                                    onClick={() => setShowCreateStaffModal(false)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'rgba(255,255,255,0.2)',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <CloseIcon />
                                </button>
                            </div>

                            <form onSubmit={handleCreateStaff}>
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: '4px' }}>First Name *</label>
                                    <input
                                        type="text"
                                        value={newStaff.firstName}
                                        onChange={(e) => setNewStaff({ ...newStaff, firstName: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            borderRadius: '8px',
                                            color: '#FFFFFF',
                                            fontSize: '14px',
                                            outline: 'none',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: '4px' }}>Last Name *</label>
                                    <input
                                        type="text"
                                        value={newStaff.lastName}
                                        onChange={(e) => setNewStaff({ ...newStaff, lastName: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            borderRadius: '8px',
                                            color: '#FFFFFF',
                                            fontSize: '14px',
                                            outline: 'none',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: '4px' }}>Email *</label>
                                    <input
                                        type="email"
                                        value={newStaff.email}
                                        onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            borderRadius: '8px',
                                            color: '#FFFFFF',
                                            fontSize: '14px',
                                            outline: 'none',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: '4px' }}>Password *</label>
                                    <input
                                        type="password"
                                        value={newStaff.password}
                                        onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                                        required
                                        minLength="6"
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            borderRadius: '8px',
                                            color: '#FFFFFF',
                                            fontSize: '14px',
                                            outline: 'none',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: '4px' }}>Role</label>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <input
                                                ref={roleInputRef}
                                                type="text"
                                                placeholder="Type or select role..."
                                                value={roleInput || newStaff.role || ''}
                                                onChange={(e) => {
                                                    setRoleInput(e.target.value);
                                                    setNewStaff({ ...newStaff, role: e.target.value });
                                                    if (e.target.value) {
                                                        setShowRoleDropdown(true);
                                                    }
                                                }}
                                                onFocus={() => {
                                                    if (roleInput || newStaff.role) {
                                                        setShowRoleDropdown(true);
                                                    }
                                                }}
                                                style={{
                                                    flex: 1,
                                                    padding: '10px 12px',
                                                    background: 'rgba(255,255,255,0.04)',
                                                    border: '1px solid rgba(255,255,255,0.06)',
                                                    borderRadius: '8px',
                                                    color: '#FFFFFF',
                                                    fontSize: '14px',
                                                    outline: 'none',
                                                    fontFamily: 'inherit',
                                                    transition: 'all 0.2s'
                                                }}
                                                onFocus={(e) => {
                                                    e.currentTarget.style.borderColor = 'rgba(214,158,46,0.3)';
                                                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                                }}
                                                onBlur={(e) => {
                                                    setTimeout(() => {
                                                        setShowRoleDropdown(false);
                                                    }, 200);
                                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                                                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={addRole}
                                                style={{
                                                    padding: '10px 14px',
                                                    background: 'linear-gradient(135deg, #D69E2E, #B8860B)',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    color: '#FFFFFF',
                                                    cursor: 'pointer',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    fontFamily: 'inherit',
                                                    whiteSpace: 'nowrap',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1.02)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                }}
                                            >
                                                Add New
                                            </button>
                                        </div>
                                        
                                        {showRoleDropdown && (filteredRoles.length > 0 || roleInput) && (
                                            <div style={{
                                                position: 'absolute',
                                                top: 'calc(100% + 4px)',
                                                left: 0,
                                                right: 0,
                                                background: '#1A1A1A',
                                                border: '1px solid rgba(255,255,255,0.06)',
                                                borderRadius: '8px',
                                                maxHeight: '200px',
                                                overflow: 'auto',
                                                zIndex: 100,
                                                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                                padding: '4px 0'
                                            }}>
                                                {filteredRoles.length > 0 ? (
                                                    filteredRoles.map((role) => (
                                                        <div
                                                            key={role}
                                                            onClick={() => selectRole(role)}
                                                            style={{
                                                                padding: '8px 14px',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                transition: 'all 0.2s',
                                                                color: '#FFFFFF',
                                                                fontSize: '13px'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.background = 'transparent';
                                                            }}
                                                        >
                                                            <span>{role}</span>
                                                            {newStaff.role === role && (
                                                                <span style={{ color: '#D69E2E' }}>
                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                                        <polyline points="20 6 9 17 4 12"/>
                                                                    </svg>
                                                                </span>
                                                            )}
                                                            {!['Pharmacist', 'Admin', 'Assistant', 'Manager'].includes(role) && (
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        deleteRole(role);
                                                                    }}
                                                                    style={{
                                                                        background: 'none',
                                                                        border: 'none',
                                                                        color: 'rgba(255,255,255,0.1)',
                                                                        cursor: 'pointer',
                                                                        padding: '4px',
                                                                        fontSize: '14px',
                                                                        transition: 'all 0.2s'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.color = '#EF4444';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.color = 'rgba(255,255,255,0.1)';
                                                                    }}
                                                                >
                                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                        <line x1="18" y1="6" x2="6" y2="18"/>
                                                                        <line x1="6" y1="6" x2="18" y2="18"/>
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div style={{
                                                        padding: '12px',
                                                        textAlign: 'center',
                                                        color: 'rgba(255,255,255,0.1)',
                                                        fontSize: '13px'
                                                    }}>
                                                        No matching roles. Type and click "Add New"
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.1)', marginTop: '4px' }}>
                                        Type to search, select from list, or add new role
                                    </div>
                                </div>

                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: '4px' }}>Phone</label>
                                    <input
                                        type="text"
                                        value={newStaff.phone}
                                        onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            borderRadius: '8px',
                                            color: '#FFFFFF',
                                            fontSize: '14px',
                                            outline: 'none',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: '4px' }}>Notification Email</label>
                                    <input
                                        type="email"
                                        value={newStaff.notificationEmail || ''}
                                        onChange={(e) => setNewStaff({ ...newStaff, notificationEmail: e.target.value })}
                                        placeholder="Email for password reset notifications"
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            borderRadius: '8px',
                                            color: '#FFFFFF',
                                            fontSize: '14px',
                                            outline: 'none',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.1)', marginTop: '2px' }}>
                                        This email will receive password reset links
                                    </div>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: '4px' }}>Address</label>
                                    <input
                                        type="text"
                                        value={newStaff.address}
                                        onChange={(e) => setNewStaff({ ...newStaff, address: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            borderRadius: '8px',
                                            color: '#FFFFFF',
                                            fontSize: '14px',
                                            outline: 'none',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                </div>

                                <div style={{
                                    display: 'flex',
                                    gap: '10px',
                                    justifyContent: 'flex-end'
                                }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateStaffModal(false)}
                                        style={{
                                            padding: '10px 20px',
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            borderRadius: '8px',
                                            color: 'rgba(255,255,255,0.4)',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            fontFamily: 'inherit'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        style={{
                                            padding: '10px 24px',
                                            background: 'linear-gradient(135deg, #D69E2E, #B8860B)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: '#FFFFFF',
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            fontFamily: 'inherit',
                                            opacity: loading ? 0.5 : 1
                                        }}
                                    >
                                        {loading ? 'Creating...' : 'Create Staff'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Product Modal */}
                {showDeleteProductModal && productToDelete && (
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
                            padding: '32px',
                            maxWidth: '450px',
                            width: '100%',
                            border: '1px solid rgba(255,255,255,0.06)'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '16px'
                            }}>
                                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#FFFFFF', margin: '0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <WarningIcon /> Delete Product
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowDeleteProductModal(false);
                                        setProductToDelete(null);
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'rgba(255,255,255,0.2)',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <CloseIcon />
                                </button>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '8px' }}>
                                    Are you sure you want to delete this product?
                                </p>
                                <div style={{
                                    background: 'rgba(239,68,68,0.05)',
                                    border: '1px solid rgba(239,68,68,0.1)',
                                    borderRadius: '8px',
                                    padding: '12px 16px'
                                }}>
                                    <p style={{ color: '#FFFFFF', fontSize: '14px', margin: '0 0 4px 0' }}>
                                        {productToDelete.name}
                                    </p>
                                    <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', margin: '0' }}>
                                        Code: {productToDelete.code || 'N/A'} • Stock: {productToDelete.quantityOnHand || 0}
                                    </p>
                                </div>
                                <p style={{ color: 'rgba(239,68,68,0.4)', fontSize: '11px', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <WarningIcon /> This action cannot be undone. All stock data will be lost.
                                </p>
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: '10px',
                                justifyContent: 'flex-end'
                            }}>
                                <button
                                    onClick={() => {
                                        setShowDeleteProductModal(false);
                                        setProductToDelete(null);
                                    }}
                                    style={{
                                        padding: '10px 20px',
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        borderRadius: '8px',
                                        color: 'rgba(255,255,255,0.4)',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontFamily: 'inherit'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteProduct(productToDelete._id)}
                                    disabled={deleteProductLoading}
                                    style={{
                                        padding: '10px 24px',
                                        background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#FFFFFF',
                                        cursor: deleteProductLoading ? 'not-allowed' : 'pointer',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        fontFamily: 'inherit',
                                        opacity: deleteProductLoading ? 0.5 : 1
                                    }}
                                >
                                    {deleteProductLoading ? 'Deleting...' : 'Delete Product'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Logout Button */}
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <button onClick={handleLogout} style={{
                        padding: '8px 20px',
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: '6px',
                        color: '#EF4444',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontFamily: 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                    }}>
                        <LogoutIcon /> Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;