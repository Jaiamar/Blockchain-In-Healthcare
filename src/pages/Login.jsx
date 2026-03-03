import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Stethoscope, Building } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const userData = await login(email, password);
            navigate(`/dashboard/${userData.role}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Shield size={32} color="var(--primary-color)" style={{ margin: '0 auto 1rem auto' }} />
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Welcome Back</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Sign in to continue to HealthChain</p>
                </div>

                {error && (
                    <div style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)', border: '1px solid red', color: 'red', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="satoshi@healthchain.network"
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                background: 'rgba(0,0,0,0.2)',
                                border: '1px solid var(--border-color)',
                                color: 'white',
                                outline: 'none',
                                transition: 'border 0.2s',
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Password / Private Key Path</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                background: 'rgba(0,0,0,0.2)',
                                border: '1px solid var(--border-color)',
                                color: 'white',
                                outline: 'none',
                                transition: 'border 0.2s',
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}>
                        {loading ? 'Authenticating Node...' : 'Login to Network'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Don't have an ID? <a href="/register" style={{ color: 'var(--primary-color)' }}>Register Node</a>
                    </div>
                </form>
            </div>
        </div>
    );
}
