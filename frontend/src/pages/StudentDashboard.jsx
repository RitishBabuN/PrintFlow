import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const { balance, lockedBalance, updateBalances } = useWallet();
    const socket = useSocket();
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [waitMins, setWaitMins] = useState(0);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const [copies, setCopies] = useState(1);
    const [pageRange, setPageRange] = useState('all');
    const [color, setColor] = useState(false);
    const [doubleSided, setDoubleSided] = useState(false);
    const [isInstant, setIsInstant] = useState(true);
    const [scheduledTime, setScheduledTime] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        if (!user) {
            if (!localStorage.getItem('userInfo')) navigate('/login');
            return;
        }
        fetchDashboardData();

        if (socket) {
            socket.on('queueUpdated', (data) => {
                fetchDashboardData();
            });
        }

        return () => {
            if (socket) socket.off('queueUpdated');
        };
    }, [user, socket]);

    const fetchDashboardData = async () => {
        try {
            const [profileRes, jobsRes] = await Promise.all([
                api.get('/api/users/profile'),
                api.get('/api/print-jobs/myjobs')
            ]);

            updateBalances(profileRes.data.walletBalance, profileRes.data.lockedBalance);
            setJobs(jobsRes.data.jobs);
            setWaitMins(jobsRes.data.estimatedWaitMins);
        } catch (err) {
            console.error(err);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUploadClick = (e) => {
        e.preventDefault();
        if (!file) return;
        if (copies < 1) return setError('Copies must be at least 1');
        
        setError('');
        setShowConfirm(true);
    };

    const handleConfirmUpload = async () => {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('color', color);
        formData.append('doubleSided', doubleSided);
        formData.append('copies', copies);
        formData.append('pageRange', pageRange);
        formData.append('isInstant', isInstant);
        if (!isInstant && scheduledTime) {
            formData.append('scheduledTime', scheduledTime);
        }

        setUploading(true);
        setError('');

        try {
            await api.post('/api/print-jobs', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setFile(null);
            setShowConfirm(false);
            setCopies(1);
            setPageRange('all');
            fetchDashboardData();
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleTopup = async () => {
        const amount = prompt("Enter top-up amount (₹):");
        if (!amount || isNaN(amount)) return;

        try {
            await api.post('/api/users/topup', { amount: Number(amount) });
            fetchDashboardData();
        } catch (err) {
            alert("Topup failed");
        }
    };

    // Setup schedule limits
    const today = new Date();
    const minTime = new Date();
    if (minTime.getHours() < 10) minTime.setHours(10, 0, 0, 0);
    const minDateTime = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}T${String(minTime.getHours()).padStart(2, '0')}:${String(minTime.getMinutes()).padStart(2, '0')}`;
    const maxDateTime = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}T20:00`;

    // Estimation logic
    const estPages = file ? Math.max(1, Math.ceil(file.size / 50000)) : 1;
    const pageCost = color ? (doubleSided ? 10 : 14) : (doubleSided ? 2 : 3);
    const estCost = estPages * copies * pageCost;

    const getStatusColor = (status) => {
        switch (status) {
            case 'Collected': return 'text-success';
            case 'Failed': return 'text-danger';
            case 'Printing':
            case 'Accepted': return 'text-primary';
            default: return 'text-secondary';
        }
    };

    return (
        <div className="animate-fade-in grid-2 gap-4">
            <div className="flex-col gap-4">
                <Card title="Wallet Overview">
                    <div className="flex-col gap-2 mb-4">
                        <h2 className="text-3xl font-bold text-success">₹{(balance || 0).toFixed(2)}</h2>
                        <p className="text-warning text-sm font-semibold">Locked: ₹{(lockedBalance || 0).toFixed(2)}</p>
                    </div>
                    <Button variant="primary" fullWidth onClick={handleTopup}>Top Up Wallet</Button>
                </Card>

                <Card title="Estimated Wait Time">
                    <h2 className="text-3xl font-bold text-primary mb-2">~{waitMins} mins</h2>
                    <p className="text-secondary text-sm">Based on active queue traffic</p>
                </Card>
            </div>

            <div className="flex-col gap-4">
                <Card title="Submit Print Job">
                    {error && <div className="text-danger mb-4 p-2" style={{ background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem' }}>{error}</div>}
                    
                    {!showConfirm ? (
                        <form onSubmit={handleUploadClick} className="flex-col gap-4">
                            <Input
                                type="file"
                                onChange={handleFileChange}
                                required
                                accept=".pdf,.doc,.docx,.pptx"
                            />
                            
                            <div className="grid-2 gap-4">
                                <div>
                                    <label className="text-sm text-secondary font-semibold mb-1 block">Copies</label>
                                    <Input type="number" min="1" value={copies} onChange={(e) => setCopies(e.target.value)} required />
                                </div>
                                <div>
                                    <label className="text-sm text-secondary font-semibold mb-1 block">Page Range (e.g 1-5)</label>
                                    <Input type="text" placeholder="Default: all" value={pageRange} onChange={(e) => setPageRange(e.target.value)} />
                                </div>
                            </div>
                            
                            <div className="grid-2 gap-4 mt-2">
                                <label className="flex items-center gap-2 p-2 border rounded cursor-pointer" style={{ borderColor: 'var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                                    <input type="checkbox" checked={color} onChange={(e) => setColor(e.target.checked)} className="w-4 h-4" />
                                    <span className="text-sm font-semibold">Color Print (₹14/face)</span>
                                </label>
                                <label className="flex items-center gap-2 p-2 border rounded cursor-pointer" style={{ borderColor: 'var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                                    <input type="checkbox" checked={doubleSided} onChange={(e) => setDoubleSided(e.target.checked)} className="w-4 h-4" />
                                    <span className="text-sm font-semibold">Double Sided</span>
                                </label>
                            </div>

                            <div className="flex-col gap-2 mt-4 p-3 border rounded" style={{ borderColor: 'var(--border-color)', background: 'rgba(0,0,0,0.1)' }}>
                                <label className="text-sm font-bold text-primary">Print Timing</label>
                                <div className="flex gap-6 mt-1">
                                    <label className="flex gap-2 items-center cursor-pointer text-sm font-semibold">
                                        <input type="radio" checked={isInstant} onChange={() => setIsInstant(true)} className="w-4 h-4" /> Instant
                                    </label>
                                    <label className="flex gap-2 items-center cursor-pointer text-sm font-semibold">
                                        <input type="radio" checked={!isInstant} onChange={() => setIsInstant(false)} className="w-4 h-4" /> Schedule Later
                                    </label>
                                </div>
                                {!isInstant && (
                                    <div className="mt-2">
                                        <Input type="datetime-local" min={minDateTime} max={maxDateTime} value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} required />
                                        <p className="text-xs text-secondary mt-1 max-w-[300px]">Only accepting schedules between 10 AM and 8 PM today. Please observe the max limit of 5 jobs per 15m slot.</p>
                                    </div>
                                )}
                            </div>

                            <Button type="submit" variant="primary" disabled={!file}>
                                Advance Next
                            </Button>
                        </form>
                    ) : (
                        <div className="flex-col gap-4 p-6 border rounded" style={{ borderColor: 'var(--border-color)', background: 'rgba(0,0,0,0.2)' }}>
                            <h3 className="text-2xl font-bold text-primary">Confirm Verification</h3>
                            <div className="text-sm text-secondary bg-black bg-opacity-20 p-4 rounded flex-col gap-1 shadow-inner">
                                <p>File Data approx: <span className="font-semibold text-white">{estPages} pages</span></p>
                                <p>Copies required: <span className="font-semibold text-white">{copies}</span></p>
                                <p>Print Mode: <span className="font-semibold text-white">{color ? 'Color' : 'Black & White'}</span> • {doubleSided ? 'Double-Sided' : 'Single-Sided'}</p>
                                <p>Range Mode: <span className="font-semibold text-white">{pageRange || 'All Docs'}</span></p>
                                <p>Fulfilment: <span className="font-bold text-white">{isInstant ? 'Instant Queue' : `${new Date(scheduledTime).toLocaleString()}`}</span></p>
                            </div>
                            <h2 className="text-3xl font-bold text-success mt-2">Estimated Cost: ₹{(estCost || 0).toFixed(2)}</h2>
                            <p className="text-xs text-warning block">Note: The system securely deducts based on true PDF extraction where available, and accurately locks required funds.</p>
                            
                            <div className="flex gap-4 mt-2">
                                <Button variant="secondary" onClick={() => setShowConfirm(false)} disabled={uploading}>Go Back</Button>
                                <Button variant="primary" onClick={handleConfirmUpload} disabled={uploading}>
                                    {uploading ? 'Locking Funds & Submitting...' : 'Confirm & Finalize Request'}
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>

                <Card title="My Recent Jobs">
                    <div className="flex-col gap-2">
                        {jobs.length === 0 ? <p className="text-secondary">No recent print jobs.</p> : null}
                        {jobs.map(job => (
                            <div key={job._id} className="p-4" style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 className="font-semibold" style={{ wordBreak: 'break-all' }}>{job.fileName}</h4>
                                    <p className="text-sm text-secondary mt-1">
                                        {job.pages} pages • ₹{(job.lockedAmount || 0).toFixed(2)} {job.status === 'Submitted' || job.status === 'In Queue' ? '(Locked)' : ''}
                                    </p>
                                </div>
                                <span className={`badge ${getStatusColor(job.status)}`} style={{ background: 'rgba(255,255,255,0.05)' }}>
                                    {job.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default StudentDashboard;
