import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { ProfileModal } from './ProfileModal';

export const Navbar = () => {
    const { user, logout } = useAuth();
    const { balance } = useWallet();
    const navigate = useNavigate();

    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user) return null;

    return (
        <>
            <nav className="navbar flex-between">
                <div className="nav-brand">PrintFlow</div>
                <div className="flex-center gap-4">
                    {user.role === 'student' && (
                        <div className="glass-card p-2 flex-center gap-2" style={{ padding: '0.5rem 1rem' }}>
                            <span className="text-secondary text-sm">Wallet Balance:</span>
                            <span className="font-bold text-success">₹{balance?.toFixed(2) || '0.00'}</span>
                        </div>
                    )}
                    <div className="flex-center gap-2">
                        <span className="badge badge-primary" style={{ textTransform: 'uppercase' }}>{user.role}</span>
                        <span className="font-semibold text-primary">{user.name}</span>
                    </div>
                    <Button variant="secondary" onClick={() => setIsProfileOpen(true)} className="flex-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span>Profile</span>
                    </Button>
                    <Button variant="secondary" onClick={handleLogout}>
                        Logout
                    </Button>
                </div>
            </nav>

            <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        </>
    );
};
