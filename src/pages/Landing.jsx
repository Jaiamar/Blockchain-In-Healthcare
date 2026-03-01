import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Activity, Database } from 'lucide-react';

export default function Landing() {
    return (
        <div className="animate-fade-in" style={{ padding: '4rem 0', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 80, borderRadius: '24px', background: 'rgba(0, 242, 254, 0.1)', marginBottom: '2rem' }}>
                <Shield size={40} color="var(--primary-color)" />
            </div>

            <h1 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.1 }}>
                The Future of <br />
                <span className="text-gradient">Blockchain Healthcare</span>
            </h1>

            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
                Secure, permission-driven access to medical records. Empowering patients with complete control over their healthcare data through decentralized technology.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '5rem' }}>
                <Link to="/register" className="btn-primary" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}>
                    Get Started
                </Link>
                <Link to="/explorer" className="btn-secondary" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}>
                    View Explorer
                </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', textAlign: 'left' }}>
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <Lock size={32} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Patient Controlled</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Patients uniquely grant and revoke data access permissions to health professionals at any point in time.</p>
                </div>

                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <Database size={32} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Encrypted Blocks</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>All data is heavily encrypted before generation, with transaction hashes verified completely over the blockchain.</p>
                </div>

                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <Activity size={32} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Immutable Audit</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Every interaction generates an immutable audit log, providing administrators with transparent track records.</p>
                </div>
            </div>
        </div>
    );
}
