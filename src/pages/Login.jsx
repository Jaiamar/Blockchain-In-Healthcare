import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Stethoscope, Building } from 'lucide-react';

export default function Login() {
    const [role, setRole] = useState('patient');
    const [id, setId] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        login(role, id);
        navigate(`/dashboard/${role}`);
    };

    return (
        <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Shield size={32} color="var(--primary-color)" style={{ margin: '0 auto 1rem auto' }} />
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Welcome Back</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Sign in to continue to HealthChain</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Select Role</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                            <button
                                type="button"
                                onClick={() => setRole('patient')}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-sm)',
                                    border: `1px solid ${role === 'patient' ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                    background: role === 'patient' ? 'rgba(0, 242, 254, 0.1)' : 'transparent',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'
                                }}
                            >
                                <User size={20} color={role === 'patient' ? 'var(--primary-color)' : 'var(--text-secondary)'} />
                                <span style={{ fontSize: '0.75rem', color: role === 'patient' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>Patient</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setRole('doctor')}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-sm)',
                                    border: `1px solid ${role === 'doctor' ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                    background: role === 'doctor' ? 'rgba(0, 242, 254, 0.1)' : 'transparent',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'
                                }}
                            >
                                <Stethoscope size={20} color={role === 'doctor' ? 'var(--primary-color)' : 'var(--text-secondary)'} />
                                <span style={{ fontSize: '0.75rem', color: role === 'doctor' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>Doctor</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setRole('admin')}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-sm)',
                                    border: `1px solid ${role === 'admin' ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                    background: role === 'admin' ? 'rgba(0, 242, 254, 0.1)' : 'transparent',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'
                                }}
                            >
                                <Building size={20} color={role === 'admin' ? 'var(--primary-color)' : 'var(--text-secondary)'} />
                                <span style={{ fontSize: '0.75rem', color: role === 'admin' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>Admin</span>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>{role.charAt(0).toUpperCase() + role.slice(1)} ID</label>
                        <input
                            type="text"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            placeholder={`Enter your ${role} ID`}
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
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Password / Private Key (Optional)</label>
                        <input
                            type="password"
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

                    <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                        Login to Network
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Don't have an ID? <a href="/register" style={{ color: 'var(--primary-color)' }}>Register Node</a>
                    </div>
                </form>
            </div>
        </div>
    );
}
