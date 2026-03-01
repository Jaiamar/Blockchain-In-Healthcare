import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LayoutDashboard, User, LogOut, Activity, Settings as SettingsIcon } from 'lucide-react';

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getDashboardLink = () => {
        if (!user) return '/';
        if (user.role === 'patient') return '/dashboard/patient';
        if (user.role === 'doctor') return '/dashboard/doctor';
        if (user.role === 'admin') return '/dashboard/admin';
        return '/';
    };

    return (
        <div className="app-container">
            <nav style={{
                padding: '1rem 2rem',
                borderBottom: 'var(--glass-border)',
                background: 'var(--bg-surface)',
                backdropFilter: 'blur(12px)',
                position: 'sticky',
                top: 0,
                zIndex: 50,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.25rem' }}>
                    <Shield color="var(--primary-color)" size={28} />
                    <span className="text-gradient">HealthChain</span>
                </Link>

                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <Link to="/explorer" style={{ color: location.pathname === '/explorer' ? 'var(--primary-color)' : 'var(--text-secondary)', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Activity size={18} />
                        Explorer
                    </Link>

                    {user ? (
                        <>
                            <Link to={getDashboardLink()} style={{ color: location.pathname.includes('/dashboard') ? 'var(--primary-color)' : 'var(--text-secondary)', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <LayoutDashboard size={18} />
                                Dashboard
                            </Link>
                            <Link to="/settings" style={{ color: location.pathname === '/settings' ? 'var(--primary-color)' : 'var(--text-secondary)', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <SettingsIcon size={18} />
                                Settings
                            </Link>
                            <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 0.5rem' }}></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{user.name}</div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'capitalize' }}>{user.role}</div>
                                    </div>
                                </div>
                                <button onClick={handleLogout} style={{ color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.5rem' }}>
                                    <LogOut size={18} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Link to="/login" className="btn-secondary">Login</Link>
                            <Link to="/register" className="btn-primary">Register</Link>
                        </div>
                    )}
                </div>
            </nav>

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
