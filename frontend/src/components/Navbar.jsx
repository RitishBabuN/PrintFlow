import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';

export const Navbar = () => {
    const { user, logout } = useAuth();
    const { balance } = useWallet();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user) return null;

    return (
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
                <Button variant="secondary" onClick={handleLogout}>Logout</Button>
            </div>
        </nav>
    );
};
