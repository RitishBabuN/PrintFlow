import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [revenue, setRevenue] = useState(0);

    useEffect(() => {
        if (!user) {
            if (!localStorage.getItem('userInfo')) navigate('/login');
            return;
        }
        if (user.role !== 'admin') {
            navigate('/login');
            return;
        }

        const fetchRevenue = async () => {
            try {
                const res = await api.get('/api/users/admin/revenue');
                setRevenue(res.data.totalRevenue);
            } catch (err) {
                console.error("Failed to fetch revenue", err);
            }
        };

        fetchRevenue();
    }, [user, navigate]);

    return (
        <div className="animate-fade-in flex-col gap-6">
            <div>
                <h2 className="text-3xl font-bold text-primary">Admin Dashboard</h2>
                <p className="text-secondary mb-6">System Overview and Reports</p>
            </div>

            <div className="grid-2 gap-4">
                <Card title="System Settings">
                    <p className="text-secondary mb-4">Manage global system settings like print cost, queue algorithms, etc.</p>
                    <Button variant="secondary">Configure Settings</Button>
                </Card>
                <Card title="Financial Reports">
                    <p className="text-secondary mb-2">View total revenue generated.</p>
                    <h2 className="text-4xl font-bold text-success mb-4">₹{revenue.toFixed(2)}</h2>
                    <Button variant="secondary">Generate Detailed Report</Button>
                </Card>
                <Card title="User Management">
                    <p className="text-secondary mb-4">Manage students, staff accounts and permissions.</p>
                    <Button variant="secondary">Manage Users</Button>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
