import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, Shield, Key, Bell, User, Check } from 'lucide-react';

export default function Settings() {
    const { user } = useAuth();
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    if (!user) {
        return (
            <div className="glass-panel animate-fade-in" style={{ padding: '4rem', textAlign: 'center' }}>
                <h2>Please Login</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>You must be authenticated to view settings.</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <SettingsIcon size={32} color="var(--primary-color)" />
                <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Profile & Settings</h1>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={20} color="var(--primary-color)" /> Identity Settings
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Full Name</label>
                        <input type="text" defaultValue={user.name} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', outline: 'none' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Network ID</label>
                        <input type="text" value={user.id} readOnly style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', outline: 'none', cursor: 'not-allowed' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Role</label>
                        <input type="text" value={user.role.charAt(0).toUpperCase() + user.role.slice(1)} readOnly style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', outline: 'none', cursor: 'not-allowed' }} />
                    </div>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={20} color="var(--primary-color)" /> Security & Privacy
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <div>
                            <div style={{ fontWeight: 500, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Key size={16} /> Update Private Key</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Used for decrypting blocks and signing smart contracts.</div>
                        </div>
                        <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Modify Key</button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: 500, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Bell size={16} /> Notification Alerts</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Get notified when your records are accessed on the chain.</div>
                        </div>
                        <div style={{ width: 44, height: 24, borderRadius: 12, background: 'var(--primary-color)', position: 'relative', cursor: 'pointer' }}>
                            <div style={{ width: 20, height: 20, borderRadius: 10, background: 'white', position: 'absolute', top: 2, left: 22 }} />
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ textAlign: 'right' }}>
                {saved && <span style={{ color: 'var(--success)', marginRight: '1rem', fontSize: '0.875rem' }}><Check size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.25rem' }} />Saved successfully</span>}
                <button onClick={handleSave} className="btn-primary" style={{ padding: '0.75rem 2rem' }}>Save Changes</button>
            </div>

        </div>
    );
}
