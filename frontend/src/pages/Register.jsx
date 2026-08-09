import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        if (phone && !/^\+?[0-9]{7,15}$/.test(phone.trim())) {
            return setError('Please enter a valid phone number');
        }

        setLoading(true);

        try {
            const { data } = await api.post('/api/users/register', {
                name,
                email,
                phone,
                password,
                role: 'student'
            });

            login(data);
            navigate('/student');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-center animate-fade-in" style={{ minHeight: '85vh', padding: '2rem 1rem' }}>
            <Card className="w-full" style={{ maxWidth: '440px' }}>
                <h2 className="text-3xl font-bold text-center mb-1 text-primary">PrintFlow</h2>
                <h3 className="text-xl text-center mb-6 text-secondary">Student Registration</h3>

                {error && (
                    <div className="text-danger text-center mb-4 p-2 text-sm" style={{ background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex-col gap-4">
                    <Input
                        label="Full Name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="John Doe"
                    />
                    <Input
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="student@example.com"
                    />
                    <Input
                        label="Phone Number"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        placeholder="+91 9876543210"
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Create a password"
                    />
                    <Input
                        label="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="Confirm password"
                    />
                    <Button type="submit" variant="primary" fullWidth disabled={loading} className="mt-2">
                        {loading ? 'Creating Account...' : 'Register Student Account'}
                    </Button>
                </form>

                <div className="text-center mt-6 text-sm text-secondary">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary font-semibold hover:underline">
                        Sign In
                    </Link>
                </div>
            </Card>
        </div>
    );
};

export default Register;
