import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Stethoscope, Building } from 'lucide-react';

export default function Register() {
    const [role, setRole] = useState('patient');
    const [name, setName] = useState('');
    const [id, setId] = useState(`USR-${Math.floor(Math.random() * 10000)}`);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleRegister = (e) => {
        e.preventDefault();
        login(role, id);
        navigate(`/dashboard/${role}`);
    };

    return (
        <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Shield size={32} color="var(--primary-color)" style={{ margin: '0 auto 1rem auto' }} />
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Initialize Node</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Register your identity on the healthcare blockchain</p>
                </div>

                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Node Type (Role)</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                            <button type="button" onClick={() => setRole('patient')} style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: `1px solid ${role === 'patient' ? 'var(--primary-color)' : 'var(--border-color)'}`, background: role === 'patient' ? 'rgba(0, 242, 254, 0.1)' : 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                <User size={20} color={role === 'patient' ? 'var(--primary-color)' : 'var(--text-secondary)'} />
                                <span style={{ fontSize: '0.75rem', color: role === 'patient' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>Patient</span>
                            </button>
                            <button type="button" onClick={() => setRole('doctor')} style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: `1px solid ${role === 'doctor' ? 'var(--primary-color)' : 'var(--border-color)'}`, background: role === 'doctor' ? 'rgba(0, 242, 254, 0.1)' : 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                <Stethoscope size={20} color={role === 'doctor' ? 'var(--primary-color)' : 'var(--text-secondary)'} />
                                <span style={{ fontSize: '0.75rem', color: role === 'doctor' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>Doctor</span>
                            </button>
                            <button type="button" onClick={() => setRole('admin')} style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: `1px solid ${role === 'admin' ? 'var(--primary-color)' : 'var(--border-color)'}`, background: role === 'admin' ? 'rgba(0, 242, 254, 0.1)' : 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                <Building size={20} color={role === 'admin' ? 'var(--primary-color)' : 'var(--text-secondary)'} />
                                <span style={{ fontSize: '0.75rem', color: role === 'admin' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>Admin</span>
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Full Name</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Satoshi Nakamoto" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', outline: 'none' }} onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'} onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Generated ID</label>
                            <input type="text" value={id} readOnly style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', outline: 'none', cursor: 'not-allowed' }} />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Create Private Key Path</label>
                        <input type="password" required placeholder="••••••••" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', outline: 'none' }} onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'} onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'} />
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(0, 242, 254, 0.05)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0, 242, 254, 0.1)' }}>
                        <strong>Security Notice:</strong> Your private key path is crucial. If lost, you will not be able to recover your account or revoke node access for future data encryption.
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                        Initialize & Register
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Already have a node? <a href="/login" style={{ color: 'var(--primary-color)' }}>Login</a>
                    </div>
                </form>
            </div>
        </div>
    );
}
