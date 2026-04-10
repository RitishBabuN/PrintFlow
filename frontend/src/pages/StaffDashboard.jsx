import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

const StaffDashboard = () => {
    const { user, logout } = useAuth();
    const socket = useSocket();
    const navigate = useNavigate();

    const [queue, setQueue] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) {
            if (!localStorage.getItem('userInfo')) navigate('/login');
            return;
        }
        if (user.role === 'student') return navigate('/login');
        
        fetchQueue();

        if (socket) {
            socket.on('queueUpdated', () => {
                fetchQueue();
            });
        }
        return () => {
            if (socket) socket.off('queueUpdated');
        }
    }, [user, socket]);

    const fetchQueue = async () => {
        try {
            const res = await api.get('/api/print-jobs/queue');
            setQueue(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAction = async (jobId, action, status) => {
        try {
            if (action === 'accept') {
                await api.put(`/api/print-jobs/${jobId}/accept`);
            } else if (action === 'status') {
                await api.put(`/api/print-jobs/${jobId}/status`, { status });
            }
            fetchQueue();
        } catch (err) {
            setError(err.response?.data?.message || 'Action failed');
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="flex-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-primary">Staff Control Panel</h2>
                    <p className="text-secondary">Manage Print Queue</p>
                </div>
            </div>

            {error && <div className="text-danger mb-4 p-2" style={{ background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem' }}>{error}</div>}

            <Card className="w-full">
                <h3 className="text-2xl font-bold mb-6">Active Print Queue</h3>
                <div className="flex-col gap-4">
                    {queue.length === 0 ? <p className="text-secondary">Queue is empty.</p> : null}
                    {queue.map((job, index) => {
                        const timeUntil = job.scheduledTime ? (new Date(job.scheduledTime) - new Date()) / 60000 : null;
                        const isUrgent = timeUntil !== null && timeUntil <= 30;
                        const borderColor = index === 0 ? '1px solid var(--primary-color)' : (isUrgent ? '1px solid #ef4444' : '1px solid var(--border-color)');
                        const bgColor = index === 0 ? 'rgba(59, 130, 246, 0.1)' : (isUrgent ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0,0,0,0.3)');

                        return (
                        <div key={job._id} className="p-6" style={{
                            background: bgColor,
                            border: borderColor,
                            borderRadius: '12px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            opacity: index === 0 ? 1 : 0.6 // visually lock others
                        }}>
                            <div>
                                <h4 className="text-xl font-bold">{job.fileName}</h4>
                                <p className="text-sm text-secondary mt-1">
                                    User: <span className="text-primary font-semibold">{job.userId?.name}</span> | Pages: {job.pages} | Config: {job.printConfig?.color ? 'Color' : 'B&W'}, {job.printConfig?.doubleSided ? 'Double' : 'Single'} | Copies: {job.printConfig?.copies || 1}
                                </p>
                                {job.scheduledTime && (
                                    <div className={`mt-2 text-sm font-bold ${isUrgent ? 'text-danger' : 'text-primary'}`}>
                                        📅 Scheduled: {new Date(job.scheduledTime).toLocaleString()} {isUrgent && '(Needs Prep Soon)'}
                                    </div>
                                )}
                                <div className="mt-2">
                                    <span className="badge badge-primary">
                                        Status: {job.status}
                                    </span>
                                </div>
                            </div>

                            <div className="flex-center gap-2">
                                {index === 0 && (
                                    <>
                                        {(job.status === 'Submitted' || job.status === 'In Queue') && (
                                            <Button variant="primary" onClick={() => handleAction(job._id, 'accept')}>Accept Job</Button>
                                        )}
                                        {job.status === 'Accepted' && (
                                            <>
                                                <a href={`${api.defaults.baseURL || 'http://localhost:5000'}/uploads/${job.fileUrl}`} download className="btn btn-secondary" target="_blank" rel="noopener noreferrer">
                                                    ⬇️ Download File
                                                </a>
                                                <Button variant="primary" onClick={() => handleAction(job._id, 'status', 'Printing')}>Start Printing</Button>
                                            </>
                                        )}
                                        {job.status === 'Printing' && (
                                            <>
                                                <a href={`${api.defaults.baseURL || 'http://localhost:5000'}/uploads/${job.fileUrl}`} download className="btn btn-secondary" target="_blank" rel="noopener noreferrer">
                                                    ⬇️ Download File
                                                </a>
                                                <Button variant="success" onClick={() => handleAction(job._id, 'status', 'Ready for Collection')}>Mark Ready</Button>
                                            </>
                                        )}
                                        {job.status === 'Ready for Collection' && (
                                            <Button variant="secondary" onClick={() => handleAction(job._id, 'status', 'Collected')}>Handed Over</Button>
                                        )}
                                        <Button variant="danger" onClick={() => handleAction(job._id, 'status', 'Failed')}>Reject/Unlock</Button>
                                    </>
                                )}
                                {index > 0 && <span className="text-warning text-sm font-bold">[LOCKED]</span>}
                            </div>
                        </div>
                    )})}
                </div>
            </Card>
        </div>
    );
};

export default StaffDashboard;
