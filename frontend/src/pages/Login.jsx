import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await api.post('/api/users/login', { email, password });
            login(data);
            if (data.role === 'admin') {
                navigate('/admin');
            } else if (data.role === 'staff') {
                navigate('/staff');
            } else {
                navigate('/student');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setLoading(true);
            setError('');
            const { data } = await api.post('/api/users/google-auth', {
                credential: credentialResponse.credential
            });
            login(data);
            if (data.role === 'admin') {
                navigate('/admin');
            } else if (data.role === 'staff') {
                navigate('/staff');
            } else {
                navigate('/student');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Google sign-in failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError('Google authentication was cancelled or failed');
    };

    return (
        <div className="flex-center animate-fade-in" style={{ minHeight: '80vh' }}>
            <Card className="w-full" style={{ maxWidth: '400px' }}>
                <h2 className="text-3xl font-bold text-center mb-2 text-primary">PrintFlow</h2>
                <h3 className="text-xl text-center mb-6 text-secondary">Account Login</h3>

                {error && <div className="text-danger text-center mb-4 p-2" style={{ background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} className="flex-col gap-4">
                    <Input
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="student@example.com"
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Enter password"
                    />
                    <Button type="submit" variant="primary" fullWidth disabled={loading}>
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </Button>
                </form>

                <div className="flex-center my-4 gap-2">
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                    <span className="text-sm text-secondary">OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                </div>

                <div className="flex-center w-full">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        theme="filled_dark"
                        shape="pill"
                        width="100%"
                    />
                </div>

                <div className="text-center mt-6 text-sm text-secondary">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary font-semibold hover:underline">
                        Register as Student
                    </Link>
                </div>
            </Card>
        </div>
    );
};

export default Login;
