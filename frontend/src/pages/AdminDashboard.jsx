import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [revenue, setRevenue] = useState(0);
    const [queue, setQueue] = useState([]);
    
    // Modal states
    const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'student' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            if (!localStorage.getItem('userInfo')) navigate('/login');
            return;
        }
        if (user.role !== 'admin') {
            navigate('/login');
            return;
        }

        fetchDashboardData();
    }, [user, navigate]);

    const fetchDashboardData = async () => {
        try {
            const [revRes, queueRes] = await Promise.all([
                api.get('/api/users/admin/revenue'),
                api.get('/api/print-jobs/queue')
            ]);
            setRevenue(revRes.data.totalRevenue);
            setQueue(queueRes.data);
        } catch (err) {
            console.error("Failed to fetch admin data", err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get('/api/users/admin/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleOpenUsers = () => {
        setIsUsersModalOpen(true);
        fetchUsers();
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await api.delete(`/api/users/admin/users/${id}`);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Delete failed');
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/api/users/admin/users', newUser);
            setNewUser({ name: '', email: '', password: '', role: 'student' });
            fetchUsers();
            alert('User created successfully');
        } catch (err) {
            alert(err.response?.data?.message || 'Create failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateReport = async () => {
        try {
            const res = await api.get('/api/users/admin/reports');
            const data = res.data;
            
            // Generate CSV
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "Type,User,Email,Amount/Cost,Date,Status\n";
            
            data.transactions.forEach(t => {
                csvContent += `Transaction,${t.userId?.name || 'N/A'},${t.userId?.email || 'N/A'},${t.amount},${new Date(t.createdAt).toLocaleString()},${t.status}\n`;
            });
            data.jobs.forEach(j => {
                csvContent += `PrintJob,${j.userId?.name || 'N/A'},${j.userId?.email || 'N/A'},${j.lockedAmount},${new Date(j.createdAt).toLocaleString()},${j.status}\n`;
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `printflow_audit_report_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
        } catch (err) {
            alert('Failed to generate report');
        }
    };

    const handleSaveSettings = (e) => {
        e.preventDefault();
        alert('System settings updated globally across the network! (Simulated)');
        setIsSettingsModalOpen(false);
    };

    return (
        <div className="animate-fade-in flex-col gap-6">
            <div>
                <h2 className="text-3xl font-bold text-primary">Admin Dashboard</h2>
                <p className="text-secondary mb-6">System Overview and Reports</p>
            </div>

            <div className="grid-2 gap-4">
                <Card title="System Settings">
                    <p className="text-secondary mb-4">Manage global system settings like print cost, queue algorithms, etc.</p>
                    <Button variant="secondary" onClick={() => setIsSettingsModalOpen(true)}>Configure Settings</Button>
                </Card>
                <Card title="Financial Reports">
                    <p className="text-secondary mb-2">View total revenue generated.</p>
                    <h2 className="text-4xl font-bold text-success mb-4">₹{revenue.toFixed(2)}</h2>
                    <Button variant="secondary" onClick={handleGenerateReport}>Generate Detailed Report</Button>
                </Card>
                <Card title="User Management">
                    <p className="text-secondary mb-4">Manage students, staff accounts and permissions.</p>
                    <Button variant="secondary" onClick={handleOpenUsers}>Manage Users</Button>
                </Card>
            </div>

            <Card className="w-full mt-8">
                <h3 className="text-2xl font-bold mb-6">Live Print Queue</h3>
                <div className="flex-col gap-2" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                    {queue.length === 0 ? <p className="text-secondary">Queue is empty.</p> : null}
                    {queue.map((job) => (
                        <div key={job._id} className="p-4" style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h4 className="font-bold">{job.fileName}</h4>
                                <p className="text-sm text-secondary">
                                    User: <span className="text-primary">{job.userId?.name}</span> • Pages: {job.pages} • {job.printConfig?.color ? 'Color' : 'B&W'} • {job.printConfig?.doubleSided ? 'Double' : 'Single'}
                                </p>
                            </div>
                            <span className="badge badge-primary">{job.status}</span>
                        </div>
                    ))}
                </div>
            </Card>

            <Modal isOpen={isUsersModalOpen} onClose={() => setIsUsersModalOpen(false)} title="Manage System Users">
                <div className="flex-col gap-4">
                    <form onSubmit={handleCreateUser} className="p-4 border rounded" style={{ borderColor: 'var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                        <h4 className="font-semibold mb-2">Add New User</h4>
                        <div className="grid-2 gap-4">
                            <Input placeholder="Name" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} required />
                            <Input type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} required />
                            <Input type="password" placeholder="Password" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} required />
                            <select className="input-field" value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})}>
                                <option value="student">Student</option>
                                <option value="staff">Staff</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <Button type="submit" variant="primary" className="mt-4" disabled={loading}>Create User</Button>
                    </form>

                    <h4 className="font-semibold mt-4">Current Users Network</h4>
                    <div className="flex-col gap-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {users.map(u => (
                            <div key={u._id} className="p-3 border rounded flex-between" style={{ borderColor: 'var(--border-color)' }}>
                                <div>
                                    <p className="font-bold">{u.name} <span className="badge badge-primary">{u.role}</span></p>
                                    <p className="text-sm text-secondary">{u.email} • Bal: ₹{u.walletBalance}</p>
                                </div>
                                {u.role !== 'admin' && (
                                    <Button variant="danger" onClick={() => handleDeleteUser(u._id)}>Delete</Button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} title="Configure Global Settings">
                <form onSubmit={handleSaveSettings} className="flex-col gap-4">
                    <p className="text-secondary">Note: You are configuring global tier definitions. These override standard settings.</p>
                    <div className="grid-2 gap-4">
                        <div>
                            <label className="text-sm">Base Cost B&W (₹)</label>
                            <Input type="number" defaultValue="2" min="1" step="0.5" />
                        </div>
                        <div>
                            <label className="text-sm">Base Cost Color (₹)</label>
                            <Input type="number" defaultValue="14" min="1" step="1" />
                        </div>
                        <div>
                            <label className="text-sm">Max Queue Length Slot Limit</label>
                            <Input type="number" defaultValue="5" min="1" />
                        </div>
                        <div>
                            <label className="text-sm">Store Operating Time (hh:mm)</label>
                            <Input type="text" defaultValue="10:00 - 20:00" />
                        </div>
                    </div>
                    <Button type="submit" variant="primary">Confirm Changes</Button>
                </form>
            </Modal>
        </div>
    );
};

export default AdminDashboard;
