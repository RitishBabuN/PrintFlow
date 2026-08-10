import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const ProfileModal = ({ isOpen, onClose }) => {
    const { user, updateUser } = useAuth();

    const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password'
    
    // Profile state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    // Password state
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Feedback state
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setPhone(user.phone || '');
            setError('');
            setSuccess('');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
    }, [isOpen]);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const { data } = await api.put('/api/users/profile', { name, email, phone });
            updateUser(data);
            setSuccess('Profile updated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            return setError('New passwords do not match');
        }

        if (newPassword.length < 6) {
            return setError('New password must be at least 6 characters');
        }

        setLoading(true);

        try {
            const { data } = await api.put('/api/users/profile', {
                oldPassword,
                newPassword
            });
            updateUser(data);
            setSuccess('Password changed successfully!');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error('Password change error details:', err);
            setError(err.response?.data?.message || err.message || 'Password change failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Account Settings & Security">
            <div className="flex-col gap-4">
                {/* Tab Navigation */}
                <div className="flex gap-2 border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>
                    <button
                        className={`btn text-sm flex-center gap-2 ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '0.4rem 1rem' }}
                        onClick={() => { setActiveTab('profile'); setError(''); setSuccess(''); }}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span>Profile</span>
                    </button>
                    <button
                        className={`btn text-sm flex-center gap-2 ${activeTab === 'password' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '0.4rem 1rem' }}
                        onClick={() => { setActiveTab('password'); setError(''); setSuccess(''); }}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        <span>Change Password</span>
                    </button>
                </div>

                {/* Color-Coded Acknowledgement Banners */}
                {error && (
                    <div 
                        className="text-danger p-3 text-sm font-semibold rounded border"
                        style={{ background: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' }}
                    >
                        Error: {error}
                    </div>
                )}
                {success && (
                    <div 
                        className="text-success p-3 text-sm font-semibold rounded border"
                        style={{ background: 'rgba(34, 197, 94, 0.15)', borderColor: 'rgba(34, 197, 94, 0.4)', color: '#22c55e' }}
                    >
                        Success: {success}
                    </div>
                )}

                {/* Profile Edit Form */}
                {activeTab === 'profile' && (
                    <form onSubmit={handleProfileSubmit} className="flex-col gap-4 mt-2">
                        <Input
                            label="Full Name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Input
                            label="Phone Number"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Enter contact number"
                        />
                        <Button type="submit" variant="primary" disabled={loading} className="mt-2">
                            {loading ? 'Saving Changes...' : 'Save Profile Changes'}
                        </Button>
                    </form>
                )}

                {/* Password Change Form */}
                {activeTab === 'password' && (
                    <form onSubmit={handlePasswordSubmit} className="flex-col gap-4 mt-2">
                        <Input
                            label="Current Password"
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                            placeholder="Enter current password"
                        />
                        <Input
                            label="New Password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            placeholder="Enter new password (min 6 chars)"
                        />
                        <Input
                            label="Confirm New Password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Confirm new password"
                        />
                        <Button type="submit" variant="primary" disabled={loading} className="mt-2">
                            {loading ? 'Updating Password...' : 'Verify Old & Change Password'}
                        </Button>
                    </form>
                )}
            </div>
        </Modal>
    );
};
